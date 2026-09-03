from sqlalchemy import String, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.patient import Patient
    from app.models.clearance import ClearanceRecord

class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True) # e.g. APT-8821
    patient_id: Mapped[str] = mapped_column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), index=True)
    appointment_datetime: Mapped[str] = mapped_column(String(64), nullable=False) # e.g. "2026-09-04 09:30 AM"
    department: Mapped[str] = mapped_column(String(128), nullable=False)
    provider_name: Mapped[str] = mapped_column(String(128), nullable=False)
    cpt_code: Mapped[str] = mapped_column(String(32), nullable=False, index=True) # e.g. "72148"
    service_description: Mapped[str] = mapped_column(String(256), nullable=False)
    estimated_cost: Mapped[float] = mapped_column(Float, default=500.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    patient: Mapped["Patient"] = relationship("Patient", back_populates="appointments")
    clearance_record: Mapped["ClearanceRecord"] = relationship("ClearanceRecord", back_populates="appointment", uselist=False, cascade="all, delete-orphan")
