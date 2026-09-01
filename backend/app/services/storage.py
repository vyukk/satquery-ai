import os
import shutil
import uuid
from pathlib import Path
from typing import BinaryIO, Optional
from PIL import Image as PILImage

from ..config import settings


class LocalStorage:
    """Local filesystem storage for images and thumbnails."""

    def __init__(self, base_path: Optional[Path] = None):
        self.base_path = base_path or settings.data_path
        self.upload_path = self.base_path / "uploads"
        self.thumbnail_path = self.base_path / "thumbnails"
        self.upload_path.mkdir(parents=True, exist_ok=True)
        self.thumbnail_path.mkdir(parents=True, exist_ok=True)

    def save_upload(self, file_obj: BinaryIO, filename: str, subdir: str = "") -> Path:
        """Save uploaded file to local storage."""
        dest_dir = self.upload_path / subdir
        dest_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename to avoid collisions
        ext = Path(filename).suffix
        unique_name = f"{uuid.uuid4().hex}{ext}"
        dest_path = dest_dir / unique_name

        with open(dest_path, "wb") as f:
            shutil.copyfileobj(file_obj, f)

        return dest_path.relative_to(self.base_path)

    def get_file_path(self, relative_path: str) -> Path:
        """Get absolute path for a stored file."""
        return self.base_path / relative_path

    def file_exists(self, relative_path: str) -> bool:
        return (self.base_path / relative_path).exists()

    def delete_file(self, relative_path: str) -> bool:
        try:
            (self.base_path / relative_path).unlink(missing_ok=True)
            return True
        except Exception:
            return False

    def save_thumbnail(self, image: PILImage.Image, image_id: str) -> Path:
        """Save thumbnail for an image."""
        thumb_path = self.thumbnail_path / f"{image_id}.jpg"
        image.save(thumb_path, "JPEG", quality=85)
        return thumb_path.relative_to(self.base_path)

    def get_thumbnail_path(self, image_id: str) -> Optional[Path]:
        """Get thumbnail path if exists."""
        thumb_path = self.thumbnail_path / f"{image_id}.jpg"
        if thumb_path.exists():
            return thumb_path.relative_to(self.base_path)
        return None


storage = LocalStorage()