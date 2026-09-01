import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, BinaryIO
from PIL import Image as PILImage
import numpy as np

from ..config import settings
from ..services.storage import storage

# Try to import rasterio for GeoTIFF processing
try:
    import rasterio
    from rasterio.transform import array_bounds
    from rasterio.crs import CRS
    HAS_RASTERIO = True
except ImportError:
    HAS_RASTERIO = False


class ImageService:
    """Service for processing satellite images: metadata extraction, thumbnails."""

    def __init__(self):
        self.max_size_mb = settings.MAX_UPLOAD_SIZE_MB
        self.thumb_size = settings.THUMBNAIL_SIZE

    def process_upload(
        self,
        file_obj: BinaryIO,
        filename: str,
        owner_id: str,
    ) -> dict:
        """Process an uploaded image file: save, extract metadata, generate thumbnail."""
        # Check file size
        file_obj.seek(0, 2)  # seek to end
        file_size = file_obj.tell()
        file_obj.seek(0)  # reset to start

        if file_size > self.max_size_mb * 1024 * 1024:
            raise ValueError(f"File too large: {file_size / 1024 / 1024:.1f}MB > {self.max_size_mb}MB")

        # Save file
        rel_path = storage.save_upload(file_obj, filename, subdir=owner_id)
        abs_path = storage.get_file_path(rel_path)

        # Extract metadata
        metadata = self._extract_metadata(abs_path, filename, file_size)

        # Generate thumbnail
        thumb_rel = self._generate_thumbnail(abs_path, metadata["id"])
        metadata["thumbnail_path"] = str(thumb_rel) if thumb_rel else None

        metadata["file_path"] = str(rel_path)
        metadata["owner_id"] = owner_id

        return metadata

    def _extract_metadata(self, file_path: Path, original_filename: str, file_size: int) -> dict:
        """Extract metadata from image file."""
        image_id = str(uuid.uuid4())
        ext = file_path.suffix.lower()

        base_metadata = {
            "id": image_id,
            "filename": original_filename,
            "original_filename": original_filename,
            "file_size": file_size,
            "format": ext.lstrip(".").upper(),
            "modality": self._guess_modality(original_filename, ext),
            "sensor": "Unknown",
            "resolution": None,
            "acquisition_date": None,
            "lat": None,
            "lng": None,
            "bbox": None,
            "crs": "EPSG:4326",
            "width": 0,
            "height": 0,
            "bands": None,
            "metadata": {},
        }

        if HAS_RASTERIO and ext in [".tif", ".tiff", ".geotiff"]:
            return {**base_metadata, **self._extract_geotiff_metadata(file_path)}
        else:
            # Fallback for PNG/JPEG - use Pillow
            return {**base_metadata, **self._extract_pillow_metadata(file_path)}

    def _extract_geotiff_metadata(self, file_path: Path) -> dict:
        """Extract metadata from GeoTIFF using rasterio."""
        with rasterio.open(file_path) as src:
            # Basic image info
            width = src.width
            height = src.height
            count = src.count

            # Band info
            bands = [f"Band {i+1}" for i in range(count)]

            # CRS and transform
            crs = str(src.crs) if src.crs else "EPSG:4326"

            # Bounds from transform
            bounds = src.bounds
            bbox = [bounds.left, bounds.bottom, bounds.right, bounds.top]

            # Center point
            center_lon = (bounds.left + bounds.right) / 2
            center_lat = (bounds.top + bounds.bottom) / 2

            # Resolution (meters per pixel)
            if src.transform:
                res_x = abs(src.transform.a)
                res_y = abs(src.transform.e)
                resolution = (res_x + res_y) / 2
            else:
                resolution = None

            # Try to get metadata tags
            tags = dict(src.tags()) if src.tags() else {}
            sensor = tags.get("sensor") or tags.get("SENSOR") or tags.get("satellite") or tags.get("SATELLITE") or "Unknown"

            # Acquisition date from tags or filename
            acquisition_date = self._parse_acquisition_date(tags, file_path.name)

            return {
                "width": width,
                "height": height,
                "bands": bands,
                "crs": crs,
                "bbox": bbox,
                "lat": center_lat,
                "lng": center_lon,
                "resolution": resolution,
                "sensor": sensor,
                "acquisition_date": acquisition_date,
                "metadata": {
                    "driver": src.driver,
                    "dtype": str(src.dtypes[0]) if src.dtypes else None,
                    "nodata": src.nodata,
                    "tags": tags,
                    "transform": list(src.transform) if src.transform else None,
                },
            }

    def _extract_pillow_metadata(self, file_path: Path) -> dict:
        """Extract basic metadata using Pillow."""
        with PILImage.open(file_path) as img:
            width, height = img.size
            mode = img.mode
            format = img.format

        return {
            "width": width,
            "height": height,
            "bands": [mode],
            "metadata": {
                "mode": mode,
                "format": format,
            },
        }

    def _guess_modality(self, filename: str, ext: str) -> str:
        """Guess modality from filename/extension."""
        name_lower = filename.lower()
        if "sar" in name_lower or "sentinel-1" in name_lower or "risat" in name_lower:
            return "sar"
        elif "sentinel-2" in name_lower or "landsat" in name_lower or "multispectral" in name_lower:
            return "multispectral"
        elif "hyperspectral" in name_lower:
            return "hyperspectral"
        else:
            return "optical"

    def _parse_acquisition_date(self, tags: dict, filename: str) -> Optional[datetime]:
        """Parse acquisition date from tags or filename."""
        # Try tags
        for key in ["acquisition_date", "ACQUISITION_DATE", "date", "DATE", "datetime", "DATETIME"]:
            if key in tags:
                try:
                    return datetime.fromisoformat(tags[key].replace("Z", "+00:00"))
                except Exception:
                    pass

        # Try to extract from filename (e.g., Sentinel_2A_2025_01_20.tif)
        import re
        date_patterns = [
            r"(\d{4})[_-](\d{2})[_-](\d{2})",  # YYYY-MM-DD or YYYY_MM_DD
            r"(\d{4})(\d{2})(\d{2})",  # YYYYMMDD
        ]
        for pattern in date_patterns:
            match = re.search(pattern, filename)
            if match:
                try:
                    year, month, day = map(int, match.groups())
                    return datetime(year, month, day)
                except Exception:
                    pass

        return None

    def _generate_thumbnail(self, file_path: Path, image_id: str) -> Optional[Path]:
        """Generate a thumbnail for the image."""
        try:
            ext = file_path.suffix.lower()

            if HAS_RASTERIO and ext in [".tif", ".tiff", ".geotiff"]:
                with rasterio.open(file_path) as src:
                    # Read first 3 bands as RGB if available, else first band
                    if src.count >= 3:
                        # Try to read RGB bands
                        data = src.read([1, 2, 3])
                        # Normalize to 0-255
                        data = self._normalize_bands(data)
                        img = PILImage.fromarray(data.transpose(1, 2, 0).astype("uint8"), "RGB")
                    else:
                        # Single band - read as grayscale
                        data = src.read(1)
                        data = self._normalize_band(data)
                        img = PILImage.fromarray(data.astype("uint8"), "L")
            else:
                # Use Pillow for other formats
                with PILImage.open(file_path) as img:
                    img = img.convert("RGB")

            # Resize to thumbnail
            img.thumbnail(self.thumb_size, PILImage.Resampling.LANCZOS)

            # Save thumbnail
            return storage.save_thumbnail(img, image_id)

        except Exception as e:
            print(f"Thumbnail generation failed for {file_path}: {e}")
            return None

    def _normalize_bands(self, data: np.ndarray) -> np.ndarray:
        """Normalize multi-band data to 0-255."""
        result = np.zeros_like(data, dtype=np.float32)
        for i in range(data.shape[0]):
            band = data[i].astype(np.float32)
            # Percentile stretch
            p2, p98 = np.percentile(band[band > 0], (2, 98)) if np.any(band > 0) else (0, 1)
            if p98 > p2:
                band = np.clip((band - p2) / (p98 - p2) * 255, 0, 255)
            result[i] = band
        return result

    def _normalize_band(self, data: np.ndarray) -> np.ndarray:
        """Normalize single band to 0-255."""
        data = data.astype(np.float32)
        valid = data[data > 0] if np.any(data > 0) else data
        if len(valid) > 0:
            p2, p98 = np.percentile(valid, (2, 98))
            if p98 > p2:
                data = np.clip((data - p2) / (p98 - p2) * 255, 0, 255)
        return data


image_service = ImageService()