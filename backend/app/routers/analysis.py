from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import uuid4
from datetime import datetime

from ..schemas import (
    AnalysisRequest,
    AnalysisResponse,
    ChatMessage,
    AnalysisResult,
    OrchestrationState,
)
from ..deps import get_db
from ..security import get_current_active_user
from ..models import Image, Analysis, ChatMessage as ChatMessageModel, User
from ..services.orchestrator import orchestrator

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("", response_model=AnalysisResponse)
async def run_analysis(
    request: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Run the orchestration pipeline on given images."""
    # Validate images
    if not request.image_ids:
        raise HTTPException(status_code=400, detail="At least one image ID required")

    primary_image = db.query(Image).filter(Image.id == request.image_ids[0]).first()
    if not primary_image:
        raise HTTPException(status_code=404, detail="Primary image not found")

    if primary_image.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to primary image")

    comparison_image = None
    if request.comparison_image_id:
        comparison_image = db.query(Image).filter(Image.id == request.comparison_image_id).first()
        if not comparison_image:
            raise HTTPException(status_code=404, detail="Comparison image not found")
        if comparison_image.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied to comparison image")

    # Run orchestration pipeline
    message, analysis_result, orchestration_state = await orchestrator.run_pipeline(
        query=request.query,
        primary_image=primary_image,
        comparison_image=comparison_image,
        user_id=current_user.id,
    )

    # Save analysis to database
    db_analysis = Analysis(
        id=analysis_result.id,
        query=analysis_result.query,
        query_type=analysis_result.queryType,
        answer=analysis_result.answer,
        confidence=analysis_result.confidence,
        processing_time_ms=analysis_result.processingTime,
        models_used=analysis_result.modelsUsed,
        evidence=[e.model_dump(mode='json') for e in analysis_result.evidence] if analysis_result.evidence else None,
        model_trace=[s.model_dump(mode='json') for s in analysis_result.modelTrace] if analysis_result.modelTrace else None,
        key_findings=[kf.model_dump(mode='json') for kf in analysis_result.keyFindings] if analysis_result.keyFindings else None,
        primary_image_id=primary_image.id,
        comparison_image_id=comparison_image.id if comparison_image else None,
        owner_id=current_user.id,
    )
    db.add(db_analysis)

    # Save chat messages
    user_message = ChatMessageModel(
        id=str(uuid4()),
        role="user",
        content=request.query,
        timestamp=datetime.utcnow(),
        analysis_id=db_analysis.id,
        owner_id=current_user.id,
    )
    db.add(user_message)

    assistant_message = ChatMessageModel(
        id=message.id,
        role=message.role,
        content=message.content,
        timestamp=message.timestamp,
        metadata=message.metadata,
        analysis_id=db_analysis.id,
        owner_id=current_user.id,
    )
    db.add(assistant_message)

    db.commit()
    db.refresh(db_analysis)

    return AnalysisResponse(
        message=message,
        analysis=analysis_result,
        orchestration=orchestration_state,
    )


@router.get("/history", response_model=List[AnalysisResult])
def get_analysis_history(
    limit: int = 50,
    offset: int = 0,
    query_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get analysis history for current user."""
    query = db.query(Analysis).filter(Analysis.owner_id == current_user.id)

    if query_type:
        query = query.filter(Analysis.query_type == query_type)

    analyses = query.order_by(Analysis.created_at.desc()).offset(offset).limit(limit).all()

    results = []
    for a in analyses:
        result = AnalysisResult(
            id=a.id,
            query=a.query,
            timestamp=a.created_at,
            imageIds=[a.primary_image_id] + ([a.comparison_image_id] if a.comparison_image_id else []),
            answer=a.answer or "",
            confidence=a.confidence or 0.0,
            keyFindings=a.key_findings or [],
            evidence=a.evidence or [],
            modelTrace=a.model_trace or [],
            processingTime=a.processing_time_ms or 0,
            queryType=a.query_type,
        )
        results.append(result)

    return results


@router.get("/{analysis_id}", response_model=AnalysisResult)
def get_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific analysis by ID."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    if analysis.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return AnalysisResult(
        id=analysis.id,
        query=analysis.query,
        timestamp=analysis.created_at,
        imageIds=[analysis.primary_image_id] + ([analysis.comparison_image_id] if analysis.comparison_image_id else []),
        answer=analysis.answer or "",
        confidence=analysis.confidence or 0.0,
        keyFindings=analysis.key_findings or [],
        evidence=analysis.evidence or [],
        modelTrace=analysis.model_trace or [],
        processingTime=analysis.processing_time_ms or 0,
        queryType=analysis.query_type,
    )


@router.get("/{analysis_id}/messages", response_model=List[ChatMessage])
def get_analysis_messages(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get chat messages for an analysis."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    if analysis.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    messages = db.query(ChatMessageModel).filter(ChatMessageModel.analysis_id == analysis_id).order_by(ChatMessageModel.timestamp).all()

    return [
        ChatMessage(
            id=m.id,
            role=m.role,
            content=m.content,
            timestamp=m.timestamp,
            metadata=m.metadata,
        )
        for m in messages
    ]