from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal

class SelfHealOverviewResponse(BaseModel):
    total_problems_detected: int
    auto_resolved_count: int
    awaiting_review_count: int
    blocked_count: int
    claims_protected_count: int
    denials_prevented_count: int
    revenue_protected_amount: float
    root_causes_eliminated_count: int
    success_rate_pct: float
    recurring_reduction_pct: float
    avg_resolution_time_sec: float

class SelfHealProblemItem(BaseModel):
    id: str
    title: str
    error_category: str
    error_code: str
    frequency: int
    affected_claims_count: int
    financial_impact: float
    priority_score: float
    priority_level: Literal["HIGH", "MEDIUM", "LOW"]
    recurrence_factor: Literal["HIGH", "MEDIUM", "LOW"]
    preventability: Literal["HIGH", "MEDIUM", "LOW"]
    root_cause: str
    recommended_action: str
    upstream_fix: str
    decision_type: Literal["SAFE_AUTO_FIX", "REQUIRES_OPERATOR", "BLOCK_AND_REVIEW", "INFORMATIONAL"]
    status: Literal["ACTIVE", "AUTO_RESOLVED", "AWAITING_REVIEW", "BLOCKED", "DISMISSED"]
    confidence: float
    affected_payers: List[str] = []
    affected_procedures: List[str] = []
    sample_claims: List[str] = []
    first_detected: str
    last_detected: str

class SelfHealProblemListResponse(BaseModel):
    total: int
    problems: List[SelfHealProblemItem]

class SelfHealEventItem(BaseModel):
    id: str
    timestamp: str
    claim_id: str
    patient_id: Optional[str] = None
    problem_detected: str
    error_category: str
    root_cause: str
    original_value: str
    corrected_value: str
    rule_used: str
    confidence: float
    system_action: Literal["AUTO-RESOLVED", "PREVENTED", "REQUIRES REVIEW", "BLOCKED", "ROLLED_BACK"]
    verification_result: Literal["PASSED", "FAILED", "PENDING"]
    rollback_available: bool
    rollback_status: Literal["ACTIVE", "ROLLED_BACK"]
    operator_id: Optional[str] = None
    notes: Optional[str] = None

class SelfHealEventListResponse(BaseModel):
    total: int
    events: List[SelfHealEventItem]

class SelfHealHotspotItem(BaseModel):
    stage: str # Registration, Eligibility, Authorization, Coding, Submission
    error_count: int
    percentage: float
    revenue_impact: float
    trend: str # e.g. "+42% vs last month"
    priority: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    primary_failure_reason: str
    auto_healable_pct: float

class SelfHealHotspotsResponse(BaseModel):
    hotspots: List[SelfHealHotspotItem]
    primary_hotspot: str
    recommendation: str

class IdentityResolutionRequest(BaseModel):
    hospital_name: str
    payer_name: str
    claim_name: Optional[str] = None
    dob_hospital: Optional[str] = None
    dob_payer: Optional[str] = None
    member_id_hospital: Optional[str] = None
    member_id_payer: Optional[str] = None
    payer_id: Optional[str] = "BCBS-IL"
    phone: Optional[str] = None
    patient_id: Optional[str] = None
    claim_id: Optional[str] = None

class IdentityResolutionResponse(BaseModel):
    canonical_patient_name: str
    claim_submission_name: str
    identity_confidence_score: float # 0.0 to 100.0 %
    name_similarity_pct: float
    dob_match: bool
    member_id_match: bool
    classification: Literal["HIGH_CONFIDENCE_MATCH", "AMBIGUOUS_MATCH", "CRITICAL_MISMATCH"]
    decision: Literal["SAFE_AUTO_FIX", "REQUIRES_OPERATOR", "BLOCK_AND_REVIEW"]
    can_safe_auto_fix: bool
    root_cause: str
    recommended_action: str
    upstream_fix: str
    audit_event_id: Optional[str] = None

class PreSubmissionGuardRequest(BaseModel):
    claim_id: Optional[str] = "CLM-AUTO-99"
    patient_id: str
    hospital_name: str
    payer_name: str
    dob_hospital: str
    dob_payer: str
    member_id_hospital: str
    member_id_payer: str
    cpt_code: str
    claim_amount: float
    modifier: Optional[str] = None
    prior_auth_number: Optional[str] = None
    policy_status: str = "ACTIVE"

class GuardGateResult(BaseModel):
    gate_name: str # Identity, Eligibility, Authorization, Coding, PayerRules, RequiredFields
    status: Literal["PASS", "AUTO_HEALED", "WARNING", "FAIL"]
    score_penalty: int
    detail: str
    original_value: Optional[str] = None
    healed_value: Optional[str] = None

class PreSubmissionGuardResponse(BaseModel):
    claim_id: str
    overall_status: Literal["SAFE_TO_SUBMIT", "AUTO_HEALED_AND_READY", "ACTION_REQUIRED_OPERATOR", "BLOCKED"]
    risk_score: int # 0 to 100
    confidence_score: float
    submission_claim_representation: Dict[str, Any]
    gates: List[GuardGateResult]
    auto_heals_applied: List[str]
    preventable_denial_avoided: Optional[str] = None
    dollar_impact_protected: float

class DependencyGraphNode(BaseModel):
    id: str
    label: str
    stage: str
    error_count: int
    denial_count: int
    revenue_impact: float
    risk_level: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    self_heal_capability: Literal["FULL_AUTO", "ASSISTED", "MANUAL", "NONE"]
    description: str

class DependencyGraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None

class DependencyGraphResponse(BaseModel):
    nodes: List[DependencyGraphNode]
    edges: List[DependencyGraphEdge]
    systemic_bottleneck_node_id: str

class PayerRuleDriftItem(BaseModel):
    id: str
    payer_id: str
    payer_name: str
    procedure_code: str
    changed_rule: str
    old_state: str
    new_state: str
    detected_at: str
    affected_claims_count: int
    revenue_at_risk: float
    recommended_action: str
    status: Literal["AUTO_UPDATED", "REQUIRES_REVIEW", "DISMISSED"]
    is_safe_auto_update: bool

class PayerRuleDriftResponse(BaseModel):
    total_drifts: int
    active_drifts: List[PayerRuleDriftItem]

class OperatorActionRequest(BaseModel):
    action: Literal["APPROVE", "REJECT", "MODIFY", "DISMISS"]
    operator_id: Optional[str] = "OP-ANALYST-1"
    operator_notes: Optional[str] = None
    override_submission_name: Optional[str] = None

class OperatorActionResponse(BaseModel):
    problem_id: str
    action_taken: str
    status: str
    message: str
    audit_event_id: str

class RollbackResponse(BaseModel):
    event_id: str
    claim_id: str
    reverted_value: str
    rollback_status: str
    message: str

class SimulateBatchRequest(BaseModel):
    batch_size: int = Field(1000, ge=10, le=10000)

class SimulateBatchResponse(BaseModel):
    batch_size: int
    total_errors_detected: int
    top_problem_identified: str
    affected_claims_count: int
    high_confidence_matches: int
    auto_healed_count: int
    ambiguous_cases_operator_review: int
    blocked_cases: int
    potential_revenue_protected: float
    root_cause_eliminated: str
    timestamp: str
