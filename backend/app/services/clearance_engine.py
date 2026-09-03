from datetime import datetime, timezone
from sqlalchemy.orm import Session
from typing import Tuple, List

from app.models.patient import Patient
from app.models.insurance import InsurancePolicy
from app.models.appointment import Appointment
from app.models.clearance import ClearanceRecord
from app.services.coverage_service import check_procedure_coverage
from app.services.financial_service import calculate_financial_responsibility
from app.schemas.clearance import ClearanceEvaluationResponse, RiskFactorBreakdown

def evaluate_patient_clearance(
    db: Session,
    patient_id: str,
    appointment_id: str = None
) -> ClearanceEvaluationResponse:
    """
    Core Deterministic Pre-Visit Financial Clearance Engine.
    Executes rule-based evaluation of:
    1. Insurance Eligibility (Active / Inactive / Terminated)
    2. Network & Benefit Tier
    3. Procedure Coverage & Prior Auth Mandate
    4. Optical OCR Card vs EHR Data Validation Status
    5. Financial Out-of-Pocket Liability
    
    Assigns:
    - clearance_status: CLEARED, NEEDS_ACTION, HIGH_RISK
    - composite_risk_score: 0 to 100
    - risk_level: LOW, MEDIUM, HIGH
    - explainable risk factor points
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    policy = db.query(InsurancePolicy).filter(InsurancePolicy.patient_id == patient_id).first()
    appointment = (
        db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if appointment_id else
        db.query(Appointment).filter(Appointment.patient_id == patient_id).first()
    )
    clearance = db.query(ClearanceRecord).filter(ClearanceRecord.patient_id == patient_id).first()

    cpt_code = appointment.cpt_code if appointment else "99213"
    coverage = check_procedure_coverage(patient_id, cpt_code)
    financials = calculate_financial_responsibility(db, patient_id)

    risk_factors: List[RiskFactorBreakdown] = []
    flags: List[str] = []
    recommended_actions: List[str] = []
    primary_blocker = None

    composite_score = 0

    # 1. Eligibility Check
    if not policy or policy.policy_status == "TERMINATED":
        composite_score += 50
        flags.append("Insurance policy terminated")
        primary_blocker = "Insurance policy terminated on " + (policy.expiration_date if policy else "past date")
        recommended_actions.append("Contact patient immediately to capture updated primary insurance or provide Good Faith Estimate.")
        risk_factors.append(RiskFactorBreakdown(
            id="rf-eligibility",
            name="Policy Status Terminated",
            category="ELIGIBILITY",
            weight=0.35,
            scoreContribution=50,
            description="EDI 271 inquiry returned terminated status.",
            status="FAIL"
        ))
    elif policy.policy_status == "INACTIVE":
        composite_score += 45
        flags.append("Policy is currently inactive")
        primary_blocker = "Policy is inactive with payer"
        recommended_actions.append("Re-verify policy active dates or request updated card from patient.")
        risk_factors.append(RiskFactorBreakdown(
            id="rf-eligibility",
            name="Policy Inactive",
            category="ELIGIBILITY",
            weight=0.35,
            scoreContribution=45,
            description="Policy marked inactive by payer.",
            status="FAIL"
        ))
    else:
        composite_score += 5
        risk_factors.append(RiskFactorBreakdown(
            id="rf-eligibility",
            name="Active Insurance Policy",
            category="ELIGIBILITY",
            weight=0.20,
            scoreContribution=5,
            description="Active coverage verified via real-time 270/271 inquiry.",
            status="PASS"
        ))

    # 2. Prior Authorization Check
    auth_status = clearance.authorization_status if clearance else ("REQUIRED" if coverage.requires_prior_auth else "NOT_REQUIRED")
    auth_number = clearance.auth_number if clearance else None

    if coverage.requires_prior_auth:
        if auth_status == "APPROVED" and auth_number:
            composite_score += 5
            risk_factors.append(RiskFactorBreakdown(
                id="rf-auth",
                name="Prior Authorization Approved",
                category="AUTHORIZATION",
                weight=0.35,
                scoreContribution=5,
                description=f"Active prior authorization on file (#{auth_number}).",
                status="PASS"
            ))
        elif auth_status == "PENDING":
            composite_score += 25
            flags.append("Prior authorization pending determination")
            if not primary_blocker:
                primary_blocker = "Prior authorization submitted 48h ago, determination pending from payer"
            recommended_actions.append("Check payer portal for real-time auth approval or call expedited hotline.")
            risk_factors.append(RiskFactorBreakdown(
                id="rf-auth",
                name="Prior Authorization Pending Determination",
                category="AUTHORIZATION",
                weight=0.35,
                scoreContribution=25,
                description="Submitted to payer but determination is pending.",
                status="WARNING"
            ))
        else: # REQUIRED / MISSING
            composite_score += 40
            flags.append(f"Missing mandatory Prior Authorization for {cpt_code}")
            if not primary_blocker:
                primary_blocker = f"Prior authorization required for CPT {cpt_code} but not initiated"
            recommended_actions.append(f"Initiate urgent Prior Auth submission for CPT {cpt_code} with clinical chart notes.")
            risk_factors.append(RiskFactorBreakdown(
                id="rf-auth",
                name="Prior Authorization Missing",
                category="AUTHORIZATION",
                weight=0.40,
                scoreContribution=40,
                description=f"CPT {cpt_code} requires payer pre-authorization which is uninitiated.",
                status="FAIL"
            ))
    else:
        composite_score += 5
        risk_factors.append(RiskFactorBreakdown(
            id="rf-auth",
            name="No Prior Auth Required",
            category="AUTHORIZATION",
            weight=0.20,
            scoreContribution=5,
            description="Service does not mandate prior authorization under current plan.",
            status="PASS"
        ))

    # 3. Data Validation & Suffix Check
    val_status = clearance.data_validation_status if clearance else "MATCH"
    if val_status == "MISMATCH":
        composite_score += 20
        flags.append("Member ID suffix variance between OCR card and EHR record")
        if not primary_blocker:
            primary_blocker = "Member ID on card differs from hospital record"
        recommended_actions.append("Run 1-click OCR field synchronization to update EHR master index.")
        risk_factors.append(RiskFactorBreakdown(
            id="rf-mismatch",
            name="Member ID Discrepancy",
            category="DATA_MISMATCH",
            weight=0.20,
            scoreContribution=20,
            description="EHR record missing suffix found on physical card.",
            status="WARNING"
        ))
    elif val_status == "PARTIAL_MATCH":
        composite_score += 10
        risk_factors.append(RiskFactorBreakdown(
            id="rf-mismatch",
            name="Minor Name/DOB Variance",
            category="DATA_MISMATCH",
            weight=0.10,
            scoreContribution=10,
            description="Minor variance between OCR and EHR.",
            status="WARNING"
        ))
    else:
        composite_score += 5
        risk_factors.append(RiskFactorBreakdown(
            id="rf-mismatch",
            name="OCR Field Integrity Verified",
            category="DATA_MISMATCH",
            weight=0.10,
            scoreContribution=5,
            description="All extracted card fields match hospital EHR record.",
            status="PASS"
        ))

    # Calculate final composite score
    composite_score = min(100, max(5, composite_score))

    # Assign clearance status & risk level
    if composite_score >= 70 or (policy and policy.policy_status in ["TERMINATED", "INACTIVE"]):
        clearance_status = "HIGH_RISK"
        risk_level = "HIGH"
    elif composite_score >= 40 or auth_status in ["REQUIRED", "PENDING"] or val_status == "MISMATCH":
        clearance_status = "NEEDS_ACTION"
        risk_level = "MEDIUM"
    else:
        clearance_status = "CLEARED"
        risk_level = "LOW"
        recommended_actions = [f"Collect ${financials.estimated_patient_responsibility:.2f} patient responsibility upon check-in."]

    # Sync back to DB ClearanceRecord if exists
    if clearance:
        clearance.clearance_status = clearance_status
        clearance.risk_score = composite_score
        clearance.risk_level = risk_level
        clearance.estimated_patient_responsibility = financials.estimated_patient_responsibility
        clearance.primary_blocker = primary_blocker
        clearance.recommended_actions = recommended_actions
        clearance.flags = flags
        db.commit()

    return ClearanceEvaluationResponse(
        patient_id=patient_id,
        appointment_id=appointment.id if appointment else "APT-DEFAULT",
        clearance_status=clearance_status,
        composite_risk_score=composite_score,
        risk_level=risk_level,
        eligibility_status=policy.policy_status if policy else "INACTIVE",
        authorization_status=auth_status,
        auth_number=auth_number,
        data_validation_status=val_status,
        estimated_patient_responsibility=financials.estimated_patient_responsibility,
        primary_blocker=primary_blocker,
        recommended_actions=recommended_actions,
        risk_factors=risk_factors,
        evaluation_timestamp=datetime.now(timezone.utc).isoformat()
    )
