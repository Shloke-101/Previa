from typing import Optional, Dict, Any, List
from datetime import date, datetime
from pydantic import BaseModel, Field

class InsurancePolicyBase(BaseModel):
    patient_id: str
    payer_name: str
    payer_id: str
    plan_name: Optional[str] = None
    member_id: str
    policy_number: str
    group_number: Optional[str] = None
    policy_status: str = Field(default="ACTIVE", description="ACTIVE, INACTIVE, EXPIRED, TERMINATED")
    network_tier: str = Field(default="IN_NETWORK", description="IN_NETWORK, OUT_OF_NETWORK, TIER_2")
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    card_ocr_data: Optional[Dict[str, Any]] = None
    field_validations: Optional[List[Dict[str, Any]]] = None

class InsurancePolicyCreate(InsurancePolicyBase):
    pass

class InsurancePolicyResponse(InsurancePolicyBase):
    insurance_policy_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
