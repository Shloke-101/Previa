from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.db.base import Base
from app.db.session import engine
from app.models.patient import Patient
from app.models.insurance import InsurancePolicy
from app.models.appointment import Appointment
from app.models.claim import Claim
from app.models.clearance import ClearanceRecord
from app.models.denial import DenialRecord
from app.models.rule import PreventiveRule
from app.models.self_heal import SelfHealProblem, SelfHealAuditEvent, SelfHealRule, PayerRuleDriftRecord

def init_db(db: Session) -> None:
    """Creates tables and seeds initial synthetic data if empty."""
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    if db.query(Patient).first():
        # Check if self-healing tables need seeding
        if not db.query(SelfHealProblem).first():
            _seed_self_heal_data(db)
        return

    # 1. Seed Patients
    patients = [
        Patient(id="PAT-1082", first_name="Eleanor", last_name="Vance", dob="1984-06-14", phone="(555) 234-5678", email="eleanor.vance@example.com", address="742 Evergreen Terrace, Springfield, IL"),
        Patient(id="PAT-2094", first_name="Marcus", last_name="Thorne", dob="1972-11-03", phone="(555) 876-5432", email="marcus.thorne@example.com", address="100 Pine Street, Chicago, IL"),
        Patient(id="PAT-3301", first_name="Sophia", last_name="Rodriguez", dob="1995-02-28", phone="(555) 432-1098", email="sophia.rodriguez@example.com", address="420 Oak Avenue, Naperville, IL"),
        Patient(id="PAT-4115", first_name="David", last_name="Chen", dob="1968-08-19", phone="(555) 345-6789", email="david.chen@example.com", address="55 Lake Shore Drive, Evanston, IL"),
        Patient(id="PAT-5229", first_name="Harrison", last_name="Brooks", dob="1959-12-05", phone="(555) 654-3210", email="harrison.brooks@example.com", address="88 Elm Street, Rockford, IL"),
        Patient(id="PAT-6440", first_name="Chloe", last_name="Jenkins", dob="2001-04-12", phone="(555) 987-6543", email="chloe.jenkins@example.com", address="312 Cedar Road, Peoria, IL"),
    ]
    db.add_all(patients)
    db.commit()

    # 2. Seed Insurance Policies
    policies = [
        InsurancePolicy(id="POL-1082", patient_id="PAT-1082", payer_id="BCBS-IL", payer_name="Blue Cross Blue Shield", plan_name="Blue Precision HMO Tier 1", member_id="BCBS-9823101", group_number="GRP-4410", policy_status="ACTIVE", effective_date="2026-01-01", expiration_date="2026-12-31", in_network=True, copay_amount=0.0, coinsurance_percentage=20.0, deductible_total=1500.0, deductible_remaining=350.0),
        InsurancePolicy(id="POL-2094", patient_id="PAT-2094", payer_id="AETNA-01", payer_name="Aetna Health", plan_name="Open Access Managed Care", member_id="AET-550912", group_number="GRP-8812", policy_status="ACTIVE", effective_date="2026-01-01", expiration_date="2026-12-31", in_network=True, copay_amount=35.0, coinsurance_percentage=0.0, deductible_total=1000.0, deductible_remaining=0.0),
        InsurancePolicy(id="POL-3301", patient_id="PAT-3301", payer_id="UHC-CHOICE", payer_name="UnitedHealthcare", plan_name="National Network PPO", member_id="UHC-7712399", group_number="GRP-2020", policy_status="ACTIVE", effective_date="2026-03-01", expiration_date="2027-02-28", in_network=True, copay_amount=0.0, coinsurance_percentage=0.0, deductible_total=750.0, deductible_remaining=65.0),
        InsurancePolicy(id="POL-4115", patient_id="PAT-4115", payer_id="CIGNA-01", payer_name="Cigna Healthcare", plan_name="Open Access Plus", member_id="CIG-330198", group_number="GRP-9011", policy_status="ACTIVE", effective_date="2026-01-01", expiration_date="2026-12-31", in_network=True, copay_amount=0.0, coinsurance_percentage=15.0, deductible_total=1200.0, deductible_remaining=200.0),
        InsurancePolicy(id="POL-5229", patient_id="PAT-5229", payer_id="HUMANA-01", payer_name="Humana Gold Plus", plan_name="Medicare Advantage HMO", member_id="HUM-110294", group_number="GRP-1004", policy_status="TERMINATED", effective_date="2025-01-01", expiration_date="2026-08-31", in_network=False, copay_amount=0.0, coinsurance_percentage=100.0, deductible_total=0.0, deductible_remaining=0.0),
        InsurancePolicy(id="POL-6440", patient_id="PAT-6440", payer_id="BCBS-IL", payer_name="Blue Cross Blue Shield", plan_name="Blue Choice Preferred PPO", member_id="BCBS-449102", group_number="GRP-4410", policy_status="ACTIVE", effective_date="2026-01-01", expiration_date="2026-12-31", in_network=True, copay_amount=50.0, coinsurance_percentage=10.0, deductible_total=1000.0, deductible_remaining=100.0),
    ]
    db.add_all(policies)
    db.commit()

    # 3. Seed Appointments
    appointments = [
        Appointment(id="APT-8821", patient_id="PAT-1082", appointment_datetime="2026-09-04 09:30 AM", department="Diagnostic Radiology", provider_name="Dr. Sarah Lin, MD", cpt_code="72148", service_description="MRI Lumbar Spine w/o Contrast", estimated_cost=1450.0),
        Appointment(id="APT-8822", patient_id="PAT-2094", appointment_datetime="2026-09-04 10:15 AM", department="Cardiology Consult", provider_name="Dr. Robert Chen, MD", cpt_code="99214", service_description="Office Visit Level 4 (Cardiology)", estimated_cost=210.0),
        Appointment(id="APT-8823", patient_id="PAT-3301", appointment_datetime="2026-09-04 11:00 AM", department="Cardiovascular Diagnostics", provider_name="Dr. Robert Chen, MD", cpt_code="93000", service_description="Electrocardiogram Routine ECG", estimated_cost=165.0),
        Appointment(id="APT-8824", patient_id="PAT-4115", appointment_datetime="2026-09-04 01:30 PM", department="Orthopedic Surgery", provider_name="Dr. Arthur Pendelton, MD", cpt_code="29881", service_description="Arthroscopy Knee Meniscectomy", estimated_cost=3200.0),
        Appointment(id="APT-8825", patient_id="PAT-5229", appointment_datetime="2026-09-04 02:45 PM", department="Gastroenterology", provider_name="Dr. Priya Patel, MD", cpt_code="45378", service_description="Diagnostic Colonoscopy", estimated_cost=1850.0),
        Appointment(id="APT-8826", patient_id="PAT-6440", appointment_datetime="2026-09-05 08:30 AM", department="Diagnostic Radiology", provider_name="Dr. Sarah Lin, MD", cpt_code="70450", service_description="CT Head/Brain w/o Contrast", estimated_cost=1100.0),
    ]
    db.add_all(appointments)
    db.commit()

    # 4. Seed Clearance Records
    clearances = [
        ClearanceRecord(
            id="CLR-1082",
            patient_id="PAT-1082",
            appointment_id="APT-8821",
            clearance_status="HIGH_RISK",
            risk_score=88,
            risk_level="HIGH",
            eligibility_status="ACTIVE",
            authorization_status="REQUIRED",
            auth_number=None,
            data_validation_status="MATCH",
            estimated_patient_responsibility=450.0,
            primary_blocker="Prior authorization required by BCBS but not initiated",
            recommended_actions=["Initiate expedited Prior Auth portal submission for CPT 72148", "Attach clinical chart notes from Dr. Lin"],
            flags=["Missing mandatory Prior Authorization for MRI Lumbar Spine", "Upcoming appointment in < 24 hours"]
        ),
        ClearanceRecord(
            id="CLR-2094",
            patient_id="PAT-2094",
            appointment_id="APT-8822",
            clearance_status="CLEARED",
            risk_score=12,
            risk_level="LOW",
            eligibility_status="ACTIVE",
            authorization_status="NOT_REQUIRED",
            auth_number=None,
            data_validation_status="MATCH",
            estimated_patient_responsibility=35.0,
            primary_blocker=None,
            recommended_actions=["Collect $35.00 specialist copay at check-in"],
            flags=[]
        ),
        ClearanceRecord(
            id="CLR-3301",
            patient_id="PAT-3301",
            appointment_id="APT-8823",
            clearance_status="NEEDS_ACTION",
            risk_score=54,
            risk_level="MEDIUM",
            eligibility_status="ACTIVE",
            authorization_status="NOT_REQUIRED",
            auth_number=None,
            data_validation_status="MISMATCH",
            estimated_patient_responsibility=65.0,
            primary_blocker="Member ID on card (UHC-7712399-01) differs from EHR (UHC-7712399)",
            recommended_actions=["Run 1-click OCR field synchronization to update suffix -01 in hospital index"],
            flags=["Member ID suffix variance between OCR scan ('-01') and EHR record"]
        ),
        ClearanceRecord(
            id="CLR-4115",
            patient_id="PAT-4115",
            appointment_id="APT-8824",
            clearance_status="CLEARED",
            risk_score=18,
            risk_level="LOW",
            eligibility_status="ACTIVE",
            authorization_status="APPROVED",
            auth_number="AUTH-CG-99201",
            data_validation_status="MATCH",
            estimated_patient_responsibility=320.0,
            primary_blocker=None,
            recommended_actions=["Pre-authorized through 2026-10-15 (Auth #AUTH-CG-99201)"],
            flags=[]
        ),
        ClearanceRecord(
            id="CLR-5229",
            patient_id="PAT-5229",
            appointment_id="APT-8825",
            clearance_status="HIGH_RISK",
            risk_score=92,
            risk_level="HIGH",
            eligibility_status="TERMINATED",
            authorization_status="NOT_REQUIRED",
            auth_number=None,
            data_validation_status="MISMATCH",
            estimated_patient_responsibility=1850.0,
            primary_blocker="Insurance policy terminated on 2026-08-31",
            recommended_actions=["Contact patient immediately to capture updated secondary or new primary insurance", "Provide Self-Pay Good Faith Estimate"],
            flags=["Coverage terminated prior to encounter date"]
        ),
        ClearanceRecord(
            id="CLR-6440",
            patient_id="PAT-6440",
            appointment_id="APT-8826",
            clearance_status="NEEDS_ACTION",
            risk_score=62,
            risk_level="MEDIUM",
            eligibility_status="ACTIVE",
            authorization_status="PENDING",
            auth_number="PA-PENDING-441",
            data_validation_status="PARTIAL_MATCH",
            estimated_patient_responsibility=150.0,
            primary_blocker="Prior authorization submitted 48h ago, determination pending from payer",
            recommended_actions=["Check BCBS Availity portal for real-time auth approval"],
            flags=["Authorization determination pending determination"]
        ),
    ]
    db.add_all(clearances)
    db.commit()

    # 5. Seed Claims
    claims = [
        Claim(id="CLM-28491", patient_id="PAT-1082", member_name="Olivia Bennett", amount=4380.0, claim_type="Inpatient", risk_level="Low", prediction="Approve", status="Approved", provider="Mercy Hospital", diagnosis="I10 - Essential Hypertension", procedure="99222 - Inpatient Care", risk_score=14, confidence=0.96, explanation="Active in-network coverage with confirmed pre-admission authorization.", recommendation="Approved for electronic remittance."),
        Claim(id="CLM-28490", patient_id="PAT-5229", member_name="Marcus Chen", amount=12750.0, claim_type="Specialist", risk_level="High", prediction="Deny", status="Denied", provider="Advanced Surgery Institute", diagnosis="M17.11 - Osteoarthritis Right Knee", procedure="27447 - Total Knee Arthroplasty", risk_score=88, confidence=0.94, explanation="High risk of CARC CO-197 denial due to missing pre-procedure prior authorization.", recommendation="Request expedited prior authorization review before submitting."),
        Claim(id="CLM-28489", patient_id="PAT-2094", member_name="Sophia Williams", amount=890.0, claim_type="Prescription", risk_level="Low", prediction="Approve", status="Approved", provider="City Pharmacy Express", diagnosis="E11.9 - Type 2 Diabetes", procedure="J1817 - Insulin Injection", risk_score=10, confidence=0.98, explanation="Formulary covered medication with valid electronic prescription.", recommendation="Standard automated adjudication."),
        Claim(id="CLM-28488", patient_id="PAT-3301", member_name="James Wilson", amount=6200.0, claim_type="Outpatient", risk_level="Medium", prediction="Approve", status="Pending", provider="Northwest Outpatient Center", diagnosis="K21.9 - GERD", procedure="43239 - EGD Biopsy", risk_score=45, confidence=0.88, explanation="Coverage active, minor member ID suffix check suggested.", recommendation="Collect estimated copayment of $75.00."),
        Claim(id="CLM-28487", patient_id="PAT-4115", member_name="Ava Rodriguez", amount=24800.0, claim_type="Inpatient", risk_level="High", prediction="Deny", status="Denied", provider="University Medical Center", diagnosis="K80.00 - Calculus of Gallbladder", procedure="47562 - Laparoscopic Cholecystectomy", risk_score=85, confidence=0.92, explanation="Policy effective date mismatch relative to procedure date.", recommendation="Obtain retroactive eligibility certificate."),
    ]
    db.add_all(claims)
    db.commit()

    # 6. Seed Denial Records
    denials = [
        DenialRecord(id="denial-1", carc_code="CO-197", category="Missing / Expired Prior Authorization", count=142, preventable_percentage=94, color="#ef4444", total_dollar_impact=184200.0, payer_name="Blue Cross Blue Shield", root_cause="High-tech radiology scheduled without pre-auth gateway trigger"),
        DenialRecord(id="denial-2", carc_code="CO-27", category="Expenses Incurred After Coverage Terminated", count=88, preventable_percentage=98, color="#f59e0b", total_dollar_impact=92400.0, payer_name="Humana", root_cause="Month-end policy termination undetected at scheduling"),
        DenialRecord(id="denial-3", carc_code="CO-16", category="Claim Lacks Information / Member ID Suffix Mismatch", count=64, preventable_percentage=91, color="#38bdf8", total_dollar_impact=68400.0, payer_name="UnitedHealthcare", root_cause="Card OCR optical scan failed to capture person code suffix"),
        DenialRecord(id="denial-4", carc_code="CO-50", category="Non-Covered Service / Medical Necessity", count=39, preventable_percentage=78, color="#8b5cf6", total_dollar_impact=41200.0, payer_name="Cigna", root_cause="Clinical documentation not linked during order intake"),
        DenialRecord(id="denial-5", carc_code="CO-29", category="Timely Filing Limit Exceeded", count=18, preventable_percentage=85, color="#64748b", total_dollar_impact=19000.0, payer_name="Aetna", root_cause="Delayed batch claim submission queues"),
    ]
    db.add_all(denials)
    db.commit()

    # 7. Seed Preventive Rules
    rules = [
        PreventiveRule(
            id="rule-1",
            title="72-Hour Mandatory Prior Auth Guard",
            description="Automatically flags encounters with CPT codes requiring prior authorization if no approval is recorded 72 hours prior to visit.",
            trigger_type="TIME_BASED",
            trigger_condition="Appointment T - 72h & PriorAuthStatus != APPROVED",
            action="Escalate to Pre-Service RCM Worklist & Send Provider Alert",
            enabled=True,
            prevented_count_this_month=48
        ),
        PreventiveRule(
            id="rule-2",
            title="Real-Time 24-Hour Policy Re-Verification",
            description="Automatically re-verifies 270/271 eligibility 24 hours prior to appointment to intercept month-end terminations.",
            trigger_type="TIME_BASED",
            trigger_condition="Appointment T - 24h",
            action="Execute 270 Eligibility Inquiry & Update Clearance Status",
            enabled=True,
            prevented_count_this_month=31
        ),
        PreventiveRule(
            id="rule-3",
            title="OCR Member ID Suffix Auto-Reconciliation",
            description="Identifies when extracted OCR member ID contains trailing person-code suffix and synchronizes with hospital master record.",
            trigger_type="EVENT_BASED",
            trigger_condition="Card Upload Event & Suffix Variance Detected",
            action="Prompt Staff with 1-Click Sync Badge",
            enabled=True,
            prevented_count_this_month=19
        )
    ]
    db.add_all(rules)
    db.commit()

    # 8. Seed Self-Healing Data
    _seed_self_heal_data(db)

