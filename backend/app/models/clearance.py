from sqlalchemy import String, Float, Integer, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional, List
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.patient import Patient
    from app.models.appointment import Appointment

class ClearanceRecord(Base):
    __tablename__ = "clearance_records"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    patient_id: Mapped[str] = mapped_column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), index=True)
    appointment_id: Mapped[str] = mapped_column(String(64), ForeignKey("appointments.id", ondelete="CASCADE"), unique=True, index=True)
    
    # Canonical Clearance & Risk Status
    clearance_status: Mapped[str] = mapped_column(String(32), default="CLEARED", index=True) # CLEARED, NEEDS_ACTION, HIGH_RISK
    risk_score: Mapped[int] = mapped_column(Integer, default=20) # 0 to 100
    risk_level: Mapped[str] = mapped_column(String(32), default="LOW") # LOW, MEDIUM, HIGH
    
    # Pre-service Verification Findings
    eligibility_status: Mapped[str] = mapped_column(String(32), default="ACTIVE") # ACTIVE, INACTIVE, TERMINATED
    authorization_status: Mapped[str] = mapped_column(String(32), default="NOT_REQUIRED") # NOT_REQUIRED, REQUIRED, PENDING, APPROVED, DENIED
    auth_number: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    data_validation_status: Mapped[str] = mapped_column(String(32), default="MATCH") # MATCH, PARTIAL_MATCH, MISMATCH
    
    # Financial Estimation
    estimated_patient_responsibility: Mapped[float] = mapped_column(Float, default=0.0)
    primary_blocker: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recommended_actions: Mapped[List[str]] = mapped_column(JSON, default=list)
    flags: Mapped[List[str]] = mapped_column(JSON, default=list)
    
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    patient: Mapped["Patient"] = relationship("Patient", back_populates="clearance_records")
    appointment: Mapped["Appointment"] = relationship("Appointment", back_populates="clearance_record")
