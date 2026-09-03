from typing import Optional, Dict, Any, List
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, EmailStr
from backend.app.schemas.insurance import InsurancePolicyResponse

class PatientBase(BaseModel):
    first_name: str = Field(..., min_length=1, description="Patient legal first name")
    last_name: str = Field(..., min_length=1, description="Patient legal last name")
    date_of_birth: date = Field(..., description="Date of birth (YYYY-MM-DD)")
    gender: str = Field(..., description="Gender (MALE, FEMALE, OTHER, UNKNOWN)")
    mrn: str = Field(..., description="Medical Record Number")
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[Dict[str, Any]] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    patient_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AppointmentSummary(BaseModel):
    appointment_id: str
    patient_id: str
    insurance_policy_id: Optional[str] = None
    appointment_time: datetime
    provider_name: str
    department: str
    procedure_code: str
    procedure_description: str
    estimated_cost: Decimal
    status: str

    class Config:
        from_attributes = True

class PatientDetail(PatientResponse):
    insurance_policies: List[InsurancePolicyResponse] = []
    appointments: List[AppointmentSummary] = []

    class Config:
        from_attributes = True
