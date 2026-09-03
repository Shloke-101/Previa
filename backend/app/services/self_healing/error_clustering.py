import re
from typing import Dict, Any, List, Tuple

class ErrorClusteringEngine:
    """
    Deterministic Error Normalization and Systemic Priority Clustering Engine.
    Maps disparate raw payer error strings into canonical systemic problem categories.
    """

    ERROR_NORMALIZATION_MAP: Dict[str, Tuple[str, str, str]] = {
        # Raw pattern -> (Category, Canonical Error Code, Root Cause)
        r"(name mismatch|subscriber name|member name differs|demographic|patient identity)": (
            "PATIENT_IDENTITY_MISMATCH",
            "ERR-ID-NORM",
            "Payer accepts abbreviated or alternate demographic format not synced with EHR intake."
        ),
        r"(missing auth|authorization absent|prior authorization required|invalid authorization)": (
            "AUTHORIZATION_WORKFLOW",
            "CO-197",
            "Procedural prior authorization required but omitted or expired prior to claim submission."
        ),
        r"(modifier|invalid modifier|modifier 25|modifier 59|billing code modifier)": (
            "MODIFIER_RULES",
            "ERR-MOD-DRIFT",
            "Payer rule drift or missing bilateral/distinct procedural modifier."
        ),
        r"(terminated|inactive|eligibility|coverage period|not eligible on dos)": (
            "ELIGIBILITY_TERMINATED",
            "CO-27",
            "Patient policy terminated or lapsed prior to date of healthcare service."
        ),
        r"(duplicate|exact duplicate|previously adjudicated|already submitted)": (
            "DUPLICATE_SUBMISSION",
            "CO-18",
            "Automated billing system resubmitted identical claim before prior adjudication finished."
        ),
        r"(timely filing|filing limit|past limit)": (
            "TIMELY_FILING",
            "CO-29",
            "Claim submitted after payer statutory timely filing window."
        )
    }

    @classmethod
    def normalize_error(cls, raw_error: str) -> Dict[str, str]:
        """Maps an unstructured error string into a normalized category."""
        clean = (raw_error or "").lower()
        for pattern, (category, code, root_cause) in cls.ERROR_NORMALIZATION_MAP.items():
            if re.search(pattern, clean):
                return {
                    "error_category": category,
                    "error_code": code,
                    "root_cause": root_cause
                }
        
        return {
            "error_category": "GENERAL_UNSPECIFIED_ERROR",
            "error_code": "ERR-GEN-01",
            "root_cause": "General payer adjudication rejection requiring manual investigation."
        }

    @classmethod
    def calculate_priority_score(
        cls,
        frequency: int,
        financial_impact: float,
        recurrence_level: str = "HIGH",
        preventability_level: str = "HIGH"
    ) -> float:
        """
        Calculates normalized Priority Score:
        priority = frequency * financial_impact * recurrence_factor * preventability_score
        Normalized to 0.0 - 100.0.
        """
        rec_factor = 1.5 if recurrence_level == "HIGH" else 1.0 if recurrence_level == "MEDIUM" else 0.5
        prev_factor = 1.4 if preventability_level == "HIGH" else 1.0 if preventability_level == "MEDIUM" else 0.6

        # Scale financial impact log or linear normalized
        scaled_fin = min(50.0, (financial_impact / 50000.0) * 25.0)
        scaled_freq = min(50.0, (frequency / 200.0) * 25.0)

        raw_score = (scaled_fin + scaled_freq) * rec_factor * prev_factor
        return round(min(100.0, max(10.0, raw_score)), 1)

error_clustering_engine = ErrorClusteringEngine()
