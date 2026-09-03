import pytest
import sys
import os
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app
from app.db.session import SessionLocal
from app.db.init_db import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    db = SessionLocal()
    init_db(db)
    db.close()

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_dashboard_stats():
    response = client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "totalClaims" in data
    assert "approvedClaims" in data
    assert "deniedClaims" in data

def test_claims_list():
    response = client.get("/api/v1/claims")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_claims_predict_ai():
    claim_payload = {
        "claimAmount": 14500.0,
        "claimType": "Specialist",
        "procedure": "72148 - MRI Lumbar Spine",
        "previousClaims": 4,
        "coverageDuration": 2,
        "hospitalizationDuration": 1
    }
    response = client.post("/api/v1/claims/predict", json=claim_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] in ["Approve", "Deny"]
    assert "confidence" in data
    assert "riskScore" in data
    assert "explanation" in data
    assert "recommendation" in data

def test_eligibility_verification():
    response = client.post("/api/v1/eligibility/verify", json={"patient_id": "PAT-1082"})
    assert response.status_code == 200
    data = response.json()
    assert data["patient_id"] == "PAT-1082"
    assert data["eligibility_status"] in ["ACTIVE", "INACTIVE", "TERMINATED"]

def test_procedure_coverage_check():
    response = client.post("/api/v1/coverage/check", json={"patient_id": "PAT-1082", "cpt_code": "72148"})
    assert response.status_code == 200
    data = response.json()
    assert data["requires_prior_auth"] is True

def test_clearance_evaluation():
    response = client.post("/api/v1/clearance/evaluate", json={"patient_id": "PAT-1082"})
    assert response.status_code == 200
    data = response.json()
    assert data["clearance_status"] in ["CLEARED", "NEEDS_ACTION", "HIGH_RISK"]
    assert "risk_factors" in data

def test_financial_estimation():
    response = client.post("/api/v1/financial/estimate", json={"patient_id": "PAT-1082", "procedure_cost": 1200.0})
    assert response.status_code == 200
    data = response.json()
    assert "estimated_patient_responsibility" in data
    assert "estimated_payer_responsibility" in data

def test_model_metrics():
    response = client.get("/api/v1/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert "f1" in data
    assert "featureImportance" in data

def test_ocr_extraction_and_validation():
    response = client.get("/api/v1/ocr/extract?sample_id=sample-bcbs")
    assert response.status_code == 200
    data = response.json()
    assert len(data["fields"]) > 0

    val_res = client.post("/api/v1/ocr/validate", json={"sample_id": "sample-uhc-mismatch"})
    assert val_res.status_code == 200
    assert val_res.json()["mismatch_count"] > 0

def test_preventive_rules():
    response = client.get("/api/v1/rules")
    assert response.status_code == 200
    rules = response.json()
    assert len(rules) >= 3
