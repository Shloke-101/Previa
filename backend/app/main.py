from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import SessionLocal
from app.db.init_db import init_db


# ---------------------------------------------------------------------------
# Database lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema & seed synthetic data on startup
    db = SessionLocal()

    try:
        init_db(db)
    finally:
        db.close()

    yield


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description=(
        "Explainable AI-powered Pre-Visit Financial Clearance, "
        "Real-Time Eligibility Verification, OCR Extraction & "
        "Denial Prevention System REST API."
    ),
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# API v1 Router
# ---------------------------------------------------------------------------

app.include_router(
    api_router,
    prefix=settings.API_V1_STR,
)


# ---------------------------------------------------------------------------
# Health endpoints
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "previa-backend",
        "gateway_270_271": "active",
    }


@app.get("/api-status", tags=["Health"])
def api_status():
    return {
        "status": "online",
        "system": "Previa (PVFC) Pre-Visit Financial Clearance API",
        "version": settings.PROJECT_VERSION,
        "docs_url": f"{settings.API_V1_STR}/docs",
    }


# ---------------------------------------------------------------------------
# Frontend configuration
# ---------------------------------------------------------------------------
#
# Docker builds the Vite frontend and copies:
#
# frontend/dist/
#       ↓
# /app/frontend_dist/
#
# main.py is located at:
#
# /app/app/main.py
#
# Therefore:
# Path(__file__).resolve().parents[2]
#       ↓
# /app
#
# ---------------------------------------------------------------------------

_possible_dirs = [
    Path(__file__).resolve().parents[1] / "frontend_dist",
    Path(__file__).resolve().parents[2] / "frontend_dist",
    Path(__file__).resolve().parents[2] / "frontend" / "dist",
    Path("/app/frontend_dist"),
]
FRONTEND_DIR = next((d for d in _possible_dirs if d.exists()), _possible_dirs[0])
FRONTEND_INDEX = FRONTEND_DIR / "index.html"



# ---------------------------------------------------------------------------
# Serve Vite static assets
# ---------------------------------------------------------------------------

if FRONTEND_DIR.exists():
    assets_dir = FRONTEND_DIR / "assets"

    if assets_dir.exists():
        app.mount(
            "/assets",
            StaticFiles(directory=assets_dir),
            name="frontend-assets",
        )


# ---------------------------------------------------------------------------
# SPA fallback
# ---------------------------------------------------------------------------
#
# React/Vite uses client-side routing.
#
# Example:
#
# /login
# /dashboard
# /patients
# /eligibility
#
# These routes don't physically exist as files.
# They must therefore return index.html so React Router can handle them.
#
# ---------------------------------------------------------------------------

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(full_path: str):
    # Don't attempt to serve frontend if it wasn't built.
    if not FRONTEND_INDEX.exists():
        return {
            "status": "online",
            "message": "Previa backend is running. Frontend build not found.",
        }

    requested_file = FRONTEND_DIR / full_path

    # Prevent path traversal outside frontend_dist.
    try:
        requested_file.resolve().relative_to(FRONTEND_DIR.resolve())
    except ValueError:
        return FileResponse(FRONTEND_INDEX)

    # If the requested path is an actual frontend file,
    # serve it directly.
    if requested_file.is_file():
        return FileResponse(requested_file)

    # Otherwise return index.html.
    # React Router will handle the URL.
    return FileResponse(FRONTEND_INDEX)