from sqlalchemy import String, Float, Integer, Boolean, Text, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.db.base import Base

class SelfHealProblem(Base):
    __tablename__ = "self_heal_problems"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True) # e.g. PROB-ID-01
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    error_category: Mapped[str] = mapped_column(String(128), nullable=False, index=True) # PATIENT_IDENTITY, AUTHORIZATION, MODIFIER_RULES, ELIGIBILITY
    error_code: Mapped[str] = mapped_column(String(64), nullable=False, index=True) # e.g. ERR-ID-MISMATCH, CO-197
    frequency: Mapped[int] = mapped_column(Integer, default=1)
    affected_claims_count: Mapped[int] = mapped_column(Integer, default=1)
    financial_impact: Mapped[float] = mapped_column(Float, default=0.0) # in currency
    priority_score: Mapped[float] = mapped_column(Float, default=0.0) # 0 to 100
    priority_level: Mapped[str] = mapped_column(String(32), default="HIGH") # HIGH, MEDIUM, LOW
    recurrence_factor: Mapped[str] = mapped_column(String(32), default="HIGH") # HIGH, MEDIUM, LOW
    preventability: Mapped[str] = mapped_column(String(32), default="HIGH") # HIGH, MEDIUM, LOW
    root_cause: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_action: Mapped[str] = mapped_column(Text, nullable=False)
    upstream_fix: Mapped[str] = mapped_column(Text, nullable=False)
    decision_type: Mapped[str] = mapped_column(String(64), default="SAFE_AUTO_FIX") # SAFE_AUTO_FIX, REQUIRES_OPERATOR, BLOCK_AND_REVIEW, INFORMATIONAL
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE", index=True) # ACTIVE, AUTO_RESOLVED, AWAITING_REVIEW, BLOCKED, DISMISSED
    confidence: Mapped[float] = mapped_column(Float, default=0.95) # 0.0 to 1.0
    affected_payers: Mapped[List[str]] = mapped_column(JSON, default=list)
    affected_procedures: Mapped[List[str]] = mapped_column(JSON, default=list)
    sample_claims: Mapped[List[str]] = mapped_column(JSON, default=list)
    first_detected: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_detected: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class SelfHealAuditEvent(Base):
    __tablename__ = "self_heal_audit_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True) # e.g. EVT-9921
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    claim_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    patient_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    problem_detected: Mapped[str] = mapped_column(String(256), nullable=False)
    error_category: Mapped[str] = mapped_column(String(128), nullable=False)
    root_cause: Mapped[str] = mapped_column(Text, nullable=False)
    original_value: Mapped[str] = mapped_column(Text, nullable=False)
    corrected_value: Mapped[str] = mapped_column(Text, nullable=False)
    rule_used: Mapped[str] = mapped_column(String(128), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.98)
    system_action: Mapped[str] = mapped_column(String(64), default="AUTO-RESOLVED", index=True) # AUTO-RESOLVED, PREVENTED, REQUIRES REVIEW, BLOCKED, ROLLED_BACK
    verification_result: Mapped[str] = mapped_column(String(64), default="PASSED") # PASSED, FAILED, PENDING
    rollback_available: Mapped[bool] = mapped_column(Boolean, default=True)
    rollback_status: Mapped[str] = mapped_column(String(32), default="ACTIVE") # ACTIVE, ROLLED_BACK
    operator_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class SelfHealRule(Base):
    __tablename__ = "self_heal_rules"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True) # e.g. RULE-NAME-NORM
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    trigger: Mapped[str] = mapped_column(String(256), nullable=False)
    conditions: Mapped[List[str]] = mapped_column(JSON, default=list)
    action: Mapped[str] = mapped_column(Text, nullable=False)
    safety_classification: Mapped[str] = mapped_column(String(64), default="SAFE_AUTO_FIX") # SAFE_AUTO_FIX, REQUIRES_OPERATOR, BLOCK_AND_REVIEW
    confidence_threshold: Mapped[float] = mapped_column(Float, default=0.95)
    rollback_supported: Mapped[bool] = mapped_column(Boolean, default=True)
    audit_required: Mapped[bool] = mapped_column(Boolean, default=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    execution_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class PayerRuleDriftRecord(Base):
    __tablename__ = "payer_rule_drift_records"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    payer_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    payer_name: Mapped[str] = mapped_column(String(128), nullable=False)
    procedure_code: Mapped[str] = mapped_column(String(32), nullable=False) # e.g. CPT 12345
    changed_rule: Mapped[str] = mapped_column(String(128), nullable=False) # e.g. Modifier 25
    old_state: Mapped[str] = mapped_column(String(128), default="ACCEPTED")
    new_state: Mapped[str] = mapped_column(String(128), default="REJECTED")
    detected_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    affected_claims_count: Mapped[int] = mapped_column(Integer, default=0)
    revenue_at_risk: Mapped[float] = mapped_column(Float, default=0.0)
    recommended_action: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="REQUIRES_REVIEW") # AUTO_UPDATED, REQUIRES_REVIEW, DISMISSED
    is_safe_auto_update: Mapped[bool] = mapped_column(Boolean, default=False)
