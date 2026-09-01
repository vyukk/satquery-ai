import uuid
from datetime import datetime, timedelta
from pathlib import Path

from sqlalchemy.orm import Session

from .config import settings
from .database import Base, engine, init_db
from .models import User, Image, Dataset, Analysis
from .security import get_password_hash


DEMO_USER_EMAIL = "demo@satquery.ai"
DEMO_USER_PASSWORD = "demo1234"


def seed_database(db: Session) -> None:
    """Seed database with demo user and sample datasets."""

    # Create demo user if not exists
    demo_user = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
    if not demo_user:
        demo_user = User(
            id="demo-user-001",
            email=DEMO_USER_EMAIL,
            hashed_password=get_password_hash(DEMO_USER_PASSWORD),
            full_name="Demo User",
            is_active=True,
            is_admin=False,
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        print(f"Created demo user: {DEMO_USER_EMAIL}")

    # Sample datasets matching frontend mockDatasets.ts
    sample_datasets = [
        {
            "id": "ds-001",
            "name": "Cartosat-2S Urban Delhi",
            "description": "High-resolution panchromatic imagery of New Delhi urban area",
            "tags": ["urban", "high-resolution", "cartosat", "india", "2025"],
            "image": {
                "id": "img-001",
                "filename": "Cartosat_2A_2025_01_18.tif",
                "modality": "optical",
                "sensor": "Cartosat-2A",
                "resolution": 1.0,
                "acquisition_date": datetime(2025, 1, 18),
                "lat": 28.6139,
                "lng": 77.2090,
                "bbox": [77.15, 28.55, 77.27, 28.68],
                "crs": "EPSG:4326",
                "format": "GeoTIFF",
                "file_size": 145_000_000,
                "width": 12000,
                "height": 12000,
                "bands": ["Panchromatic"],
                "metadata": {
                    "satellite": "Cartosat-2A",
                    "orbit": 12345,
                    "sunElevation": 45.2,
                    "sunAzimuth": 156.8,
                    "cloudCover": 2.1,
                    "quality": "high",
                },
            },
        },
        {
            "id": "ds-002",
            "name": "Sentinel-2 Agricultural Mumbai",
            "description": "Multispectral imagery covering agricultural regions near Mumbai",
            "tags": ["agriculture", "multispectral", "sentinel-2", "india", "2025"],
            "image": {
                "id": "img-002",
                "filename": "Sentinel_2A_2025_01_20.tif",
                "modality": "multispectral",
                "sensor": "Sentinel-2A MSI",
                "resolution": 10.0,
                "acquisition_date": datetime(2025, 1, 20),
                "lat": 19.0760,
                "lng": 72.8777,
                "bbox": [72.80, 19.00, 72.95, 19.15],
                "crs": "EPSG:4326",
                "format": "GeoTIFF",
                "file_size": 89_000_000,
                "width": 10980,
                "height": 10980,
                "bands": ["B02", "B03", "B04", "B08", "B11", "B12"],
                "metadata": {
                    "satellite": "Sentinel-2A",
                    "orbit": 23456,
                    "sunElevation": 52.3,
                    "sunAzimuth": 142.1,
                    "cloudCover": 0.5,
                    "processingLevel": "L2A",
                },
            },
        },
        {
            "id": "ds-003",
            "name": "Sentinel-1 SAR Mumbai Flood",
            "description": "C-band SAR imagery for flood monitoring in Mumbai region",
            "tags": ["sar", "flood-monitoring", "sentinel-1", "india", "2025"],
            "image": {
                "id": "img-003",
                "filename": "Sentinel_1A_2025_01_22.tif",
                "modality": "sar",
                "sensor": "Sentinel-1A C-SAR",
                "resolution": 5.0,
                "acquisition_date": datetime(2025, 1, 22),
                "lat": 19.0760,
                "lng": 72.8777,
                "bbox": [72.80, 19.00, 72.95, 19.15],
                "crs": "EPSG:4326",
                "format": "GeoTIFF",
                "file_size": 67_000_000,
                "width": 20000,
                "height": 20000,
                "bands": ["VV", "VH"],
                "metadata": {
                    "satellite": "Sentinel-1A",
                    "orbit": 34567,
                    "polarization": "VV+VH",
                    "incidenceAngle": 38.5,
                    "orbitDirection": "ascending",
                    "processingLevel": "GRD",
                },
            },
        },
        {
            "id": "ds-004",
            "name": "Landsat-9 Kolkata Temporal Pair",
            "description": "Multi-temporal Landsat-9 pair for change detection in Kolkata",
            "tags": ["temporal", "change-detection", "landsat-9", "india", "2024-2025"],
            "image": {
                "id": "img-004",
                "filename": "Landsat_9_2024_06_15.tif",
                "modality": "multispectral",
                "sensor": "Landsat-9 OLI-2",
                "resolution": 30.0,
                "acquisition_date": datetime(2024, 6, 15),
                "lat": 22.5726,
                "lng": 88.3639,
                "bbox": [88.25, 22.45, 88.48, 22.70],
                "crs": "EPSG:4326",
                "format": "GeoTIFF",
                "file_size": 112_000_000,
                "width": 7800,
                "height": 7800,
                "bands": ["B2", "B3", "B4", "B5", "B6", "B7"],
                "metadata": {
                    "satellite": "Landsat-9",
                    "orbit": 45678,
                    "sunElevation": 48.7,
                    "sunAzimuth": 134.2,
                    "cloudCover": 1.2,
                    "processingLevel": "L2SP",
                },
            },
        },
        {
            "id": "ds-005",
            "name": "Cartosat-3 Bangalore Ultra-High-Res",
            "description": "Ultra-high resolution 0.25m imagery of Bangalore tech corridor",
            "tags": ["urban", "ultra-high-res", "cartosat-3", "india", "2025"],
            "image": {
                "id": "img-005",
                "filename": "Cartosat_3_2025_02_10.tif",
                "modality": "optical",
                "sensor": "Cartosat-3",
                "resolution": 0.25,
                "acquisition_date": datetime(2025, 2, 10),
                "lat": 12.9716,
                "lng": 77.5946,
                "bbox": [77.55, 12.93, 77.64, 13.01],
                "crs": "EPSG:4326",
                "format": "GeoTIFF",
                "file_size": 280_000_000,
                "width": 20000,
                "height": 20000,
                "bands": ["Panchromatic", "Multispectral"],
                "metadata": {
                    "satellite": "Cartosat-3",
                    "orbit": 67890,
                    "sunElevation": 55.4,
                    "sunAzimuth": 148.6,
                    "cloudCover": 0.0,
                    "quality": "very high",
                },
            },
        },
        {
            "id": "ds-006",
            "name": "RISAT-2B Bangalore SAR",
            "description": "Quad-polarization X-band SAR imagery of Bangalore",
            "tags": ["sar", "quad-pol", "risat-2b", "india", "2025"],
            "image": {
                "id": "img-006",
                "filename": "RISAT_2B_2025_02_12.tif",
                "modality": "sar",
                "sensor": "RISAT-2B X-SAR",
                "resolution": 1.0,
                "acquisition_date": datetime(2025, 2, 12),
                "lat": 12.9716,
                "lng": 77.5946,
                "bbox": [77.55, 12.93, 77.64, 13.01],
                "crs": "EPSG:4326",
                "format": "GeoTIFF",
                "file_size": 156_000_000,
                "width": 30000,
                "height": 30000,
                "bands": ["HH", "HV", "VV", "VH"],
                "metadata": {
                    "satellite": "RISAT-2B",
                    "orbit": 78901,
                    "polarization": "Quad-pol",
                    "incidenceAngle": 25.3,
                    "orbitDirection": "descending",
                    "processingLevel": "SLC",
                },
            },
        },
    ]

    for ds in sample_datasets:
        # Check if dataset exists
        existing_ds = db.query(Dataset).filter(Dataset.id == ds["id"]).first()
        if existing_ds:
            continue

        img_data = ds["image"]
        # Check if image exists
        existing_img = db.query(Image).filter(Image.id == img_data["id"]).first()
        if not existing_img:
            img = Image(
                id=img_data["id"],
                filename=img_data["filename"],
                original_filename=img_data["filename"],
                modality=img_data["modality"],
                sensor=img_data["sensor"],
                resolution=img_data["resolution"],
                acquisition_date=img_data["acquisition_date"],
                lat=img_data["lat"],
                lng=img_data["lng"],
                bbox=img_data["bbox"],
                crs=img_data["crs"],
                format=img_data["format"],
                file_size=img_data["file_size"],
                width=img_data["width"],
                height=img_data["height"],
                bands=img_data["bands"],
                image_metadata=img_data["metadata"],
                file_path=f"uploads/sample/{img_data['id']}.tif",  # placeholder path
                owner_id=demo_user.id,
                is_public=True,
            )
            db.add(img)
            db.flush()
        else:
            img = existing_img

        # Create dataset
        dataset = Dataset(
            id=ds["id"],
            name=ds["name"],
            description=ds["description"],
            image_id=img.id,
            tags=ds["tags"],
            is_public=True,
        )
        db.add(dataset)

    db.commit()
    print(f"Seeded {len(sample_datasets)} datasets")


def main():
    """Initialize database and seed data."""
    print("Initializing database...")
    init_db()

    from .database import SessionLocal
    db = SessionLocal()
    try:
        seed_database(db)
        print("Database seeding complete!")
    finally:
        db.close()


if __name__ == "__main__":
    main()