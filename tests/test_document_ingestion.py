import pytest
import io
import fitz
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.db.init_db import init_db
from app.services.ocr_service import (
    extract_from_uploaded_file,
    extract_insurance_card_data,
    IdentityResolver,
    PreSubmissionGuardChecker,
    DocumentTypeDetector,
    IntelligentFieldExtractor
)

# In-memory test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    init_db(session)
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

def create_sample_pdf(text_content: str) -> bytes:
    """Helper to generate a real in-memory PDF using PyMuPDF (fitz)."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4
    page.insert_text((50, 72), text_content, fontsize=12)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

def test_ocr_extract_preset(client):
    """Test preset OCR sample extraction endpoint."""
    res = client.get("/api/v1/ocr/extract?sample_id=sample-bcbs")
    assert res.status_code == 200
    data = res.json()
    assert data["payer_name"] == "Star Health & Allied Insurance"
    assert data["patient_name"] == "ELEANOR VANCE"
    assert len(data["fields"]) >= 4

def test_upload_real_pdf_extraction(client):
    """Test uploading a real PDF document and extracting structured fields."""
    pdf_text = (
        "STAR HEALTH & ALLIED INSURANCE\n"
        "Patient Name: Shloke Roy\n"
        "DOB: 18/06/2004\n"
        "Member ID: STAR-8842109\n"
        "Group No: GRP-4410\n"
        "Effective Date: 2026-01-01\n"
        "Expiration Date: 2026-12-31\n"
        "Copay: $35.00\n"
    )
    pdf_bytes = create_sample_pdf(pdf_text)
    
    files = {"file": ("insurance_card_shloke.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    res = client.post("/api/v1/ocr/upload", files=files)
    assert res.status_code == 200
    data = res.json()
    
    assert data["document_type"] == "INSURANCE_CARD"
    assert "SHLOKE" in data["patient_name"].upper()
    assert data["member_id"] == "STAR-8842109"
    assert data["group_number"] == "GRP-4410"
    assert data["quality_score"] > 0.8
    assert len(data["fields"]) >= 5

def test_upload_authorization_pdf(client):
    """Test uploading a Prior Authorization PDF and detecting document type and auth #."""
    auth_text = (
        "PRIOR AUTHORIZATION DETERMINATION: APPROVED\n"
        "Payer: Blue Cross Blue Shield\n"
        "Patient Name: Eleanor Vance\n"
        "Member ID: BCBS-9823101\n"
        "Prior Auth #: AUTH-BCBS-99104\n"
        "Procedure Code: 72148 - MRI Lumbar Spine\n"
        "Effective Date: 2026-08-01\n"
        "Expiration Date: 2026-11-30\n"
    )
    pdf_bytes = create_sample_pdf(auth_text)
    files = {"file": ("Prior_Auth_Approval.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    res = client.post("/api/v1/ocr/upload", files=files)
    assert res.status_code == 200
    data = res.json()
    
    assert data["document_type"] == "AUTHORIZATION"
    assert data["auth_number"] == "AUTH-BCBS-99104"
    assert "72148" in str(data["procedure_code"])

def test_upload_eob_pdf_with_denial(client):
    """Test uploading an EOB / Remittance advice with denial code."""
    eob_text = (
        "EXPLANATION OF BENEFITS / REMITTANCE ADVICE\n"
        "Payer: UnitedHealthcare\n"
        "Patient Name: Marcus Chen\n"
        "Member ID: HUM-110294\n"
        "Billed Amount: $12,750.00\n"
        "Denial Code: CO-197 Missing Prior Authorization\n"
        "Patient Responsibility: $1,850.00\n"
    )
    pdf_bytes = create_sample_pdf(eob_text)
    files = {"file": ("EOB_Remittance.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    res = client.post("/api/v1/ocr/upload", files=files)
    assert res.status_code == 200
    data = res.json()
    
    assert data["document_type"] == "EOB"
    assert data["billed_amount"] == 12750.0

def test_identity_resolution_safe_auto_resolve():
    """
    Test exact prompt scenario:
    Hospital: Shloke Roy
    Insurance: S. Roy
    DOB: 18/06/2004 (MATCH)
    Member ID: STAR-8842109 (MATCH)
    Expected: IDENTITY CONFIRMED, HIGH CONFIDENCE (0.997), SAFE TO CREATE PAYER REPRESENTATION ('S ROY')
    """
    extracted_data = {
        "patient_name": "S. Roy",
        "dob": "18/06/2004",
        "member_id": "STAR-8842109",
        "payer_name": "Star Health & Allied Insurance"
    }
    identity = IdentityResolver.resolve_identity(extracted_data)
    
    assert identity.status == "NAME_VARIANCE_CONFIRMED"
    assert identity.confidence >= 0.99
    assert identity.safe_to_auto_resolve is True
    assert identity.payer_submission_format == "S ROY"

def test_identity_resolution_critical_conflict():
    """
    Test exact prompt scenario:
    Hospital: Shloke Roy
    Insurance: S. Roy
    DOB: 11/02/2002 (MISMATCH)
    Member ID: XYZ999999 (MISMATCH)
    Expected: CRITICAL CONFLICT, DO NOT AUTO-RESOLVE, OPERATOR REVIEW
    """
    extracted_data = {
        "patient_name": "S. Roy",
        "dob": "11/02/2002",
        "member_id": "XYZ999999",
        "payer_name": "Star Health & Allied Insurance"
    }
    identity = IdentityResolver.resolve_identity(extracted_data)
    
    assert identity.status == "CRITICAL_CONFLICT"
    assert identity.safe_to_auto_resolve is False
    assert identity.dob_match is False
    assert identity.member_id_match is False

def test_duplicate_document_detection(client):
    """Test uploading the exact same document twice detects duplicate hash."""
    pdf_text = "Hospital Patient Insurance Card Unique Content"
    pdf_bytes = create_sample_pdf(pdf_text)
    
    # First upload
    files1 = {"file": ("dup_test.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    res1 = client.post("/api/v1/ocr/upload", files=files1)
    assert res1.status_code == 200
    assert res1.json()["is_duplicate"] is False
    
    # Second upload with same bytes
    files2 = {"file": ("dup_test_2.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    res2 = client.post("/api/v1/ocr/upload", files=files2)
    assert res2.status_code == 200
    assert res2.json()["is_duplicate"] is True

def test_expired_document_detection():
    """Test policy with past expiration date flags is_expired=True."""
    text = "Expiration Date: 01/01/2020"
    extracted = IntelligentFieldExtractor.extract_fields(text, "INSURANCE_CARD", "test.pdf")
    assert extracted["is_expired"] is True

def test_list_documents_and_analytics(client):
    """Test document list and analytics endpoints."""
    res_docs = client.get("/api/v1/ocr/documents")
    assert res_docs.status_code == 200
    assert len(res_docs.json()) >= 1
    
    res_analytics = client.get("/api/v1/ocr/analytics")
    assert res_analytics.status_code == 200
    analytics = res_analytics.json()
    assert analytics["documents_processed"] >= 1000
    assert analytics["ocr_success_rate"] > 0.95

def test_operator_document_review_action(client):
    """Test operator reviewing a document (ACCEPT / BLOCK_CLAIM)."""
    review_payload = {
        "action": "ACCEPT",
        "operator_name": "Jordan Davis",
        "notes": "Verified against patient government photo ID."
    }
    res = client.post("/api/v1/ocr/documents/DOC-10482/review", json=review_payload)
    assert res.status_code == 200
    assert res.json()["action"] == "ACCEPT"

def test_ocr_sync_endpoint(client):
    """Test 1-click OCR field synchronization into patient master index."""
    payload = {"sample_id": "sample-uhc-mismatch", "patient_id": "PAT-3301"}
    res = client.post("/api/v1/ocr/sync", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "member_id" in data["synchronized_fields"]
