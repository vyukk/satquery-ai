import random
import time
from datetime import datetime
from typing import Optional
from uuid import uuid4

from ..schemas import (
    EvidenceItem,
    BoundingBox,
    OrchestrationStep,
    SpecialistModel,
    KeyFinding,
    QueryType,
    ModelTraceStep,
)


# Simulated specialist models matching mockSpecialistModels
SPECIALIST_REGISTRY: dict[str, SpecialistModel] = {
    "vlm-001": SpecialistModel(
        id="vlm-001",
        name="Remote Sensing VLM",
        type="vlm",
        description="Vision-Language Model fine-tuned for remote sensing imagery understanding",
        capabilities=[
            "Image captioning",
            "Visual question answering",
            "Land-cover classification",
            "Object detection",
            "Scene description",
        ],
        inputModalities=["optical", "multispectral"],
        status="available",
        latency=1200,
        confidence=0.94,
    ),
    "cd-001": SpecialistModel(
        id="cd-001",
        name="Change Detection Model",
        type="change-detection",
        description="Siamese network for temporal change detection and localization",
        capabilities=[
            "Temporal comparison",
            "Change localization",
            "Change classification",
            "Change magnitude estimation",
        ],
        inputModalities=["optical", "multispectral", "sar"],
        status="available",
        latency=2500,
        confidence=0.89,
    ),
    "sar-001": SpecialistModel(
        id="sar-001",
        name="SAR Analysis Model",
        type="sar-analysis",
        description="Specialized model for SAR imagery interpretation and backscatter analysis",
        capabilities=[
            "SAR interpretation",
            "Backscatter analysis",
            "Structural feature detection",
            "Surface deformation monitoring",
            "Flood extent mapping",
        ],
        inputModalities=["sar"],
        status="available",
        latency=1800,
        confidence=0.91,
    ),
    "geo-001": SpecialistModel(
        id="geo-001",
        name="Geospatial Analysis Engine",
        type="geospatial",
        description="Geospatial processing engine for spatial queries and coordinate operations",
        capabilities=[
            "CRS transformation",
            "GeoTIFF processing",
            "Spatial queries",
            "Region extraction",
            "Area calculation",
            "Coordinate conversion",
        ],
        inputModalities=["all"],
        status="available",
        latency=500,
        confidence=0.99,
    ),
    "cls-001": SpecialistModel(
        id="cls-001",
        name="Land Cover Classifier",
        type="classification",
        description="Deep learning classifier for land cover types",
        capabilities=[
            "Multi-class land cover classification",
            "Confidence scoring",
            "Hierarchical classification",
        ],
        inputModalities=["optical", "multispectral"],
        status="available",
        latency=800,
        confidence=0.96,
    ),
    "det-001": SpecialistModel(
        id="det-001",
        name="Object Detection Model",
        type="detection",
        description="YOLOv8-based detector for remote sensing objects",
        capabilities=[
            "Vehicle detection",
            "Building detection",
            "Ship detection",
            "Aircraft detection",
            "Infrastructure detection",
        ],
        inputModalities=["optical", "sar"],
        status="available",
        latency=600,
        confidence=0.92,
    ),
}


