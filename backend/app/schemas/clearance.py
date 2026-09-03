from pydantic import BaseModel, Field
from typing import Optional, List, Literal

class ClearanceEvaluationRequest(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    force_reverify_270: bool = False

class RiskFactorBreakdown(BaseModel):
    id: str
    name: str
    category: str # ELIGIBILITY, AUTHORIZATION, DATA_MISMATCH, NETWORK, HISTORICAL
    weight: float
    scoreContribution: int
    description: str
    status: Literal["PASS", "WARNING", "FAIL"]

class ClearanceEvaluationResponse(BaseModel):
    patient_id: str
    appointment_id: str
    clearance_status: Literal["CLEARED", "NEEDS_ACTION", "HIGH_RISK"]
    composite_risk_score: int
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    eligibility_status: Literal["ACTIVE", "INACTIVE", "TERMINATED"]
    authorization_status: Literal["NOT_REQUIRED", "REQUIRED", "PENDING", "APPROVED", "DENIED"]
    auth_number: Optional[str] = None
    data_validation_status: Literal["MATCH", "PARTIAL_MATCH", "MISMATCH"]
    estimated_patient_responsibility: float
    primary_blocker: Optional[str] = None
    recommended_actions: List[str] = []
    risk_factors: List[RiskFactorBreakdown] = []
    evaluation_timestamp: str

class PriorityQueueItem(BaseModel):
    patient_id: str
    patient_name: str
    dob: str
    appointment_id: str
    appointment_datetime: str
    procedure_code: str
    procedure_name: str
    payer_name: str
    member_id: str
    group_number: str
    clearance_status: Literal["CLEARED", "NEEDS_ACTION", "HIGH_RISK"]
    risk_score: int
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    eligibility_status: Literal["ACTIVE", "INACTIVE", "TERMINATED"]
    authorization_status: Literal["NOT_REQUIRED", "REQUIRED", "PENDING", "APPROVED", "DENIED"]
    auth_number: Optional[str] = None
    data_validation_status: Literal["MATCH", "PARTIAL_MATCH", "MISMATCH"]
    estimated_patient_responsibility: float
    primary_blocker: Optional[str] = None
    recommended_actions: List[str] = []

class ClearanceSummaryResponse(BaseModel):
    total_encounters: int
    cleared_count: int
    needs_action_count: int
    high_risk_count: int
    clearance_rate_pct: float
    at_risk_revenue: float
    queue: List[PriorityQueueItem]
