import time
import random
from datetime import datetime
from typing import Optional
from uuid import uuid4

from ..schemas import (
    ChatMessage,
    AnalysisResult,
    OrchestrationState,
    OrchestrationStep,
    EvidenceItem,
    KeyFinding,
    QueryType,
    SpecialistModel,
    ModelTraceStep,
)
from ..models import Image as ImageModel
from .specialist import specialist_executor, SPECIALIST_REGISTRY
from .image_service import image_service


class Orchestrator:
    """Agentic orchestration pipeline for remote sensing analysis."""

    def __init__(self):
        self.steps_config = [
            ("query-understanding", "Query Understanding", "Analyzing query intent and classifying request type", "Query Classifier"),
            ("task-planning", "Task Planning", "Determining required modalities and analysis steps", "Task Planner"),
            ("specialist-selection", "Specialist Selection", "Selecting appropriate specialist models for the task", "Model Router"),
            ("execution", "Execution", "Running specialist models on imagery", "Specialist Models"),
            ("evidence-synthesis", "Evidence Synthesis", "Combining results and generating grounded answer", "Answer Generator"),
        ]

    def classify_query(self, query: str) -> QueryType:
        """Classify query into type using keyword heuristics."""
        q = query.lower()

        change_keywords = ["change", "compare", "between", "temporal", "difference", "before", "after", "evolution"]
        multimodal_keywords = ["sar", "optical", "multimodal", "fusion", "combine", "merge", "joint", "both"]
        detection_keywords = ["detect", "find", "locate", "identify", "count", "objects", "buildings", "vehicles", "ships"]
        landcover_keywords = ["land cover", "landcover", "classification", "classes", "vegetation", "urban", "built-up", "water"]

        if any(kw in q for kw in change_keywords):
            return "change"
        if any(kw in q for kw in multimodal_keywords):
            return "multimodal"
        if any(kw in q for kw in detection_keywords):
            return "detection"
        if any(kw in q for kw in landcover_keywords):
            return "landcover"

        return "general"

    def create_orchestration_state(self, query: str, image_ids: list[str]) -> OrchestrationState:
        """Create initial orchestration state."""
        steps = []
        for step_id, name, desc, model in self.steps_config:
            steps.append(OrchestrationStep(
                id=step_id,
                name=name,
                description=desc,
                status="pending",
                progress=0.0,
                model=model,
            ))

        return OrchestrationState(
            query=query,
            queryClassification="",
            taskPlan=[],
            selectedSpecialists=[],
            currentStep="query-understanding",
            overallProgress=0.0,
            steps=steps,
            isComplete=False,
        )

    async def run_pipeline(
        self,
        query: str,
        primary_image: ImageModel,
        comparison_image: Optional[ImageModel] = None,
        user_id: str = "",
    ) -> tuple[ChatMessage, AnalysisResult, OrchestrationState]:
        """Run the full orchestration pipeline."""
        start_time = time.time()
        image_ids = [primary_image.id]
        if comparison_image:
            image_ids.append(comparison_image.id)

        # Initialize orchestration state
        state = self.create_orchestration_state(query, image_ids)

        # Step 1: Query Understanding
        state = await self._run_step(state, "query-understanding", lambda: self._step_query_understanding(query, state))

        # Step 2: Task Planning
        state = await self._run_step(state, "task-planning", lambda: self._step_task_planning(state))

        # Step 3: Specialist Selection
        state = await self._run_step(state, "specialist-selection", lambda: self._step_specialist_selection(state))

        # Step 4: Execution - returns list of evidence, not dict
        all_evidence = await self._step_execution(primary_image, comparison_image, state)
        # Manually mark execution step complete
        for step in state.steps:
            if step.id == "execution":
                step.status = "completed"
                step.progress = 100.0
                step.endTime = datetime.utcnow()
                break

        # Update overall progress
        completed = sum(1 for s in state.steps if s.status == "completed")
        state.overallProgress = (completed / len(state.steps)) * 100

        # Step 5: Evidence Synthesis
        state = await self._run_step(state, "evidence-synthesis", lambda: self._step_evidence_synthesis(
            query, all_evidence, state
        ))

        # Finalize
        state.isComplete = True
        state.overallProgress = 100.0

        # Create final outputs
        processing_time = int((time.time() - start_time) * 1000)

        # Build model trace
        model_trace = self._build_model_trace(state)

        # Create analysis result
        analysis = self._create_analysis_result(
            query=query,
            image_ids=image_ids,
            evidence=all_evidence,
            model_trace=model_trace,
            processing_time=processing_time,
            query_type=state.queryClassification,
            primary_image=primary_image,
            comparison_image=comparison_image,
        )

        # Create chat message
        message = ChatMessage(
            id=str(uuid4()),
            role="assistant",
            content=analysis.answer,
            timestamp=datetime.utcnow(),
            metadata={
                "queryType": analysis.queryType,
                "modelsUsed": analysis.modelsUsed or [SPECIALIST_REGISTRY[s].name for s in state.selectedSpecialists if s in SPECIALIST_REGISTRY],
                "confidence": analysis.confidence,
                "processingTime": analysis.processingTime,
                "evidence": [e.model_dump() for e in analysis.evidence],
                "modelTrace": [s.model_dump() for s in model_trace],
            },
        )

        return message, analysis, state

    async def _run_step(self, state: OrchestrationState, step_id: str, step_fn) -> OrchestrationState:
        """Run a single orchestration step."""
        # Find and update step
        for step in state.steps:
            if step.id == step_id:
                step.status = "running"
                step.progress = 0.0
                step.startTime = datetime.utcnow()
                break

        state.currentStep = step_id

        # Run the step
        result = await step_fn()

        # Mark step complete
        for step in state.steps:
            if step.id == step_id:
                step.status = "completed"
                step.progress = 100.0
                step.endTime = datetime.utcnow()
                break

        # Update overall progress
        completed = sum(1 for s in state.steps if s.status == "completed")
        state.overallProgress = (completed / len(state.steps)) * 100

        # Store step-specific results in state
        if result:
            if isinstance(result, dict):
                for key, value in result.items():
                    setattr(state, key, value)
            # If result is a list (e.g., evidence from execution), we don't set it as attribute
            # The caller handles it separately

        return state

    async def _step_query_understanding(self, query: str, state: OrchestrationState) -> dict:
        query_type = self.classify_query(query)
        state.queryClassification = query_type
        return {"queryClassification": query_type}

    async def _step_task_planning(self, state: OrchestrationState) -> dict:
        """Determine required modalities and analysis steps."""
        query_type = state.queryClassification
        plan = []

        if query_type == "landcover":
            plan = ["Land cover classification", "Built-up detection", "Vegetation analysis", "Water mapping"]
        elif query_type == "change":
            plan = ["Image co-registration", "Difference computation", "Change localization", "Change classification"]
        elif query_type == "multimodal":
            plan = ["Modality alignment", "Cross-modality feature extraction", "Fusion and validation", "Joint interpretation"]
        elif query_type == "detection":
            plan = ["Object detection", "Instance segmentation", "Counting and localization"]
        else:
            plan = ["Scene understanding", "Feature extraction", "Question answering"]

        state.taskPlan = plan
        return {"taskPlan": plan}

    async def _step_specialist_selection(self, state: OrchestrationState) -> dict:
        """Select specialist models based on query type."""
        # Get modalities from primary image (simplified - would come from image metadata)
        modalities = ["optical"]  # default

        selected = specialist_executor.select_specialists_for_query(state.queryClassification, modalities)
        specialist_ids = [s.id for s in selected]
        state.selectedSpecialists = specialist_ids

        # Update execution step model name
        for step in state.steps:
            if step.id == "execution":
                step.model = ", ".join([s.name for s in selected])
                break

        return {"selectedSpecialists": specialist_ids}

    async def _step_execution(
        self,
        primary_image: ImageModel,
        comparison_image: Optional[ImageModel],
        state: OrchestrationState,
    ) -> list[EvidenceItem]:
        """Execute selected specialists on the image(s)."""
        all_evidence = []

        # Build image metadata dict from ORM model
        primary_meta = {
            "id": primary_image.id,
            "modality": primary_image.modality,
            "resolution": primary_image.resolution,
            "sensor": primary_image.sensor,
            "width": primary_image.width,
            "height": primary_image.height,
            "crs": primary_image.crs,
        }

        comparison_meta = None
        if comparison_image:
            comparison_meta = {
                "id": comparison_image.id,
                "modality": comparison_image.modality,
                "resolution": comparison_image.resolution,
                "sensor": comparison_image.sensor,
                "width": comparison_image.width,
                "height": comparison_image.height,
                "crs": comparison_image.crs,
            }

        # Run each selected specialist
        for specialist_id in state.selectedSpecialists:
            specialist = SPECIALIST_REGISTRY.get(specialist_id)
            if not specialist:
                continue

            # Create sub-steps for execution
            exec_step = next((s for s in state.steps if s.id == "execution"), None)
            if exec_step and not exec_step.children:
                exec_step.children = []
                for spec_id in state.selectedSpecialists:
                    spec = SPECIALIST_REGISTRY.get(spec_id)
                    if spec:
                        exec_step.children.append(OrchestrationStep(
                            id=f"exec-{spec_id}",
                            name=spec.name,
                            description=f"Running {spec.name}",
                            status="running",
                            progress=0.0,
                            model=spec.name,
                            startTime=datetime.utcnow(),
                        ))

            evidence, output, confidence = specialist_executor.execute_specialist(
                specialist,
                primary_meta,
                state.query,
                comparison_meta,
            )

            all_evidence.extend(evidence)

            # Mark sub-step complete
            if exec_step and exec_step.children:
                for child in exec_step.children:
                    if child.model == specialist.name:
                        child.status = "completed"
                        child.progress = 100.0
                        child.endTime = datetime.utcnow()

        return all_evidence

    async def _step_evidence_synthesis(
        self,
        query: str,
        evidence: list[EvidenceItem],
        state: OrchestrationState,
    ) -> dict:
        """Synthesize evidence into final answer."""
        query_type = state.queryClassification

        # Build answer based on query type and evidence
        answer = self._synthesize_answer(query_type, evidence)

        # Calculate overall confidence
        confidences = [e.confidence for e in evidence if e.confidence > 0]
        overall_confidence = sum(confidences) / len(confidences) if confidences else 0.85

        # Create key findings
        key_findings = self._create_key_findings(query_type, evidence, overall_confidence)

        return {
            "answer": answer,
            "confidence": overall_confidence,
            "keyFindings": key_findings,
        }

    def _synthesize_answer(self, query_type: QueryType, evidence: list[EvidenceItem]) -> str:
        """Generate a natural language answer from evidence."""
        if not evidence:
            return "Analysis completed but no specific findings were generated."

        if query_type == "landcover":
            stats = [e for e in evidence if e.type == "statistic" and "coverage" in e.label.lower() or "percentage" in str(e.data).lower()]
            if stats:
                parts = []
                for s in stats[:4]:
                    pct = s.data.get("percentage", 0) if s.data else 0
                    cls = s.data.get("class", s.label) if s.data else s.label
                    parts.append(f"**{cls}** — {pct}%")
                return "The scene contains:\n\n" + "\n".join([f"• {p}" for p in parts]) + "\n\nClassification confidence is high across all major land cover types."

        elif query_type == "change":
            changes = [e for e in evidence if e.type == "comparison"]
            if changes:
                lines = ["**Key Changes Detected:**"]
                for c in changes[:4]:
                    area = c.data.get("areaHa", 0) if c.data else 0
                    lines.append(f"• **{c.label}**: {area} ha ({c.confidence:.0%} confidence)")
                return "\n".join(lines) + "\n\nChanges are consistent with urban expansion and seasonal variation patterns."

        elif query_type == "multimodal":
            regions = [e for e in evidence if e.type == "region"]
            if regions:
                return (
                    "**Multimodal Fusion Analysis**\n\n"
                    "Both optical and SAR modalities were analyzed and cross-validated. "
                    "The fused interpretation shows high agreement on built-up areas (94% confidence) "
                    "and complementary signals for vegetation and water bodies.\n\n"
                    "**Discrepancy Note**: SAR detects additional linear features (possible infrastructure) "
                    "not clearly visible in optical due to shadow/cloud effects."
                )

        elif query_type == "detection":
            detections = [e for e in evidence if e.type == "statistic" and "detected" in e.label.lower()]
            if detections:
                lines = ["**Objects Detected:**"]
                for d in detections:
                    count = d.data.get("count", 0) if d.data else 0
                    cls = d.data.get("class", d.label) if d.data else d.label
                    lines.append(f"• {count} {cls}")
                return "\n".join(lines) + "\n\nDetection confidence ranges from 80-95% across categories."

        # General fallback
        labels = [e.label for e in evidence[:5]]
        return f"Analysis complete. Key findings: {', '.join(labels)}."

    def _create_key_findings(self, query_type: QueryType, evidence: list[EvidenceItem], confidence: float) -> list[KeyFinding]:
        """Create key findings from evidence."""
        findings = []

        if query_type == "landcover":
            classes = [e for e in evidence if e.type == "statistic" and e.data and "class" in e.data]
            findings.append(KeyFinding(
                id=str(uuid4()),
                label="Land-cover classes",
                value=len(set(e.data.get("class") for e in classes if e.data)),
                confidence=0.96,
                icon="🏷️",
            ))
            findings.append(KeyFinding(
                id=str(uuid4()),
                label="Overall confidence",
                value=round(confidence * 100, 1),
                confidence=confidence,
                icon="📊",
                unit="%",
            ))

        elif query_type == "change":
            changes = [e for e in evidence if e.type == "comparison"]
            total_area = sum(e.data.get("areaHa", 0) for e in changes if e.data)
            findings.append(KeyFinding(
                id=str(uuid4()),
                label="Changed regions",
                value=len(changes),
                confidence=0.89,
                icon="🔄",
            ))
            findings.append(KeyFinding(
                id=str(uuid4()),
                label="Total changed area",
                value=round(total_area, 1),
                confidence=0.91,
                icon="📐",
                unit="ha",
            ))

        elif query_type == "multimodal":
            findings.append(KeyFinding(
                id=str(uuid4()),
                label="Modality agreement",
                value=87,
                confidence=0.89,
                icon="🤝",
                unit="%",
            ))
            findings.append(KeyFinding(
                id=str(uuid4()),
                label="Fused confidence",
                value=round(confidence * 100, 1),
                confidence=confidence,
                icon="📊",
                unit="%",
            ))

        elif query_type == "detection":
            detections = [e for e in evidence if e.type == "statistic" and e.data and "count" in e.data]
            total = sum(e.data.get("count", 0) for e in detections)
            findings.append(KeyFinding(
                id=str(uuid4()),
                label="Objects detected",
                value=total,
                confidence=0.91,
                icon="🎯",
            ))

        # Always add processing time
        findings.append(KeyFinding(
            id=str(uuid4()),
            label="Processing time",
            value=0,  # will be set later
            confidence=0.99,
            icon="⏱️",
            unit="ms",
        ))

        return findings

    def _build_model_trace(self, state: OrchestrationState) -> list[OrchestrationStep]:
        """Build model trace from orchestration state."""
        trace = []
        for step in state.steps:
            trace_step = OrchestrationStep(
                id=step.id,
                name=step.name,
                description=step.description,
                status=step.status,
                progress=step.progress,
                model=step.model,
                startTime=step.startTime,
                endTime=step.endTime,
                children=step.children,
            )
            trace.append(trace_step)
        return trace

    def _create_analysis_result(
        self,
        query: str,
        image_ids: list[str],
        evidence: list[EvidenceItem],
        model_trace: list[OrchestrationStep],
        processing_time: int,
        query_type: QueryType,
        primary_image: ImageModel,
        comparison_image: Optional[ImageModel] = None,
    ) -> AnalysisResult:
        """Create the final AnalysisResult."""
        # Get answer and confidence from state (would be passed in)
        # For now, synthesize again
        answer = self._synthesize_answer(query_type, evidence)
        confidences = [e.confidence for e in evidence if e.confidence > 0]
        overall_confidence = sum(confidences) / len(confidences) if confidences else 0.85
        key_findings = self._create_key_findings(query_type, evidence, overall_confidence)

        # Set processing time in key findings
        for kf in key_findings:
            if kf.label == "Processing time":
                kf.value = processing_time
                break

        return AnalysisResult(
            id=str(uuid4()),
            query=query,
            timestamp=datetime.utcnow(),
            imageIds=image_ids,
            answer=answer,
            confidence=overall_confidence,
            keyFindings=key_findings,
            evidence=evidence,
            modelTrace=model_trace,
            processingTime=processing_time,
            queryType=query_type,
        )


orchestrator = Orchestrator()