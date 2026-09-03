import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.app.database import Base

class ClearanceRecord(Base):
    __tablename__ = "clearance_records"

    clearance_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.patient_id"), nullable=False, index=True)
    appointment_id = Column(String(36), ForeignKey("appointments.appointment_id"), nullable=False, index=True)
    clearance_status = Column(String(30), nullable=False)  # CLEARED, NEEDS_ACTION, HIGH_RISK
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH
    is_blocked = Column(Boolean, nullable=False, default=False)
    blocking_reasons = Column(JSON, nullable=True)
    factors = Column(JSON, nullable=True)
    recommended_actions = Column(JSON, nullable=True)
    evaluated_at = Column(DateTime, default=datetime.utcnow)
    evaluated_by = Column(String(50), default="CLEARANCE_ENGINE_v1")

    # Relationships
    appointment = relationship("Appointment", back_populates="clearance_records")
