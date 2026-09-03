from pydantic import BaseModel, Field
from typing import Optional

class AppointmentCreate(BaseModel):
    id: str
    patient_id: str
    appointment_datetime: str
    department: str
    provider_name: str
    cpt_code: str
    service_description: str
    estimated_cost: float = 500.0

class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    appointment_datetime: str
    department: str
    provider_name: str
    cpt_code: str
    service_description: str
    estimated_cost: float

    class Config:
        from_attributes = True
