# SatQuery AI Backend

## Overview
FastAPI backend for the SatQuery AI application, providing:
- JWT-based authentication
- Dataset catalog with filtering
- Image upload with GeoTIFF metadata extraction
- Specialist model registry
- Agentic orchestration pipeline for remote sensing analysis
- Analysis history persistence

## Quick Start

### Prerequisites
- Python 3.11+
- uv (recommended) or pip

### Installation
```bash
cd backend
uv sync  # or: pip install -r requirements.txt
```

### Run Development Server
```bash
uv run uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000/api
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/api/health

### Demo Account
After first run, the database is seeded with:
- **Email**: `demo@satquery.ai`
- **Password**: `demo1234`

## API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Datasets
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/datasets` | List datasets (with filters) |
| GET | `/api/datasets/{id}` | Get single dataset |

### Images
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/images/upload` | Upload image (multipart) |
| GET | `/api/images/{id}` | Get image metadata |
| GET | `/api/images/{id}/file` | Download original file |
| GET | `/api/images/{id}/thumbnail` | Get thumbnail |

### Models
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/models` | List specialist models |
| GET | `/api/models/{id}` | Get model details |

### Analysis
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analysis` | Run orchestration pipeline |
| GET | `/api/analysis/history` | List user's analyses |
| GET | `/api/analysis/{id}` | Get analysis result |
| GET | `/api/analysis/{id}/messages` | Get chat messages |

## Environment Variables
Create a `.env` file in `backend/`:
```env
DATABASE_URL=sqlite:///./data/satquery.db
JWT_SECRET_KEY=your-secure-secret-key
DEBUG=true
MAX_UPLOAD_SIZE_MB=500
```

## Project Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI app, lifespan, routers
│   ├── config.py            # Settings (Pydantic Settings)
│   ├── database.py          # SQLAlchemy setup
│   ├── models.py            # ORM models
│   ├── schemas.py           # Pydantic schemas (API contracts)
│   ├── security.py          # JWT, password hashing
│   ├── deps.py              # FastAPI dependencies
│   ├── seed.py              # Database seeding
│   ├── routers/
│   │   ├── auth.py
│   │   ├── datasets.py
│   │   ├── images.py
│   │   ├── models_registry.py
│   │   └── analysis.py
│   └── services/
│       ├── storage.py       # Local file storage
│       ├── image_service.py # GeoTIFF processing, thumbnails
│       ├── specialist.py    # Simulated specialist models
│       └── orchestrator.py  # Agentic pipeline
└── tests/
    ├── test_auth.py
    ├── test_datasets.py
    ├── test_images.py
    └── test_analysis.py
```

## GeoTIFF Support
The backend uses **rasterio** for GeoTIFF metadata extraction. If rasterio is not available (e.g., on Windows without GDAL), it falls back to Pillow for basic image metadata.

To install rasterio:
```bash
# macOS
brew install gdal
uv pip install rasterio

# Linux
apt-get install gdal-bin libgdal-dev
uv pip install rasterio

# Or use conda
conda install -c conda-forge rasterio
```

## Testing
```bash
uv run pytest
```

## License
MIT