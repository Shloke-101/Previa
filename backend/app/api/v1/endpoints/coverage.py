from fastapi import APIRouter
from app.schemas.coverage import CoverageCheckRequest, CoverageCheckResponse
from app.services.coverage_service import check_procedure_coverage

router = APIRouter()

@router.post("/check", response_model=CoverageCheckResponse, summary="Check procedure coverage and prior auth mandate")
def check_coverage(req: CoverageCheckRequest):
    """Verifies whether a procedure (CPT) is covered and determines prior authorization mandate."""
    return check_procedure_coverage(req.patient_id, req.cpt_code)