class SpecialistExecutor:
    """Simulates running specialist models on imagery."""

    def __init__(self):
        self.registry = SPECIALIST_REGISTRY

    def get_available_specialists(self) -> list[SpecialistModel]:
        return [m for m in self.registry.values() if m.status == "available"]

    def select_specialists_for_query(self, query_type: QueryType, modalities: list[str]) -> list[SpecialistModel]:
        """Select appropriate specialists based on query type and available modalities."""
        selected = []

        if query_type == "landcover":
            if "vlm-001" in self.registry:
                selected.append(self.registry["vlm-001"])
            if "cls-001" in self.registry:
                selected.append(self.registry["cls-001"])
        elif query_type == "change":
            if "cd-001" in self.registry:
                selected.append(self.registry["cd-001"])
            if "vlm-001" in self.registry:
                selected.append(self.registry["vlm-001"])
        elif query_type == "multimodal":
            if "sar-001" in self.registry and "sar" in modalities:
                selected.append(self.registry["sar-001"])
            if "vlm-001" in self.registry:
                selected.append(self.registry["vlm-001"])
            if "geo-001" in self.registry:
                selected.append(self.registry["geo-001"])
        elif query_type == "detection":
            if "det-001" in self.registry:
                selected.append(self.registry["det-001"])
            if "vlm-001" in self.registry:
                selected.append(self.registry["vlm-001"])

        # Always include geo for coordinate ops
        if "geo-001" in self.registry and "geo-001" not in [s.id for s in selected]:
            selected.append(self.registry["geo-001"])

        return selected

    def execute_specialist(
        self,
        specialist: SpecialistModel,
        image_metadata: dict,
        query: str,
        comparison_metadata: Optional[dict] = None,
    ) -> tuple[list[EvidenceItem], str, float]:
        """Simulate running a specialist model. Returns (evidence, model_output, confidence)."""
        time.sleep(0.1)  # Simulate processing delay

        modality = image_metadata.get("modality", "optical")
        resolution = image_metadata.get("resolution", 10.0)
        sensor = image_metadata.get("sensor", "Unknown")

        evidence = []

        if specialist.id == "vlm-001":
            # VLM: scene description and VQA
            evidence.append(EvidenceItem(
                id=str(uuid4()),
                type="region",
                label="Scene Description",
                description=f"Image shows {modality} imagery from {sensor} at {resolution}m resolution",
                confidence=0.92 + random.random() * 0.05,
                imageRegion=BoundingBox(x=0.1, y=0.1, width=0.8, height=0.8),
                data={"modality": modality, "sensor": sensor, "resolution": resolution},
            ))
            output = f"Scene contains {modality} data from {sensor}. Dominant features include terrain, vegetation, and built-up areas."

        elif specialist.id == "cls-001":
            # Land cover classifier
            classes = ["Built-up", "Agriculture", "Vegetation", "Water", "Bare Soil"]
            for i, cls in enumerate(classes):
                conf = 0.7 + random.random() * 0.25
                evidence.append(EvidenceItem(
                    id=str(uuid4()),
                    type="statistic",
                    label=f"{cls} Coverage",
                    description=f"Estimated {cls.lower()} percentage from pixel classification",
                    confidence=conf,
                    data={"class": cls.lower(), "percentage": round(conf * 100, 1)},
                ))
            output = "Land cover classification: Built-up 38%, Agriculture 31%, Vegetation 21%, Water 10%"

        elif specialist.id == "cd-001" and comparison_metadata:
            # Change detection
            change_types = ["new-builtup", "vegetation-loss", "water-gain", "bare-soil-change"]
            for ct in random.sample(change_types, 3):
                area = round(random.uniform(1.0, 20.0), 1)
                conf = 0.75 + random.random() * 0.2
                evidence.append(EvidenceItem(
                    id=str(uuid4()),
                    type="comparison",
                    label=ct.replace("-", " ").title(),
                    description=f"{area} ha of {ct.replace('-', ' ')} detected",
                    confidence=conf,
                    imageRegion=BoundingBox(x=random.random() * 0.5, y=random.random() * 0.5, width=0.2, height=0.2),
                    data={"changeType": ct, "areaHa": area},
                ))
            output = f"Change detection found {len(evidence)} significant changes between observations."

        elif specialist.id == "sar-001" and modality == "sar":
            # SAR analysis
            evidence.append(EvidenceItem(
                id=str(uuid4()),
                type="region",
                label="Backscatter Analysis",
                description="VV/VH backscatter statistics computed",
                confidence=0.88 + random.random() * 0.1,
                imageRegion=BoundingBox(x=0.2, y=0.2, width=0.6, height=0.6),
                data={"polarization": "VV+VH", "mean_vv": -12.5, "mean_vh": -18.2},
            ))
            evidence.append(EvidenceItem(
                id=str(uuid4()),
                type="region",
                label="Structural Features",
                description="Double-bounce scattering indicates urban structures",
                confidence=0.85 + random.random() * 0.1,
                imageRegion=BoundingBox(x=0.3, y=0.15, width=0.25, height=0.2),
                data={"feature": "double-bounce", "confidence": 0.88},
            ))
            output = "SAR analysis: High VV backscatter in urban areas, low backscatter over water, volume scattering in vegetation."

        elif specialist.id == "det-001":
            # Object detection
            objects = ["Buildings", "Vehicles", "Ships", "Roads"]
            for obj in random.sample(objects, random.randint(1, 3)):
                count = random.randint(5, 50)
                conf = 0.8 + random.random() * 0.15
                evidence.append(EvidenceItem(
                    id=str(uuid4()),
                    type="statistic",
                    label=f"{obj} Detected",
                    description=f"{count} {obj.lower()} detected with confidence >80%",
                    confidence=conf,
                    data={"class": obj.lower(), "count": count},
                ))
            output = f"Object detection found {sum(e.data.get('count', 0) for e in evidence)} objects across categories."

        elif specialist.id == "geo-001":
            # Geospatial analysis
            area_ha = round(image_metadata.get("width", 1000) * image_metadata.get("height", 1000) * (resolution ** 2) / 10000, 1)
            evidence.append(EvidenceItem(
                id=str(uuid4()),
                type="statistic",
                label="Scene Area",
                description=f"Total imaged area: {area_ha} hectares",
                confidence=0.99,
                data={"area_ha": area_ha, "width_m": image_metadata.get("width", 1000) * resolution, "height_m": image_metadata.get("height", 1000) * resolution},
            ))
            output = f"Geospatial analysis: Image covers {area_ha} ha at {resolution}m resolution, CRS: {image_metadata.get('crs', 'EPSG:4326')}"

        else:
            output = f"{specialist.name} processed the image."
            evidence.append(EvidenceItem(
                id=str(uuid4()),
                type="statistic",
                label=specialist.name,
                description=output,
                confidence=specialist.confidence,
            ))

        return evidence, output, specialist.confidence * (0.9 + random.random() * 0.1)


specialist_executor = SpecialistExecutor()