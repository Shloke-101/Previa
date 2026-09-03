from sqlalchemy import String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.patient import Patient

class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True) # e.g. POL-9823
    patient_id: Mapped[str] = mapped_column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), index=True)
    payer_id: Mapped[str] = mapped_column(String(64), nullable=False) # e.g. BCBS-IL
    payer_name: Mapped[str] = mapped_column(String(128), nullable=False)
    plan_name: Mapped[str] = mapped_column(String(128), nullable=False)
    member_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    group_number: Mapped[str] = mapped_column(String(64), nullable=False)
    policy_status: Mapped[str] = mapped_column(String(32), default="ACTIVE") # ACTIVE, INACTIVE, TERMINATED, PENDING
    effective_date: Mapped[str] = mapped_column(String(32), nullable=False)
    expiration_date: Mapped[str] = mapped_column(String(32), nullable=False)
    in_network: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Benefit parameters
    copay_amount: Mapped[float] = mapped_column(Float, default=0.0)
    coinsurance_percentage: Mapped[float] = mapped_column(Float, default=20.0) # e.g. 20%
    deductible_total: Mapped[float] = mapped_column(Float, default=1500.0)
    deductible_remaining: Mapped[float] = mapped_column(Float, default=350.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    patient: Mapped["Patient"] = relationship("Patient", back_populates="insurance_policies")
