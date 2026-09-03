from sqlalchemy import String, Boolean, Integer, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from app.db.base import Base

class PreventiveRule(Base):
    __tablename__ = "preventive_rules"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True) # e.g. rule-1
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    trigger_type: Mapped[str] = mapped_column(String(64), default="TIME_BASED") # TIME_BASED, EVENT_BASED, THRESHOLD
    trigger_condition: Mapped[str] = mapped_column(String(256), nullable=False)
    action: Mapped[str] = mapped_column(String(256), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    prevented_count_this_month: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
