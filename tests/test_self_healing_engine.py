import pytest
import sys
import os
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.services.self_healing.identity_engine import identity_engine
from app.services.self_healing.decision_engine import decision_engine
from app.services.self_healing.error_clustering import error_clustering_engine
from app.services.self_healing.pre_submission_guard import pre_submission_guard
from app.schemas.self_heal import IdentityResolutionRequest, PreSubmissionGuardRequest

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    db = SessionLocal()
    init_db(db)
    db.close()

client = TestClient(app)

# ==========================================
# 1. Identity Resolution & Safety Tests
# ==========================================

def test_case_1_high_confidence_identity_match():
    """CASE 1: Shloke Roy vs S. Roy with matching DOB & Member ID -> HIGH CONFIDENCE, SAFE AUTO-FIX"""
    req = IdentityResolutionRequest(
        hospital_name="Shloke Roy",
        payer_name="S. Roy",
        dob_hospital="1990-05-12",
        dob_payer="1990-05-12",
        member_id_hospital="BCBS-12345",
        member_id_payer="BCBS-12345"
    )
    res = identity_engine.resolve_identity(req)
    assert res.identity_confidence_score >= 95.0
    assert res.can_safe_auto_fix is True
    assert res.classification == "HIGH_CONFIDENCE_MATCH"
    assert res.decision == "SAFE_AUTO_FIX"
    assert res.canonical_patient_name == "Shloke Roy"
    assert res.claim_submission_name == "S ROY"

def test_case_2_dob_mismatch_escalates_to_operator():
    """CASE 2: Shloke Roy vs S. Roy with DOB MISMATCH -> DO NOT AUTO-FIX, OPERATOR REVIEW / BLOCK"""
    req = IdentityResolutionRequest(
        hospital_name="Shloke Roy",
        payer_name="S. Roy",
        dob_hospital="1990-05-12",
        dob_payer="1982-11-20", # Conflicting DOB
        member_id_hospital="BCBS-12345",
        member_id_payer="BCBS-12345"
    )
    res = identity_engine.resolve_identity(req)
    assert res.can_safe_auto_fix is False
    assert res.decision == "BLOCK_AND_REVIEW"
    assert res.dob_match is False
    # Canonical name is strictly preserved
    assert res.canonical_patient_name == "Shloke Roy"

def test_case_3_critical_name_mismatch_blocks():
    """CASE 3: Shloke Roy vs Rahul Roy -> DO NOT AUTO-FIX, BLOCK / REVIEW"""
    req = IdentityResolutionRequest(
        hospital_name="Shloke Roy",
        payer_name="Rahul Roy",
        dob_hospital="1990-05-12",
        dob_payer="1990-05-12",
        member_id_hospital="BCBS-12345",
        member_id_payer="BCBS-99999"
    )
    res = identity_engine.resolve_identity(req)
    assert res.can_safe_auto_fix is False
    assert res.classification == "CRITICAL_MISMATCH"
    assert res.decision == "BLOCK_AND_REVIEW"

def test_name_formatting_variations():
    """Tests name normalization across variations: 'Roy, Shloke', 'SHLOKE ROY', 'S. Roy'."""
    assert identity_engine.normalize_name_string("Roy, Shloke") == "SHLOKE ROY"
    assert identity_engine.normalize_name_string("  shloke   roy  ") == "SHLOKE ROY"
    assert identity_engine.normalize_name_string("S. Roy") == "S ROY"

# ==========================================
# 2. Decision Engine & Safety Boundary Tests
# ==========================================

def test_decision_engine_forbids_clinical_and_financial_changes():
    """System must NEVER automatically modify high-risk clinical or financial fields."""
    decision, rationale = decision_engine.evaluate_safety(
        category="DIAGNOSIS_MODIFICATION",
        confidence=0.99,
        target_field="DIAGNOSIS_CODE"
    )
    assert decision == "BLOCK_AND_REVIEW"

    decision, _ = decision_engine.evaluate_safety(
        category="AMOUNT_CHANGE",
        confidence=0.99,
        target_field="CLAIM_AMOUNT"
    )
    assert decision == "BLOCK_AND_REVIEW"

    decision, _ = decision_engine.evaluate_safety(
        category="PATIENT_NAME_NORMALIZATION",
        confidence=0.98,
        target_field="PATIENT_NAME"
    )
    assert decision == "SAFE_AUTO_FIX"

# ==========================================
# 3. Error Clustering & Priority Scoring Tests
# ==========================================

def test_error_normalization():
    """Normalizes unstructured error strings into canonical systemic categories."""
    e1 = error_clustering_engine.normalize_error("Subscriber name mismatch with payer database")
    assert e1["error_category"] == "PATIENT_IDENTITY_MISMATCH"

    e2 = error_clustering_engine.normalize_error("Prior authorization required for procedure CPT 72148")
    assert e2["error_category"] == "AUTHORIZATION_WORKFLOW"

    e3 = error_clustering_engine.normalize_error("Invalid modifier 25 for same-day E/M")
    assert e3["error_category"] == "MODIFIER_RULES"

