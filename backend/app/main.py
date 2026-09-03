from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import SessionLocal
from app.db.init_db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema & seed synthetic data on startup
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Explainable AI-powered Pre-Visit Financial Clearance, Real-Time Eligibility Verification, OCR Extraction & Denial Prevention System REST API.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "system": "Previa (PVFC) Pre-Visit Financial Clearance API",
        "version": settings.PROJECT_VERSION,
        "docs_url": f"{settings.API_V1_STR}/docs"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "previa-backend", "gateway_270_271": "active"}
