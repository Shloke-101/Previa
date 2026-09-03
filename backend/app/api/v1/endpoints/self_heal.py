from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.schemas.self_heal import (
    SelfHealOverviewResponse,
    SelfHealProblemListResponse,
    SelfHealEventListResponse,
    SelfHealHotspotsResponse,
    DependencyGraphResponse,
    PayerRuleDriftResponse,
    IdentityResolutionRequest,
    IdentityResolutionResponse,
    PreSubmissionGuardRequest,
    PreSubmissionGuardResponse,
    OperatorActionRequest,
    OperatorActionResponse,
    RollbackResponse,
    SimulateBatchRequest,
    SimulateBatchResponse
)
from app.services.self_healing.self_healing_engine import self_healing_engine
from app.services.self_healing.identity_engine import identity_engine
from app.services.self_healing.pre_submission_guard import pre_submission_guard
from app.services.self_healing.rule_drift_detector import rule_drift_detector

router = APIRouter()

@router.get("/overview", response_model=SelfHealOverviewResponse, summary="Get RCM Self-Healing high-level overview metrics")
def get_self_heal_overview(db: Session = Depends(get_db)):
    """Returns top-level KPIs on auto-resolved errors, claims protected, and recurring problems eliminated."""
    return self_healing_engine.get_overview(db)

@router.get("/problems", response_model=SelfHealProblemListResponse, summary="List normalized RCM error clusters prioritized by impact")
def get_self_heal_problems(
    category: Optional[str] = Query(None, description="Optional error category filter"),
    db: Session = Depends(get_db)
):
    """Returns systemic error clusters with priority scores and recommended upstream fixes."""
    return self_healing_engine.get_problems(db, category)

@router.get("/events", response_model=SelfHealEventListResponse, summary="Get live self-heal activity stream")
def get_self_heal_events(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Returns real-time activity stream of auto-resolved, prevented, and operator-escalated events."""
    return self_healing_engine.get_events(db, limit)

@router.get("/audit", response_model=SelfHealEventListResponse, summary="Get immutable audit trail of automated transformations")
def get_self_heal_audit(
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Returns full audit log with before/after values, confidence ratings, and rollback status."""
    return self_healing_engine.get_events(db, limit)

@router.get("/hotspots", response_model=SelfHealHotspotsResponse, summary="Get RCM failure stage error hotspots")
def get_self_heal_hotspots():
    """Returns stage-by-stage error distribution across Registration, Eligibility, Authorization, Coding, and Submission."""
    return self_healing_engine.get_hotspots()

@router.get("/dependency-graph", response_model=DependencyGraphResponse, summary="Get RCM dependency graph with error & risk nodes")
def get_self_heal_dependency_graph():
    """Returns RCM workflow dependency nodes, failure counts, and systemic bottleneck identification."""
    return self_healing_engine.get_dependency_graph()

@router.get("/rule-drift", response_model=PayerRuleDriftResponse, summary="Get detected payer rule drift alerts")
def get_payer_rule_drifts(db: Session = Depends(get_db)):
    """Returns detected shifts in payer billing rules, affected claims, and validation update recommendations."""
    return rule_drift_detector.get_detected_drifts(db)

@router.post("/identity/resolve", response_model=IdentityResolutionResponse, summary="Resolve multi-factor patient identity & normalize submission name")
def resolve_patient_identity(req: IdentityResolutionRequest):
    """Corroborates Name, DOB, Member ID, and Payer to determine safe normalization without altering canonical EHR record."""
    return identity_engine.resolve_identity(req)

@router.post("/guard/validate-claim", response_model=PreSubmissionGuardResponse, summary="Pre-submission claim validation through 6 safety gates")
def validate_claim_presubmission(req: PreSubmissionGuardRequest):
    """Executes pre-submission guard against Identity, Eligibility, Prior Auth, Coding, Payer Rules, and Required Fields."""
    return pre_submission_guard.validate_claim(req)

@router.post("/simulate-batch", response_model=SimulateBatchResponse, summary="Simulate batch claim error ingestion & auto-healing demonstration")
def simulate_batch_claims(req: SimulateBatchRequest = SimulateBatchRequest(), db: Session = Depends(get_db)):
    """Demonstration endpoint: Simulates 1,000 synthetic claim errors, grouping, high-confidence auto-fixing, and operator escalations."""
    return self_healing_engine.simulate_batch(db, req.batch_size)

@router.post("/review/{id}", response_model=OperatorActionResponse, summary="Submit operator review decision")
def review_problem(id: str, act: OperatorActionRequest, db: Session = Depends(get_db)):
    """Applies human operator review decision to an active error pattern."""
    return self_healing_engine.apply_operator_action(db, id, act.action, act.operator_notes)

@router.post("/approve/{id}", response_model=OperatorActionResponse, summary="Operator approves recommended self-heal transformation")
def approve_problem(id: str, db: Session = Depends(get_db)):
    """Approves an ambiguous or flagged self-heal transformation."""
    return self_healing_engine.apply_operator_action(db, id, "APPROVE", "Operator approved transformation.")

@router.post("/reject/{id}", response_model=OperatorActionResponse, summary="Operator rejects recommended self-heal transformation")
def reject_problem(id: str, db: Session = Depends(get_db)):
    """Rejects self-heal recommendation and preserves existing state."""
    return self_healing_engine.apply_operator_action(db, id, "REJECT", "Operator rejected transformation.")

@router.post("/rollback/{id}", response_model=RollbackResponse, summary="Rollback an automated self-heal transformation")
def rollback_self_heal_event(id: str, db: Session = Depends(get_db)):
    """Reverts an automated transformation back to its original state using the immutable audit trail."""
    return self_healing_engine.rollback_event(db, id)
