from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import List, TYPE_CHECKING
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.insurance import InsurancePolicy
    from app.models.appointment import Appointment
    from app.models.clearance import ClearanceRecord

class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True) # e.g. PAT-1082
    first_name: Mapped[str] = mapped_column(String(128), nullable=False)
    last_name: Mapped[str] = mapped_column(String(128), nullable=False)
    dob: Mapped[str] = mapped_column(String(32), nullable=False) # YYYY-MM-DD
    phone: Mapped[str] = mapped_column(String(64), nullable=True)
    email: Mapped[str] = mapped_column(String(128), nullable=True)
    address: Mapped[str] = mapped_column(String(256), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    insurance_policies: Mapped[List["InsurancePolicy"]] = relationship("InsurancePolicy", back_populates="patient", cascade="all, delete-orphan")
    appointments: Mapped[List["Appointment"]] = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    clearance_records: Mapped[List["ClearanceRecord"]] = relationship("ClearanceRecord", back_populates="patient", cascade="all, delete-orphan")
