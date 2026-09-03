from typing import Dict, Any, Tuple
from app.schemas.self_heal import GuardGateResult

class SelfHealDecisionEngine:
    """
    Self-Heal Decision & Safety Boundary Engine.
    Strictly enforces healthcare safety protocols. Favors safety over automation.
    """

    FORBIDDEN_AUTO_ALTERATIONS = {
        "DIAGNOSIS_CODE",
        "PROCEDURE_CODE",
        "TREATMENT_COST",
        "CLAIM_AMOUNT",
        "CLINICAL_CHART_NOTES",
        "PATIENT_SSN",
        "DIAGNOSIS_MODIFIER_CLINICAL"
    }

    SAFE_AUTO_FIX_CATEGORIES = {
        "PATIENT_NAME_NORMALIZATION",
        "MEMBER_ID_SUFFIX_SYNC",
        "WHITESPACE_TRIMMING",
        "PAYER_EDI_FORMAT_CLEANUP",
        "DUPLICATE_CLAIM_SUPPRESSION",
        "ZIP_CODE_FOUR_DIGIT_EXT_NORMALIZATION",
        "PAYER_ID_STANDARDIZATION"
    }

    @classmethod
    def evaluate_safety(
        cls,
        category: str,
        confidence: float,
        target_field: str,
        has_critical_conflicts: bool = False
    ) -> Tuple[str, str]:
        """
        Determines whether an action can be safely executed automatically or mandates operator review.
        Returns (decision_type, rationale).
        """
        # 1. Hard blocker on clinical/financial modifications
        if target_field.upper() in cls.FORBIDDEN_AUTO_ALTERATIONS:
            return (
                "BLOCK_AND_REVIEW",
                f"Clinical/Financial field '{target_field}' cannot be automatically altered by rule safety policy."
            )

        # 2. Critical conflict present
        if has_critical_conflicts:
            return (
                "BLOCK_AND_REVIEW",
                "Critical demographic or authorization conflict detected. Automatic modification blocked."
            )

        # 3. Safe categories with High Confidence (>= 0.95)
        if category in cls.SAFE_AUTO_FIX_CATEGORIES:
            if confidence >= 0.95:
                return (
                    "SAFE_AUTO_FIX",
                    f"Deterministic, reversible transformation '{category}' with high confidence ({confidence*100:.1f}%)."
                )
            elif confidence >= 0.80:
                return (
                    "REQUIRES_OPERATOR",
                    f"Transform '{category}' has medium confidence ({confidence*100:.1f}%). Operator confirmation required."
                )
            else:
                return (
                    "BLOCK_AND_REVIEW",
                    f"Low confidence ({confidence*100:.1f}%) for '{category}'. Escalated to safety queue."
                )

        # 4. Default for unlisted or complex categories
        if confidence >= 0.90:
            return (
                "REQUIRES_OPERATOR",
                f"Action category '{category}' requires human verification before dispatch."
            )
        
        return (
            "BLOCK_AND_REVIEW",
            f"Action category '{category}' flagged for comprehensive safety review."
        )

decision_engine = SelfHealDecisionEngine()
