from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session

from ..schemas import SpecialistModel
from ..deps import get_db
from ..security import get_current_active_user
from ..services.specialist import SPECIALIST_REGISTRY
from ..models import User

router = APIRouter(prefix="/models", tags=["models"])


@router.get("", response_model=List[SpecialistModel])
def list_models(
    type: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List available specialist models."""
    models = list(SPECIALIST_REGISTRY.values())

    if type:
        models = [m for m in models if m.type == type]

    if status:
        models = [m for m in models if m.status == status]

    return models


@router.get("/{model_id}", response_model=SpecialistModel)
def get_model(
    model_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific model by ID."""
    model = SPECIALIST_REGISTRY.get(model_id)
    if not model:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Model not found")
    return model