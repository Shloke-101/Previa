from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.routers import (
    health_router,
    patients_router,
    appointments_router,
    insurance_router,
    clearance_router,
    dashboard_router
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Previa (PVFC) - Pre-Visit Financial Clearance API",
    description="Intelligent healthcare pre-visit financial clearance platform API. Automates insurance eligibility, prior authorization detection, risk estimation, and operational clearance.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(patients_router, prefix=settings.API_PREFIX)
app.include_router(appointments_router, prefix=settings.API_PREFIX)
app.include_router(insurance_router, prefix=settings.API_PREFIX)
app.include_router(clearance_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "message": "Welcome to Previa (PVFC) Pre-Visit Financial Clearance API",
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health"
    }
