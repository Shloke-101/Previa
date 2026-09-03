from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

class PatientCreate(BaseModel):
    id: str = Field(..., description="Unique Patient Identifier e.g. PAT-1082")
    first_name: str
    last_name: str
    dob: str = Field(..., description="YYYY-MM-DD")
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class PatientResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    dob: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True

class DossierInsurance(BaseModel):
    payer_id: str
    payer_name: str
    plan_name: str
    member_id: str
    group_number: str
    policy_status: str
    effective_date: str
    expiration_date: str
    in_network: bool

class DossierAppointment(BaseModel):
    appointment_id: str
    datetime: str
    department: str
    provider_name: str
    cpt_code: str
    service_description: str

class DossierFinancials(BaseModel):
    total_estimated_cost: float
    deductible_total: float
    deductible_remaining: float
    copay_amount: float
    coinsurance_percentage: float
    coinsurance_amount: float
    estimated_patient_responsibility: float
    estimated_payer_responsibility: float

class DossierPriorAuth(BaseModel):
    required: bool
    status: str
    auth_number: Optional[str] = None
    notes: Optional[str] = None

class DossierClearance(BaseModel):
    status: str
    risk_score: int
    risk_level: str
    data_validation_status: str
    flags: List[str] = []
    recommended_actions: List[str] = []

class PatientDossierResponse(BaseModel):
    patient_id: str
    first_name: str
    last_name: str
    dob: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    insurance: DossierInsurance
    appointment: DossierAppointment
    financials: DossierFinancials
    prior_auth: DossierPriorAuth
    clearance: DossierClearance
