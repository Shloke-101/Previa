from pydantic import BaseModel, Field
from typing import Optional

class FinancialEstimateRequest(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    procedure_cost: Optional[float] = None

class FinancialEstimateResponse(BaseModel):
    patient_id: str
    total_estimated_cost: float
    deductible_total: float
    deductible_remaining: float
    copay_amount: float
    coinsurance_percentage: float
    coinsurance_amount: float
    estimated_patient_responsibility: float
    estimated_payer_responsibility: float
    formula_used: str = "Deductible_Remaining + Copay + (Allowable - Deductible_Remaining) * Coinsurance_Pct"
