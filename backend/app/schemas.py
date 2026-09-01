from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID, uuid4

# --- Core Types (mirroring frontend TS interfaces) ---

Modality = Literal["optical", "sar", "multispectral", "hyperspectral"]
QueryType = Literal["landcover", "change", "multimodal", "detection", "general"]
MessageRole = Literal["user", "assistant", "system"]
StepStatus = Literal["pending", "running", "completed", "failed"]


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class Location(BaseModel):
    lat: float
    lng: float
    bbox: Optional[list[float]] = None  # [minLng, minLat, maxLng, maxLat]


class SatelliteImage(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    name: Optional[str] = None
    modality: Modality
    sensor: str
    resolution: float  # meters per pixel
    acquisitionDate: datetime
    location: Location
    crs: str
    format: str
    fileSize: int
    width: int
    height: int
    bands: Optional[list[str]] = None
    metadata: dict = {}
    visible: bool = True
    bounds: Optional[list[float]] = None
    thumbnailUrl: Optional[str] = None
    url: Optional[str] = None

    @property
    def acquisition_date(self) -> datetime:
        return self.acquisitionDate


class DatasetSample(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str
    thumbnailUrl: Optional[str] = None
    image: SatelliteImage
    tags: list[str] = []


class EvidenceItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: Literal["region", "statistic", "comparison", "overlay"]
    label: str
    description: str
    confidence: float
    imageRegion: Optional[BoundingBox] = None
    data: Optional[dict] = None


class ModelTraceStep(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str
    status: StepStatus
    progress: float = 0.0
    model: Optional[str] = None
    startTime: Optional[datetime] = None
    endTime: Optional[datetime] = None
    children: Optional[list["ModelTraceStep"]] = None


ModelTraceStep.model_rebuild()


class OrchestrationStep(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str
    status: StepStatus
    progress: float = 0.0
    model: Optional[str] = None
    startTime: Optional[datetime] = None
    endTime: Optional[datetime] = None
    children: Optional[list["OrchestrationStep"]] = None


OrchestrationStep.model_rebuild()


class ChatMessage(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: MessageRole
    content: str
    timestamp: datetime
    metadata: Optional[dict] = None


class SpecialistModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    type: str
    description: str
    capabilities: list[str]
    inputModalities: list[str]
    status: Literal["available", "busy", "offline"] = "available"
    latency: int  # ms
    confidence: float


class KeyFinding(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    label: str
    value: float
    confidence: float
    icon: Optional[str] = None
    unit: Optional[str] = None


class AnalysisResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    query: str
    timestamp: datetime
    imageIds: list[str]
    answer: str
    confidence: float
    keyFindings: list[KeyFinding] = []
    evidence: list[EvidenceItem] = []
    modelTrace: list[OrchestrationStep] = []
    processingTime: int
    queryType: QueryType
    modelsUsed: Optional[list[str]] = None


class OrchestrationState(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="allow")

    query: str
    queryClassification: str = ""
    taskPlan: list[str] = []
    selectedSpecialists: list[str] = []
    currentStep: str = ""
    overallProgress: float = 0.0
    steps: list[OrchestrationStep] = []
    isComplete: bool = False
    # Additional fields populated during evidence synthesis
    answer: Optional[str] = None
    confidence: Optional[float] = None
    keyFindings: Optional[list[KeyFinding]] = None


# --- Request/Response Schemas ---

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime


class ImageUploadResponse(BaseModel):
    image: SatelliteImage
    message: str = "Image uploaded successfully"


class AnalysisRequest(BaseModel):
    query: str
    image_ids: list[str]
    comparison_image_id: Optional[str] = None


class AnalysisResponse(BaseModel):
    message: ChatMessage
    analysis: AnalysisResult
    orchestration: OrchestrationState


class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Forward references
TokenResponse.model_rebuild()
UserResponse.model_rebuild()