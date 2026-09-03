from typing import Tuple, List, Dict, Any
from datetime import datetime, date, timedelta
import uuid

# Canonical Risk Factor Weights from ARCHITECTURE.md
WEIGHTS = {
    "inactive_insurance": 40,
    "expired_policy": 40,
    "missing_authorization": 30,
    "critical_member_id_mismatch": 25,
    "policy_number_mismatch": 25,
    "dob_mismatch": 25,
    "out_of_network": 15,
    "policy_expiring_soon": 10,
    "minor_name_mismatch": 5
}

PROCEDURES_REQUIRING_AUTH = {
    "70553": "MRI Brain with and without contrast",
    "70551": "MRI Brain without contrast",
    "72148": "MRI Lumbar Spine",
    "74177": "CT Abdomen and Pelvis with contrast",
    "27447": "Total Knee Arthroplasty"
}

def evaluate_encounter_clearance(patient: Any, policy: Any, appointment: Any) -> Dict[str, Any]:
    factors: List[Dict[str, Any]] = []
    blocking_reasons: List[str] = []
    recommended_actions: List[Dict[str, Any]] = []

    # 1. Policy Presence & Status Check
    if not policy:
        factors.append({
            "factor_code": "inactive_insurance",
            "reason": "No active insurance policy on file for patient encounter",
            "impact": WEIGHTS["inactive_insurance"]
        })
        blocking_reasons.append("Missing insurance policy record")
        recommended_actions.append({
            "problem": "NO_POLICY",
            "action": "Obtain and upload patient insurance card or verify self-pay status."
        })
    else:
        if policy.policy_status in ["INACTIVE", "TERMINATED"]:
            factors.append({
                "factor_code": "inactive_insurance",
                "reason": f"Insurance policy status is {policy.policy_status}",
                "impact": WEIGHTS["inactive_insurance"]
            })
            blocking_reasons.append(f"Insurance policy is {policy.policy_status}")
            recommended_actions.append({
                "problem": "INACTIVE_INSURANCE",
                "action": "Contact payer or request secondary insurance information from patient."
            })

        # 2. Expiration Checks
        if policy.end_date:
            appt_date = appointment.appointment_time.date() if isinstance(appointment.appointment_time, datetime) else date.today()
            if policy.end_date < appt_date:
                factors.append({
                    "factor_code": "expired_policy",
                    "reason": f"Insurance policy expired on {policy.end_date} prior to encounter date {appt_date}",
                    "impact": WEIGHTS["expired_policy"]
                })
                blocking_reasons.append("Insurance policy expired before visit")
                recommended_actions.append({
                    "problem": "EXPIRED_POLICY",
                    "action": "Request updated renewal policy card or alternative coverage."
                })
            elif policy.end_date <= appt_date + timedelta(days=30):
                factors.append({
                    "factor_code": "policy_expiring_soon",
                    "reason": f"Insurance policy expires within 30 days (Expires {policy.end_date})",
                    "impact": WEIGHTS["policy_expiring_soon"]
                })
                recommended_actions.append({
                    "problem": "EXPIRING_SOON",
                    "action": "Inform patient of upcoming policy expiration date."
                })

        # 3. Network Tier Check
        if policy.network_tier == "OUT_OF_NETWORK":
            factors.append({
                "factor_code": "out_of_network",
                "reason": f"Provider/Facility is Out-of-Network for {policy.payer_name}",
                "impact": WEIGHTS["out_of_network"]
            })
            recommended_actions.append({
                "problem": "OUT_OF_NETWORK",
                "action": "Issue out-of-network disclosure and calculate patient out-of-network liability."
            })

        # 4. OCR Validation Mismatches
        if policy.field_validations:
            for val in policy.field_validations:
                field = val.get("field_name")
                status = val.get("status")
                if status == "MISMATCH" and field == "member_id":
                    factors.append({
                        "factor_code": "critical_member_id_mismatch",
                        "reason": f"Member ID on scanned card ({val.get('card_value')}) mismatches hospital EHR ({val.get('record_value')})",
                        "impact": WEIGHTS["critical_member_id_mismatch"]
                    })
                    blocking_reasons.append("Member ID mismatch between card and hospital record")
                    recommended_actions.append({
                        "problem": "MEMBER_ID_MISMATCH",
                        "action": "Review insurance card scan and update patient record MRN with corrected Member ID."
                    })
                elif status == "MISMATCH" and field == "policy_number":
                    factors.append({
                        "factor_code": "policy_number_mismatch",
                        "reason": f"Policy number mismatch: card ({val.get('card_value')}) vs EHR ({val.get('record_value')})",
                        "impact": WEIGHTS["policy_number_mismatch"]
                    })
                elif status == "PARTIAL_MATCH" and field in ["patient_name", "name"]:
                    factors.append({
                        "factor_code": "minor_name_mismatch",
                        "reason": f"Minor name variance: '{val.get('card_value')}' vs '{val.get('record_value')}'",
                        "impact": WEIGHTS["minor_name_mismatch"]
                    })

    # 5. Prior Authorization Requirements
    proc_code = str(appointment.procedure_code)
    if proc_code in PROCEDURES_REQUIRING_AUTH:
        # Check if auth is already on file
        # In baseline foundation, we detect if procedure requires auth
        factors.append({
            "factor_code": "missing_authorization",
            "reason": f"Prior authorization is required for {proc_code} ({PROCEDURES_REQUIRING_AUTH[proc_code]}) and is pending submission",
            "impact": WEIGHTS["missing_authorization"]
        })
        recommended_actions.append({
            "problem": "MISSING_AUTHORIZATION",
            "action": f"Submit electronic prior authorization request for procedure {proc_code} to payer."
        })

    # Calculate Total Deterministic Score
    raw_score = sum(f["impact"] for f in factors)
    risk_score = min(100, raw_score)

    # Determine Risk Level Tier
    if risk_score <= 39:
        risk_level = "LOW"
    elif risk_score <= 69:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    # Determine Operational Clearance Status
    is_blocked = len(blocking_reasons) > 0
    if is_blocked or risk_level == "HIGH":
        # Check if critical blocker exists
        has_critical = any(
            f["factor_code"] in ["inactive_insurance", "expired_policy", "critical_member_id_mismatch"] 
            for f in factors
        )
        if has_critical:
            clearance_status = "HIGH_RISK"
        else:
            clearance_status = "NEEDS_ACTION"
    elif len(factors) > 0 or risk_level == "MEDIUM":
        clearance_status = "NEEDS_ACTION"
    else:
        clearance_status = "CLEARED"

    # Invariant check: Never CLEARED if blockers exist
    if is_blocked and clearance_status == "CLEARED":
        clearance_status = "NEEDS_ACTION"

    return {
        "clearance_id": str(uuid.uuid4()),
        "patient_id": patient.patient_id if patient else appointment.patient_id,
        "appointment_id": appointment.appointment_id,
        "clearance_status": clearance_status,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "is_blocked": is_blocked,
        "blocking_reasons": blocking_reasons,
        "factors": factors,
        "recommended_actions": recommended_actions,
        "evaluated_at": datetime.utcnow(),
        "evaluated_by": "CLEARANCE_ENGINE_v0.1"
    }
