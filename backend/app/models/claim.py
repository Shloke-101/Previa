from sqlalchemy import String, Float, Integer, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from app.db.base import Base

class Claim(Base):
    __tablename__ = "claims"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True) # e.g. CLM-28491
    patient_id: Mapped[str] = mapped_column(String(64), nullable=True, index=True)
    member_name: Mapped[str] = mapped_column(String(128), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    claim_type: Mapped[str] = mapped_column(String(64), nullable=False) # Inpatient, Outpatient, Specialist, Prescription
    risk_level: Mapped[str] = mapped_column(String(32), default="Low") # Low, Medium, High
    prediction: Mapped[str] = mapped_column(String(32), default="Approve") # Approve, Deny
    status: Mapped[str] = mapped_column(String(32), default="Pending") # Approved, Denied, Pending, Under Review
    
    # Clinical & Ingestion details
    provider: Mapped[str] = mapped_column(String(128), nullable=True)
    submission_date: Mapped[str] = mapped_column(String(64), nullable=True)
    diagnosis: Mapped[str] = mapped_column(String(128), nullable=True)
    procedure: Mapped[str] = mapped_column(String(128), nullable=True)
    treatment_cost: Mapped[float] = mapped_column(Float, default=0.0)
    hospitalization_duration: Mapped[int] = mapped_column(Integer, default=0) # days
    age: Mapped[int] = mapped_column(Integer, default=45)
    gender: Mapped[str] = mapped_column(String(32), default="Female")
    policy_type: Mapped[str] = mapped_column(String(64), default="Commercial PPO")
    coverage_duration: Mapped[int] = mapped_column(Integer, default=24) # months
    previous_claims: Mapped[int] = mapped_column(Integer, default=1)
    
    # AI ML Assessment Fields
    risk_score: Mapped[int] = mapped_column(Integer, default=20) # 0-100
    confidence: Mapped[float] = mapped_column(Float, default=0.92) # 0.0-1.0
    explanation: Mapped[str] = mapped_column(Text, nullable=True)
    recommendation: Mapped[str] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
