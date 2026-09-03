import uuid
from datetime import datetime
from sqlalchemy import Column, String, Date, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"

    insurance_policy_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.patient_id"), nullable=False, index=True)
    payer_name = Column(String(150), nullable=False)
    payer_id = Column(String(50), nullable=False)
    plan_name = Column(String(150), nullable=True)
    member_id = Column(String(50), nullable=False, index=True)
    policy_number = Column(String(50), nullable=False)
    group_number = Column(String(50), nullable=True)
    policy_status = Column(String(30), nullable=False, default="ACTIVE")
    network_tier = Column(String(30), nullable=False, default="IN_NETWORK")
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    card_ocr_data = Column(JSON, nullable=True)
    field_validations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="insurance_policies")
    appointments = relationship("Appointment", back_populates="insurance_policy")
