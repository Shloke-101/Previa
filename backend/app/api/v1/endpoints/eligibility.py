from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.eligibility import EligibilityVerifyRequest, EligibilityVerifyResponse
from app.services.eligibility_service import verify_patient_eligibility

router = APIRouter()

@router.post("/verify", response_model=EligibilityVerifyResponse, summary="Execute real-time 270/271 EDI eligibility verification")
def verify_eligibility(req: EligibilityVerifyRequest, db: Session = Depends(get_db)):
    """Simulates real-time electronic 270/271 inquiry against connected payer clearinghouse."""
    return verify_patient_eligibility(db, req.patient_id)
