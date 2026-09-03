from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Previa — Pre-Visit Financial Clearance System (PVFC)"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database Configuration (SQLite default with PostgreSQL support)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./previa.db")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = ["*"]
    
    # Security & Environment
    SECRET_KEY: str = os.getenv("SECRET_KEY", "previa-super-secret-production-key-2026")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = True

    class Config:
        case_sensitive = True

settings = Settings()
