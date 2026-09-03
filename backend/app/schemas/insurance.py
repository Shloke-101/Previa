from pydantic import BaseModel, Field
from typing import Optional

class InsurancePolicyCreate(BaseModel):
    id: str
    patient_id: str
    payer_id: str
    payer_name: str
    plan_name: str
    member_id: str
    group_number: str
    policy_status: str = "ACTIVE"
    effective_date: str
    expiration_date: str
    in_network: bool = True
    copay_amount: float = 0.0
    coinsurance_percentage: float = 20.0
    deductible_total: float = 1500.0
    deductible_remaining: float = 350.0

class InsurancePolicyResponse(BaseModel):
    id: str
    patient_id: str
    payer_id: str
    payer_name: str
    plan_name: str
    member_id: str
    group_number: str
    policy_status: str
    effective_date: str
    expiration_date: str
    in_network: bool
    copay_amount: float
    coinsurance_percentage: float
    deductible_total: float
    deductible_remaining: float

    class Config:
        from_attributes = True
