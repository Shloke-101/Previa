from sqlalchemy import String, Float, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from app.db.base import Base

class DenialRecord(Base):
    __tablename__ = "denial_records"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    carc_code: Mapped[str] = mapped_column(String(32), nullable=False, index=True) # e.g. CO-197, CO-27, CO-16
    category: Mapped[str] = mapped_column(String(128), nullable=False)
    count: Mapped[int] = mapped_column(Integer, default=1)
    preventable_percentage: Mapped[int] = mapped_column(Integer, default=90)
    color: Mapped[str] = mapped_column(String(32), default="#ef4444")
    total_dollar_impact: Mapped[float] = mapped_column(Float, default=0.0)
    payer_name: Mapped[str] = mapped_column(String(128), default="Commercial Payer")
    root_cause: Mapped[str] = mapped_column(String(256), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
