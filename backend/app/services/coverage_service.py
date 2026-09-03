from typing import Dict, Any
from app.schemas.coverage import CoverageCheckResponse

# Standard Medical Procedure Master Rules
PROCEDURE_RULES: Dict[str, Dict[str, Any]] = {
    "72148": {
        "service_description": "Magnetic Resonance Imaging (MRI), Lumbar Spine w/o Contrast",
        "requires_prior_auth": True,
        "is_covered": True,
        "category": "High-Tech Diagnostic Radiology"
    },
    "70450": {
        "service_description": "Computed Tomography (CT), Head/Brain w/o Contrast",
        "requires_prior_auth": True,
        "is_covered": True,
        "category": "High-Tech Diagnostic Radiology"
    },
    "99214": {
        "service_description": "Office Outpatient Visit, Established, Moderate Complexity",
        "requires_prior_auth": False,
        "is_covered": True,
        "category": "Evaluation and Management"
    },
    "93000": {
        "service_description": "Electrocardiogram (ECG Routine with Interpretation)",
        "requires_prior_auth": False,
        "is_covered": True,
        "category": "Cardiovascular"
    },
    "29881": {
        "service_description": "Arthroscopy Knee Meniscectomy",
        "requires_prior_auth": True,
        "is_covered": True,
        "category": "Surgical Orthopedics"
    },
    "45378": {
        "service_description": "Diagnostic Colonoscopy",
        "requires_prior_auth": False,
        "is_covered": True,
        "category": "Endoscopy"
    }
}

def check_procedure_coverage(patient_id: str, cpt_code: str) -> CoverageCheckResponse:
    """Checks procedure coverage, category, and prior authorization mandate."""
    rule = PROCEDURE_RULES.get(cpt_code, {
        "service_description": "Specialized Medical Encounter",
        "requires_prior_auth": False,
        "is_covered": True,
        "category": "General Outpatient"
    })

    return CoverageCheckResponse(
        patient_id=patient_id,
        cpt_code=cpt_code,
        service_description=rule["service_description"],
        is_covered=rule["is_covered"],
        requires_prior_auth=rule["requires_prior_auth"],
        in_network=True,
        tier="Tier 1 - In-Network Preferred",
        coverage_percentage=80.0,
        patient_coinsurance_percentage=20.0,
        policy_exclusions=[],
        clinical_notes=f"Service belongs to {rule['category']}. Mandates pre-service authorization: {'YES' if rule['requires_prior_auth'] else 'NO'}."
    )
