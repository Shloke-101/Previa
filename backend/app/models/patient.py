import uuid
from datetime import datetime
from sqlalchemy import Column, String, Date, DateTime, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(20), nullable=False)
    mrn = Column(String(50), nullable=False, unique=True, index=True)
    phone = Column(String(30), nullable=True)
    email = Column(String(150), nullable=True)
    address = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    insurance_policies = relationship("InsurancePolicy", back_populates="patient", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
