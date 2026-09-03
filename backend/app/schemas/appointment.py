from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from backend.app.schemas.insurance import InsurancePolicyResponse
from backend.app.schemas.patient import PatientResponse

class AppointmentBase(BaseModel):
    patient_id: str
    insurance_policy_id: Optional[str] = None
    appointment_time: datetime
    provider_name: str
    department: str
    facility_name: Optional[str] = None
    procedure_code: str
    procedure_description: str
    estimated_cost: Decimal = Field(default=Decimal("0.0"))
    status: str = Field(default="SCHEDULED")

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase):
    appointment_id: str
    created_at: datetime
    updated_at: datetime
    patient: Optional[PatientResponse] = None
    insurance_policy: Optional[InsurancePolicyResponse] = None

    class Config:
        from_attributes = True
