from sqlalchemy import String, Float, Integer, Boolean, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.db.base import Base

class DocumentRecord(Base):
    __tablename__ = "document_records"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True) # e.g. DOC-10482
    filename: Mapped[str] = mapped_column(String(256), nullable=False)
    file_type: Mapped[str] = mapped_column(String(32), default="PDF") # PDF, PNG, JPG, JPEG, TIFF
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    file_hash: Mapped[str] = mapped_column(String(64), index=True) # SHA-256 for duplicate detection
    
    # Classification
    document_type: Mapped[str] = mapped_column(String(64), default="INSURANCE_CARD", index=True)
    # INSURANCE_CARD, PATIENT_ID, GOVERNMENT_ID, AUTHORIZATION, REFERRAL, EOB, ERA, CLAIM_FORM, MEDICAL_DOCUMENT, PROVIDER_DOCUMENT, ELIGIBILITY_DOCUMENT, OTHER
    type_confidence: Mapped[float] = mapped_column(Float, default=0.95)
    
    # OCR & Quality
    ocr_engine: Mapped[str] = mapped_column(String(64), default="PyMuPDF+AdaptiveParser")
    ocr_confidence: Mapped[float] = mapped_column(Float, default=0.95)
    quality_score: Mapped[float] = mapped_column(Float, default=0.92) # 0.0 - 1.0 (legibility, blur, contrast)
    page_count: Mapped[int] = mapped_column(Integer, default=1)
    raw_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Status & Life Cycle
    status: Mapped[str] = mapped_column(String(32), default="VERIFIED", index=True)
    # UPLOADED, PROCESSING, OCR_COMPLETE, EXTRACTED, VALIDATED, MATCHED, READY, REVIEW_REQUIRED, REJECTED, FAILED
    
    # Entity Associations
    patient_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("patients.id", ondelete="SET NULL"), nullable=True, index=True)
    claim_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    payer_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    appointment_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    
    # Extracted Summary Attributes
    patient_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    member_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    payer_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    group_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    auth_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    effective_date: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    expiration_date: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    is_expired: Mapped[bool] = mapped_column(Boolean, default=False)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Identity Resolution Result
    identity_status: Mapped[str] = mapped_column(String(64), default="MATCH") # MATCH, PARTIAL_MATCH, MISMATCH, CRITICAL_CONFLICT, NEW_RECORD
    identity_confidence: Mapped[float] = mapped_column(Float, default=0.98)
    auto_resolved: Mapped[bool] = mapped_column(Boolean, default=True)
    claim_protected: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Metadata & Timestamps
    uploaded_by: Mapped[str] = mapped_column(String(128), default="Jordan Davis (RCM Lead)")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    pages: Mapped[List["DocumentPageRecord"]] = relationship("DocumentPageRecord", back_populates="document", cascade="all, delete-orphan")
    fields: Mapped[List["ExtractedFieldRecord"]] = relationship("ExtractedFieldRecord", back_populates="document", cascade="all, delete-orphan")
    reviews: Mapped[List["DocumentReviewRecord"]] = relationship("DocumentReviewRecord", back_populates="document", cascade="all, delete-orphan")
    audit_events: Mapped[List["DocumentAuditEventRecord"]] = relationship("DocumentAuditEventRecord", back_populates="document", cascade="all, delete-orphan")

class DocumentPageRecord(Base):
    __tablename__ = "document_pages"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True) # e.g. DOC-10482-P1
    document_id: Mapped[str] = mapped_column(String(64), ForeignKey("document_records.id", ondelete="CASCADE"), index=True)
    page_number: Mapped[int] = mapped_column(Integer, default=1)
    text_content: Mapped[Text] = mapped_column(Text, default="")
    page_confidence: Mapped[float] = mapped_column(Float, default=0.95)
    width: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    height: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    document: Mapped["DocumentRecord"] = relationship("DocumentRecord", back_populates="pages")

class ExtractedFieldRecord(Base):
    __tablename__ = "extracted_fields"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    document_id: Mapped[str] = mapped_column(String(64), ForeignKey("document_records.id", ondelete="CASCADE"), index=True)
    field_name: Mapped[str] = mapped_column(String(64), nullable=False) # e.g. patient_name, member_id
    label: Mapped[str] = mapped_column(String(128), nullable=False) # e.g. Patient / Member Name
    ocr_value: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_value: Mapped[str] = mapped_column(Text, nullable=False)
    hospital_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="MATCH") # MATCH, PARTIAL_MATCH, MISMATCH, NEW
    confidence: Mapped[float] = mapped_column(Float, default=0.98)
    confidence_tier: Mapped[str] = mapped_column(String(16), default="HIGH") # HIGH (>=95), MEDIUM (80-95), LOW (<80)
    page_number: Mapped[int] = mapped_column(Integer, default=1)
    bounding_box: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True) # {x, y, width, height, label}
    is_overridden: Mapped[bool] = mapped_column(Boolean, default=False)
    overridden_by: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    override_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    document: Mapped["DocumentRecord"] = relationship("DocumentRecord", back_populates="fields")

class DocumentReviewRecord(Base):
    __tablename__ = "document_reviews"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    document_id: Mapped[str] = mapped_column(String(64), ForeignKey("document_records.id", ondelete="CASCADE"), index=True)
    operator_name: Mapped[str] = mapped_column(String(128), default="Jordan Davis")
    review_action: Mapped[str] = mapped_column(String(64), default="ACCEPT") # ACCEPT, EDIT, REJECT, BLOCK_CLAIM, ESCALATE
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    document: Mapped["DocumentRecord"] = relationship("DocumentRecord", back_populates="reviews")

class DocumentAuditEventRecord(Base):
    __tablename__ = "document_audit_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    document_id: Mapped[str] = mapped_column(String(64), ForeignKey("document_records.id", ondelete="CASCADE"), index=True)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False) # UPLOAD, OCR_COMPLETE, VALIDATION, AUTO_RESOLVED, MANUAL_OVERRIDE, CLAIM_LINKED
    performed_by: Mapped[str] = mapped_column(String(128), default="SYSTEM_AI_ENGINE")
    details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    document: Mapped["DocumentRecord"] = relationship("DocumentRecord", back_populates="audit_events")
