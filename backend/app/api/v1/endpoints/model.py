from fastapi import APIRouter
from app.schemas.analytics import ModelMetricsResponse
from app.services.ml_service import ml_engine

router = APIRouter()

@router.get("/metrics", response_model=ModelMetricsResponse, summary="Get ML model performance metrics")
def get_model_metrics():
    """Returns statistical performance metrics for the claims denial prediction model."""
    return ml_engine.get_metrics()
