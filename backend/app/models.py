import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Float,
    Integer,
    ForeignKey,
    Text,
    Boolean,
    JSON,
    Index,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    images = relationship("Image", back_populates="owner", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="owner", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="owner", cascade="all, delete-orphan")


class Image(Base):
    __tablename__ = "images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    modality = Column(String(50), nullable=False)  # optical, sar, multispectral, hyperspectral
    sensor = Column(String(100), nullable=True)
    resolution = Column(Float, nullable=True)  # meters per pixel
    acquisition_date = Column(DateTime, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    bbox = Column(JSON, nullable=True)  # [minLng, minLat, maxLng, maxLat]
    crs = Column(String(50), default="EPSG:4326")
    format = Column(String(50), nullable=True)
    file_size = Column(Integer, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    bands = Column(JSON, nullable=True)  # list of band names
    image_metadata = Column(JSON, nullable=True)  # full metadata dict
    file_path = Column(String(512), nullable=False)  # path to stored file
    thumbnail_path = Column(String(512), nullable=True)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="images")
    analyses = relationship("Analysis", back_populates="primary_image", foreign_keys="Analysis.primary_image_id")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_path = Column(String(512), nullable=True)
    image_id = Column(String(36), ForeignKey("images.id"), nullable=False)
    tags = Column(JSON, nullable=True)  # list of tags
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    image = relationship("Image")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    query = Column(Text, nullable=False)
    query_type = Column(String(50), nullable=False)  # landcover, change, multimodal, detection, general
    answer = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    models_used = Column(JSON, nullable=True)  # list of model names
    evidence = Column(JSON, nullable=True)  # list of EvidenceItem dicts
    model_trace = Column(JSON, nullable=True)  # list of OrchestrationStep dicts
    key_findings = Column(JSON, nullable=True)  # list of KeyFinding dicts
    primary_image_id = Column(String(36), ForeignKey("images.id"), nullable=True)
    comparison_image_id = Column(String(36), ForeignKey("images.id"), nullable=True)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="analyses")
    primary_image = relationship("Image", foreign_keys=[primary_image_id])
    comparison_image = relationship("Image", foreign_keys=[comparison_image_id])
    chat_messages = relationship("ChatMessage", back_populates="analysis", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    message_metadata = Column(JSON, nullable=True)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=True)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    # Relationships
    analysis = relationship("Analysis", back_populates="chat_messages")
    owner = relationship("User", back_populates="chat_messages")


# Indexes
Index("ix_analyses_owner_created", Analysis.owner_id, Analysis.created_at)
Index("ix_images_owner_created", Image.owner_id, Image.created_at)