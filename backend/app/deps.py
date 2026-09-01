from typing import Generator
from sqlalchemy.orm import Session
from fastapi import Depends

from .database import SessionLocal
from .security import get_current_user, get_current_active_user
from .models import User


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Re-export for convenience
__all__ = ["get_db", "get_current_user", "get_current_active_user"]