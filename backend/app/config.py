from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    APP_NAME: str = "SatQuery AI"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "sqlite:///./data/satquery.db"

    # Storage
    DATA_DIR: str = "./data"
    UPLOAD_DIR: str = "./data/uploads"
    THUMBNAIL_DIR: str = "./data/thumbnails"

    # JWT
    JWT_SECRET_KEY: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # Image processing
    MAX_UPLOAD_SIZE_MB: int = 500
    THUMBNAIL_SIZE: tuple[int, int] = (256, 256)

    @property
    def upload_path(self) -> Path:
        return Path(self.UPLOAD_DIR)

    @property
    def thumbnail_path(self) -> Path:
        return Path(self.THUMBNAIL_DIR)

    @property
    def data_path(self) -> Path:
        return Path(self.DATA_DIR)


settings = Settings()