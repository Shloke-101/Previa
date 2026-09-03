from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.authorization import AuthorizationRequest, AuthorizationResponse, AuthorizationApprovalRequest
from app.services.authorization_service import get_authorization_status, approve_patient_authorization

router = APIRouter()

@router.post("", response_model=AuthorizationResponse, summary="Query prior authorization mandate")
def query_authorization(req: AuthorizationRequest, db: Session = Depends(get_db)):
    """Determines prior authorization requirements and current determination status."""
    return get_authorization_status(db, req.patient_id, req.cpt_code)

@router.post("/{patient_id}/approve", response_model=AuthorizationResponse, summary="Approve prior authorization & financially clear patient")
def approve_authorization(
    patient_id: str,
    approval_in: AuthorizationApprovalRequest = AuthorizationApprovalRequest(),
    db: Session = Depends(get_db)
):
    """Approve prior authorization determination number, marking encounter CLEARED deterministically."""
    record = approve_patient_authorization(db, patient_id, approval_in.auth_number)
    if not record:
        raise HTTPException(status_code=404, detail=f"No encounter record found for patient '{patient_id}'.")
    
    return AuthorizationResponse(
        patient_id=patient_id,
        cpt_code="CPT-APPROVED",
        prior_auth_required=True,
        status="APPROVED",
        auth_number=record.auth_number,
        payer_policy_reference=approval_in.approved_by,
        notes="Prior Authorization approved and recorded. Encounter is financially CLEARED."
    )
