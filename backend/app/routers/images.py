import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import uuid4

from ..schemas import SatelliteImage, ImageUploadResponse
from ..deps import get_db
from ..security import get_current_active_user
from ..models import Image, User
from ..services.image_service import image_service

router = APIRouter(prefix="/images", tags=["images"])


def _image_to_response(image: Image) -> SatelliteImage:
    """Convert ORM Image to Pydantic response."""
    thumb_url = None
    if image.thumbnail_path:
        thumb_url = f"/api/images/{image.id}/thumbnail"

    return SatelliteImage(
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


@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Upload a satellite image file."""
    # Validate file type
    allowed_extensions = {".tif", ".tiff", ".geotiff", ".png", ".jpg", ".jpeg", ".jp2"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(allowed_extensions)}",
        )

    # Read file content
    content = await file.read()

    # Process through image service
    try:
        from io import BytesIO
        file_obj = BytesIO(content)
        metadata = image_service.process_upload(
            file_obj=file_obj,
            filename=file.filename or "unknown",
            owner_id=current_user.id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

    # Create ORM record
    db_image = Image(
        id=metadata["id"],
        filename=metadata["filename"],
        original_filename=metadata["original_filename"],
        modality=metadata["modality"],
        sensor=metadata.get("sensor"),
        resolution=metadata.get("resolution"),
        acquisition_date=metadata.get("acquisition_date"),
        lat=metadata.get("lat"),
        lng=metadata.get("lng"),
        bbox=metadata.get("bbox"),
        crs=metadata.get("crs", "EPSG:4326"),
        format=metadata.get("format"),
        file_size=metadata.get("file_size"),
        width=metadata.get("width"),
        height=metadata.get("height"),
        bands=metadata.get("bands"),
        metadata=metadata.get("metadata"),
        file_path=metadata["file_path"],
        thumbnail_path=metadata.get("thumbnail_path"),
        owner_id=metadata["owner_id"],
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)

    return ImageUploadResponse(image=_image_to_response(db_image))


@router.get("/{image_id}/file")
def get_image_file(
    image_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Serve the original image file."""
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    if not image.is_public and image.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    from ..config import settings
    file_path = settings.data_path / image.file_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=str(file_path),
        filename=image.filename,
        media_type="image/tiff" if image.format in ["GeoTIFF", "TIFF"] else "application/octet-stream",
    )


@router.get("/{image_id}/thumbnail")
def get_image_thumbnail(
    image_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Serve the image thumbnail."""
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    if not image.is_public and image.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    from ..config import settings
    if not image.thumbnail_path:
        raise HTTPException(status_code=404, detail="Thumbnail not available")

    thumb_path = settings.data_path / image.thumbnail_path
    if not thumb_path.exists():
        raise HTTPException(status_code=404, detail="Thumbnail not found on disk")

    return FileResponse(
        path=str(thumb_path),
        media_type="image/jpeg",
    )


@router.get("/{image_id}", response_model=SatelliteImage)
def get_image(
    image_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get image metadata."""
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    if not image.is_public and image.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return _image_to_response(image)


@router.get("", response_model=List[SatelliteImage])
def list_images(
    limit: int = 50,
    offset: int = 0,
    modality: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List user's images."""
    query = db.query(Image).filter(Image.owner_id == current_user.id)

    if modality:
        query = query.filter(Image.modality == modality)

    images = query.order_by(Image.created_at.desc()).offset(offset).limit(limit).all()
    return [_image_to_response(img) for img in images]