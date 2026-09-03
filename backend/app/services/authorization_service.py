from sqlalchemy.orm import Session
from app.models.clearance import ClearanceRecord
from app.models.appointment import Appointment
from app.services.coverage_service import check_procedure_coverage
from app.schemas.authorization import AuthorizationResponse

def get_authorization_status(db: Session, patient_id: str, cpt_code: str) -> AuthorizationResponse:
    """Retrieves or derives the current prior authorization status for a patient and CPT code."""
    coverage = check_procedure_coverage(patient_id, cpt_code)
    
    if not coverage.requires_prior_auth:
        return AuthorizationResponse(
            patient_id=patient_id,
            cpt_code=cpt_code,
            prior_auth_required=False,
            status="NOT_REQUIRED",
            notes="Service does not mandate prior authorization under current clinical policy."
        )

    # Check existing clearance record
    clearance = db.query(ClearanceRecord).filter(ClearanceRecord.patient_id == patient_id).first()
    if clearance:
        return AuthorizationResponse(
            patient_id=patient_id,
            cpt_code=cpt_code,
            prior_auth_required=True,
            status=clearance.authorization_status,
            auth_number=clearance.auth_number,
            payer_policy_reference="BCBS-RAD-AUTH-2026",
            notes="Prior authorization required. Status derived from clearinghouse records."
        )

    return AuthorizationResponse(
        patient_id=patient_id,
        cpt_code=cpt_code,
        prior_auth_required=True,
        status="REQUIRED",
        notes="Prior authorization is mandated by payer rules for this procedure."
    )

def approve_patient_authorization(db: Session, patient_id: str, auth_number: str = "AUTH-PA-2026-X99") -> ClearanceRecord:
    """Approves authorization and updates clearance status to CLEARED deterministically."""
    clearance = db.query(ClearanceRecord).filter(ClearanceRecord.patient_id == patient_id).first()
    if clearance:
        clearance.authorization_status = "APPROVED"
        clearance.auth_number = auth_number
        clearance.clearance_status = "CLEARED"
        clearance.risk_score = 15
        clearance.risk_level = "LOW"
        clearance.primary_blocker = None
        clearance.recommended_actions = [f"Prior Authorization approved (#{auth_number}). Encounter financially cleared."]
        clearance.flags = []
        db.commit()
        db.refresh(clearance)
    return clearance
