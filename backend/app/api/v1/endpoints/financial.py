from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.financial import FinancialEstimateRequest, FinancialEstimateResponse
from app.services.financial_service import calculate_financial_responsibility

router = APIRouter()

@router.post("/estimate", response_model=FinancialEstimateResponse, summary="Calculate patient out-of-pocket financial liability")
def estimate_financial_responsibility(req: FinancialEstimateRequest, db: Session = Depends(get_db)):
    """Calculates patient deductible, copay, coinsurance, and total responsibility."""
    return calculate_financial_responsibility(db, req.patient_id, req.procedure_cost)