def test_priority_score_formula():
    """Calculates priority = frequency * financial_impact * recurrence_factor * preventability_score."""
    score = error_clustering_engine.calculate_priority_score(
        frequency=260,
        financial_impact=1840000.0,
        recurrence_level="HIGH",
        preventability_level="HIGH"
    )
    assert 80.0 <= score <= 100.0

# ==========================================
# 4. Pre-Submission Claim Guard Tests
# ==========================================

def test_pre_submission_guard_auto_heals_name():
    """Guard applies safe name normalization and marks claim AUTO_HEALED_AND_READY."""
    req = PreSubmissionGuardRequest(
        claim_id="CLM-TEST-01",
        patient_id="PAT-1082",
        hospital_name="Eleanor Vance",
        payer_name="E. Vance",
        dob_hospital="1984-06-14",
        dob_payer="1984-06-14",
        member_id_hospital="BCBS-9823101",
        member_id_payer="BCBS-9823101",
        cpt_code="99214",
        claim_amount=210.0,
        policy_status="ACTIVE"
    )
    res = pre_submission_guard.validate_claim(req)
    assert res.overall_status == "AUTO_HEALED_AND_READY"
    assert res.submission_claim_representation["patient_name_submission"] == "E VANCE"
    assert len(res.auto_heals_applied) > 0

def test_pre_submission_guard_blocks_missing_auth():
    """Guard flags missing mandatory authorization on MRI CPT 72148."""
    req = PreSubmissionGuardRequest(
        claim_id="CLM-TEST-02",
        patient_id="PAT-1082",
        hospital_name="Eleanor Vance",
        payer_name="Eleanor Vance",
        dob_hospital="1984-06-14",
        dob_payer="1984-06-14",
        member_id_hospital="BCBS-9823101",
        member_id_payer="BCBS-9823101",
        cpt_code="72148", # Mandates Prior Auth
        claim_amount=1450.0,
        prior_auth_number=None, # Missing!
        policy_status="ACTIVE"
    )
    res = pre_submission_guard.validate_claim(req)
    assert res.overall_status in ["ACTION_REQUIRED_OPERATOR", "BLOCKED"]
    auth_gate = next(g for g in res.gates if g.gate_name == "Prior Authorization")
    assert auth_gate.status == "FAIL"

# ==========================================
# 5. REST API Endpoints Tests
# ==========================================

def test_api_self_heal_overview():
    res = client.get("/api/v1/self-heal/overview")
    assert res.status_code == 200
    data = res.json()
    assert "total_problems_detected" in data
    assert "auto_resolved_count" in data
    assert "revenue_protected_amount" in data

def test_api_self_heal_problems_list():
    res = client.get("/api/v1/self-heal/problems")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert len(data["problems"]) > 0

def test_api_self_heal_events_and_audit():
    res = client.get("/api/v1/self-heal/events")
    assert res.status_code == 200
    assert len(res.json()["events"]) > 0

    audit_res = client.get("/api/v1/self-heal/audit")
    assert audit_res.status_code == 200
    assert len(audit_res.json()["events"]) > 0

def test_api_self_heal_hotspots():
    res = client.get("/api/v1/self-heal/hotspots")
    assert res.status_code == 200
    data = res.json()
    assert len(data["hotspots"]) == 5
    assert "primary_hotspot" in data

def test_api_self_heal_dependency_graph():
    res = client.get("/api/v1/self-heal/dependency-graph")
    assert res.status_code == 200
    data = res.json()
    assert len(data["nodes"]) >= 6
    assert len(data["edges"]) >= 5
    assert "systemic_bottleneck_node_id" in data

def test_api_payer_rule_drift():
    res = client.get("/api/v1/self-heal/rule-drift")
    assert res.status_code == 200
    data = res.json()
    assert data["total_drifts"] >= 1

def test_api_identity_resolve_endpoint():
    payload = {
        "hospital_name": "Shloke Roy",
        "payer_name": "S. Roy",
        "dob_hospital": "1990-05-12",
        "dob_payer": "1990-05-12",
        "member_id_hospital": "BCBS-12345",
        "member_id_payer": "BCBS-12345"
    }
    res = client.post("/api/v1/self-heal/identity/resolve", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["can_safe_auto_fix"] is True
    assert data["claim_submission_name"] == "S ROY"

def test_api_batch_simulation():
    """Demonstration workflow: Simulate 1,000 claim errors."""
    res = client.post("/api/v1/self-heal/simulate-batch", json={"batch_size": 1000})
    assert res.status_code == 200
    data = res.json()
    assert data["batch_size"] == 1000
    assert data["auto_healed_count"] > 200
    assert data["ambiguous_cases_operator_review"] > 0
    assert data["potential_revenue_protected"] > 0

def test_api_operator_actions_and_rollback():
    """Tests operator review approval and rollback execution."""
    approve_res = client.post("/api/v1/self-heal/approve/PROB-ID-260")
    assert approve_res.status_code == 200
    assert approve_res.json()["action_taken"] == "APPROVE"

    # Test rollback on an audit event
    rollback_res = client.post("/api/v1/self-heal/rollback/EVT-10482")
    assert rollback_res.status_code == 200
    assert rollback_res.json()["rollback_status"] == "ROLLED_BACK"
