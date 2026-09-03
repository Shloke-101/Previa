from pydantic import BaseModel, Field
from typing import Optional, List

class CoverageCheckRequest(BaseModel):
    patient_id: str
    cpt_code: str
    payer_id: Optional[str] = None

class CoverageCheckResponse(BaseModel):
    patient_id: str
    cpt_code: str
    service_description: str
    is_covered: bool
    requires_prior_auth: bool
    in_network: bool
    tier: str = "Tier 1 - In-Network"
    coverage_percentage: float = 80.0
    patient_coinsurance_percentage: float = 20.0
    policy_exclusions: List[str] = []
    clinical_notes: Optional[str] = None
