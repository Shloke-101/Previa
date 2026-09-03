from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ClearanceEvaluationRequest(BaseModel):
    patient_id: str
    appointment_id: str

class RiskFactor(BaseModel):
    factor_code: str
    reason: str
    impact: int

class ClearanceEvaluationResponse(BaseModel):
    clearance_id: Optional[str] = None
    patient_id: str
    appointment_id: str
    clearance_status: str = Field(..., description="CLEARED, NEEDS_ACTION, HIGH_RISK")
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str = Field(..., description="LOW, MEDIUM, HIGH")
    is_blocked: bool
    blocking_reasons: List[str] = []
    factors: List[RiskFactor] = []
    recommended_actions: List[Dict[str, Any]] = []
    evaluated_at: datetime
    evaluated_by: str = "CLEARANCE_ENGINE_v0.1"

    class Config:
        from_attributes = True
