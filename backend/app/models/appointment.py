import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    appointment_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.patient_id"), nullable=False, index=True)
    insurance_policy_id = Column(String(36), ForeignKey("insurance_policies.insurance_policy_id"), nullable=True, index=True)
    appointment_time = Column(DateTime, nullable=False, index=True)
    provider_name = Column(String(150), nullable=False)
    department = Column(String(100), nullable=False)
    facility_name = Column(String(150), nullable=True)
    procedure_code = Column(String(30), nullable=False)
    procedure_description = Column(String(255), nullable=False)
    estimated_cost = Column(Numeric(10, 2), nullable=False, default=0.0)
    status = Column(String(30), nullable=False, default="SCHEDULED")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    insurance_policy = relationship("InsurancePolicy", back_populates="appointments")
    clearance_records = relationship("ClearanceRecord", back_populates="appointment", cascade="all, delete-orphan")
