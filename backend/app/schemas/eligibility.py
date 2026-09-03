from pydantic import BaseModel, Field
from typing import Optional, Literal

class EligibilityVerifyRequest(BaseModel):
    patient_id: str
    member_id: Optional[str] = None
    payer_id: Optional[str] = None
    appointment_id: Optional[str] = None

class EligibilityVerifyResponse(BaseModel):
    patient_id: str
    member_id: str
    payer_name: str
    eligibility_status: Literal["ACTIVE", "INACTIVE", "TERMINATED"]
    is_eligible: bool
    effective_date: str
    expiration_date: str
    in_network: bool
    response_code_edi_271: str = "1" # 1 = Active, 6 = Inactive, 7 = Terminated
    verification_timestamp: str
    notes: Optional[str] = None
