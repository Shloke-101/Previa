from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel

class DashboardSummaryResponse(BaseModel):
    total_upcoming_patients: int
    cleared_count: int
    needs_action_count: int
    high_risk_count: int
    pending_verification_count: int
    potential_financial_exposure: float
    prevented_denial_dollars: float

class DashboardPriorityItem(BaseModel):
    appointment_id: str
    patient_id: str
    patient_name: str
    mrn: str
    appointment_time: datetime
    department: str
    procedure_code: str
    procedure_description: str
    payer_name: Optional[str] = None
    clearance_status: str
    risk_score: int
    risk_level: str
    primary_issue: Optional[str] = None
    recommended_action: Optional[str] = None
    priority_rank: int

class DashboardAlert(BaseModel):
    alert_id: str
    appointment_id: str
    patient_id: str
    patient_name: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    alert_type: str  # MISSING_AUTHORIZATION, EXPIRED_POLICY, DATA_MISMATCH, HIGH_RISK
    message: str
    created_at: datetime
