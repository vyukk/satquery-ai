from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import String
from typing import Optional

from ..schemas import DatasetSample, SatelliteImage
from ..deps import get_db
from ..security import get_current_active_user
from ..models import Dataset, Image, User

router = APIRouter(prefix="/datasets", tags=["datasets"])


def _dataset_to_response(dataset: Dataset) -> DatasetSample:
    """Convert ORM Dataset to Pydantic response."""
    image = dataset.image
    if not image:
        raise HTTPException(status_code=404, detail="Dataset image not found")

    # Build thumbnail URL
    thumb_url = None
    if image.thumbnail_path:
        thumb_url = f"/api/images/{image.id}/thumbnail"
    elif dataset.thumbnail_path:
        thumb_url = f"/api/datasets/{dataset.id}/thumbnail"

    sat_image = SatelliteImage(
        id=image.id,
        filename=image.filename,
        name=image.filename,
        modality=image.modality,
        sensor=image.sensor or "Unknown",
        resolution=image.resolution or 0,
        acquisitionDate=image.acquisition_date or image.created_at,
        location={
            "lat": image.lat or 0,
            "lng": image.lng or 0,
            "bbox": image.bbox,
        },
        crs=image.crs,
        format=image.format or "GeoTIFF",
        fileSize=image.file_size or 0,
        width=image.width or 0,
        height=image.height or 0,
        bands=image.bands,
        metadata=image.image_metadata or {},
        visible=True,
        bounds=image.bbox,
        thumbnailUrl=thumb_url,
        url=f"/api/images/{image.id}/file",
    )

    return DatasetSample(
        id=dataset.id,
        name=dataset.name,
        description=dataset.description or "",
        thumbnailUrl=thumb_url,
        image=sat_image,
        tags=dataset.tags or [],
    )


@router.get("", response_model=list[DatasetSample])
def list_datasets(
    modality: Optional[str] = None,
    sensor: Optional[str] = None,
    region: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List datasets with optional filtering."""
    query = db.query(Dataset).filter(Dataset.is_public == True)

    if modality:
        query = query.join(Image).filter(Image.modality == modality)
    if sensor:
        query = query.join(Image).filter(Image.sensor == sensor)
    if region:
        # Tag-based region filtering
        query = query.filter(Dataset.tags.contains([region]))
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (Dataset.name.ilike(search_term)) |
            (Dataset.description.ilike(search_term)) |
            (Dataset.tags.cast(String).ilike(search_term))
        )

    datasets = query.offset(offset).limit(limit).all()
    return [_dataset_to_response(d) for d in datasets]


@router.get("/{dataset_id}", response_model=DatasetSample)
def get_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a single dataset by ID."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    if not dataset.is_public and dataset.image.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return _dataset_to_response(dataset)