def _seed_self_heal_data(db: Session) -> None:
    """Seeds rich initial RCM Self-Healing problems, audit logs, and drift records."""
    now = datetime.now(timezone.utc)

    problems = [
        SelfHealProblem(
            id="PROB-ID-260",
            title="Patient Identity & Name Format Disparity",
            error_category="PATIENT_IDENTITY_MISMATCH",
            error_code="ERR-ID-NORM",
            frequency=260,
            affected_claims_count=260,
            financial_impact=1840000.0,
            priority_score=96.4,
            priority_level="HIGH",
            recurrence_factor="HIGH",
            preventability="HIGH",
            root_cause="Payer EDI Gateway strictly mandates abbreviated initial representation ('S ROY') while EHR registers full legal names.",
            recommended_action="Enable automated deterministic name normalization before EDI 837 claim submission.",
            upstream_fix="Update Patient -> Payer EDI Identity Mapping in EHR Intake Module.",
            decision_type="SAFE_AUTO_FIX",
            status="ACTIVE",
            confidence=0.98,
            affected_payers=["Blue Cross Blue Shield", "UnitedHealthcare"],
            affected_procedures=["99214", "72148", "99213"],
            sample_claims=["CLM-10482", "CLM-10483", "CLM-10490"],
            first_detected=now - timedelta(days=7),
            last_detected=now - timedelta(minutes=15)
        ),
        SelfHealProblem(
            id="PROB-AUTH-204",
            title="High-Tech Radiology Missing Prior Auth Gateway",
            error_category="AUTHORIZATION_WORKFLOW",
            error_code="CO-197",
            frequency=204,
            affected_claims_count=204,
            financial_impact=1420000.0,
            priority_score=92.8,
            priority_level="HIGH",
            recurrence_factor="HIGH",
            preventability="HIGH",
            root_cause="Scheduling interface permitted MRI/CT orders without checking payer prior auth table.",
            recommended_action="Enforce 72-hour pre-service electronic prior authorization gate.",
            upstream_fix="Attach mandatory Prior Auth check to radiology order intake workflow.",
            decision_type="REQUIRES_OPERATOR",
            status="ACTIVE",
            confidence=0.94,
            affected_payers=["Blue Cross Blue Shield", "Aetna"],
            affected_procedures=["72148", "70450", "29881"],
            sample_claims=["CLM-20811", "CLM-20819"],
            first_detected=now - timedelta(days=14),
            last_detected=now - timedelta(minutes=45)
        ),
        SelfHealProblem(
            id="PROB-MOD-149",
            title="Payer Modifier 25 Separate E/M Rule Drift",
            error_category="MODIFIER_RULES",
            error_code="ERR-MOD-DRIFT",
            frequency=149,
            affected_claims_count=149,
            financial_impact=870000.0,
            priority_score=84.2,
            priority_level="MEDIUM",
            recurrence_factor="MEDIUM",
            preventability="HIGH",
            root_cause="Payer A silently updated modifier requirement on minor surgical procedures on Friday.",
            recommended_action="Auto-update claim validation rule for Payer A minor procedures.",
            upstream_fix="Deploy Payer A Modifier 25 validation rule in pre-submission guard.",
            decision_type="SAFE_AUTO_FIX",
            status="AUTO_RESOLVED",
            confidence=0.96,
            affected_payers=["UnitedHealthcare"],
            affected_procedures=["45378", "29881"],
            sample_claims=["CLM-30112", "CLM-30118"],
            first_detected=now - timedelta(days=4),
            last_detected=now - timedelta(hours=2)
        ),
        SelfHealProblem(
            id="PROB-ELIG-95",
            title="Month-End Policy Termination Interception",
            error_category="ELIGIBILITY_TERMINATED",
            error_code="CO-27",
            frequency=95,
            affected_claims_count=95,
            financial_impact=510000.0,
            priority_score=78.6,
            priority_level="MEDIUM",
            recurrence_factor="MEDIUM",
            preventability="HIGH",
            root_cause="Patients verified at scheduling (Day 1) lost coverage at month-end prior to appointment (Day 28).",
            recommended_action="Run automated 24-hour pre-visit 270 re-verification sweep.",
            upstream_fix="Activate 24h Pre-Visit Batch Re-verification daemon.",
            decision_type="SAFE_AUTO_FIX",
            status="ACTIVE",
            confidence=0.99,
            affected_payers=["Humana", "Cigna"],
            affected_procedures=["99214", "93000"],
            sample_claims=["CLM-40912"],
            first_detected=now - timedelta(days=30),
            last_detected=now - timedelta(hours=5)
        )
    ]
    db.add_all(problems)

    # Seed Audit Events
    audit_events = [
        SelfHealAuditEvent(
            id="EVT-10482",
            claim_id="CLM-10482",
            patient_id="PAT-1082",
            problem_detected="Patient name representation mismatch",
            error_category="PATIENT_IDENTITY_MISMATCH",
            root_cause="Payer EDI standard requires 'E VANCE' vs EHR 'Eleanor Vance'",
            original_value="Eleanor Vance",
            corrected_value="E VANCE",
            rule_used="RULE-PATIENT-NAME-NORMALIZATION",
            confidence=0.997,
            system_action="AUTO-RESOLVED",
            verification_result="PASSED",
            rollback_available=True,
            rollback_status="ACTIVE",
            notes="Payer-compatible claim representation generated. Canonical patient record preserved."
        ),
        SelfHealAuditEvent(
            id="EVT-10483",
            claim_id="CLM-10483",
            patient_id="PAT-3301",
            problem_detected="Member ID person-code suffix missing in claim",
            error_category="PATIENT_IDENTITY_MISMATCH",
            root_cause="Card OCR scan detected suffix '-01' absent from EHR base member ID",
            original_value="UHC-7712399",
            corrected_value="UHC-7712399-01",
            rule_used="RULE-MEMBER-ID-SUFFIX-SYNC",
            confidence=0.985,
            system_action="AUTO-RESOLVED",
            verification_result="PASSED",
            rollback_available=True,
            rollback_status="ACTIVE",
            notes="Synchronized person code suffix '-01' into claim submission stream."
        ),
        SelfHealAuditEvent(
            id="EVT-10484",
            claim_id="CLM-20811",
            patient_id="PAT-1082",
            problem_detected="Mandatory Prior Authorization absent on CPT 72148",
            error_category="AUTHORIZATION_WORKFLOW",
            root_cause="High-tech MRI ordered without prior authorization record",
            original_value="No Auth Attached",
            corrected_value="ESCALATED_TO_WORKLIST",
            rule_used="RULE-MANDATORY-PRIOR-AUTH-GUARD",
            confidence=0.94,
            system_action="REQUIRES REVIEW",
            verification_result="PASSED",
            rollback_available=False,
            rollback_status="ACTIVE",
            notes="Submission blocked to prevent guaranteed $1,450.00 CO-197 denial. Operator alerted."
        )
    ]
    db.add_all(audit_events)

    # Seed Payer Rule Drift
    drifts = [
        PayerRuleDriftRecord(
            id="DRIFT-01",
            payer_id="UHC-01",
            payer_name="UnitedHealthcare",
            procedure_code="CPT 29881",
            changed_rule="Modifier 25 Requirement",
            old_state="ACCEPTED (Without distinct E/M modifier)",
            new_state="REJECTED (Requires Modifier 25 on same-day E/M)",
            affected_claims_count=384,
            revenue_at_risk=870000.0,
            recommended_action="Update pre-submission claim validation rule for UnitedHealthcare orthopedic encounters.",
            status="REQUIRES_REVIEW",
            is_safe_auto_update=True
        )
    ]
    db.add_all(drifts)
    db.commit()
