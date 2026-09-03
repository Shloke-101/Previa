from pydantic import BaseModel, Field
from typing import Optional, Literal

class AuthorizationRequest(BaseModel):
    patient_id: str
    appointment_id: str
    cpt_code: str
    clinical_notes: Optional[str] = None
    urgency: Literal["ROUTINE", "EXPEDITED", "EMERGENCY"] = "ROUTINE"

class AuthorizationApprovalRequest(BaseModel):
    auth_number: str = "AUTH-PA-2026-X99"
    approved_by: str = "Payer Real-Time Portal Gateway"
    expiration_date: Optional[str] = "2026-12-31"

class AuthorizationResponse(BaseModel):
    patient_id: str
    cpt_code: str
    prior_auth_required: bool
    status: Literal["NOT_REQUIRED", "REQUIRED", "PENDING", "APPROVED", "DENIED"]
    auth_number: Optional[str] = None
    payer_policy_reference: Optional[str] = None
    expiration_date: Optional[str] = None
    notes: Optional[str] = None
