import os
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SkinFit AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    # Security
    JWT_SECRET_KEY: str = "skinfit_secret_key_development_only_change_in_production_32chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./skinfit.db"
    
    # AI / LLM / RAG Providers
    LLM_PROVIDER: str = "local"  # "local", "gemini", "openai"
    EMBEDDING_PROVIDER: str = "local"  # "local", "gemini", "openai", "sentence_transformers"
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    # Vector Database
    VECTOR_STORE: str = "memory"  # "chroma", "faiss", "memory"
    CHROMA_HOST: Optional[str] = None
    CHROMA_PORT: Optional[int] = 8000
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_data"
    
    # Redis
    REDIS_URL: Optional[str] = None
    
    # Storage
    IMAGE_STORAGE_PATH: str = "./storage"
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_IMAGE_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp"]
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def sync_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("sqlite+aiosqlite:///"):
            return url.replace("sqlite+aiosqlite:///", "sqlite:///")
        if url.startswith("postgresql+psycopg://"):
            return url.replace("postgresql+psycopg://", "postgresql://")
        return url


settings = Settings()

# Ensure directories exist
os.makedirs(settings.IMAGE_STORAGE_PATH, exist_ok=True)
os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
