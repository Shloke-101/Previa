from fastapi import APIRouter
from datetime import datetime

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Previa (PVFC) Backend API",
        "version": "0.1.0",
        "timestamp": datetime.utcnow().isoformat()
    }
