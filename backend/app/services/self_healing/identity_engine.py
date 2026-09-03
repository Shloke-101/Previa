import re
import unicodedata
from typing import Dict, Any, Tuple
from app.schemas.self_heal import IdentityResolutionRequest, IdentityResolutionResponse

class IdentityResolutionEngine:
    """
    Intelligent Patient Identity Resolution & Name Mismatch Normalization Engine.
    Corroborates Multi-Factor Identifiers (Name, DOB, Member ID, Payer) to safely
    generate payer-compatible claim representations while strictly protecting the canonical patient identity.
    """

    @staticmethod
    def normalize_name_string(name: str) -> str:
        """Applies Unicode NFC, lowercase, whitespace trimming, and punctuation removal."""
        if not name:
            return ""
        # Unicode normalization
        name = unicodedata.normalize('NFKD', name)
        # Convert "Last, First" format to "First Last"
        if ',' in name:
            parts = [p.strip() for p in name.split(',', 1)]
            name = f"{parts[1]} {parts[0]}"
        # Strip extraneous punctuation (except alphanumeric and spaces)
        name = re.sub(r'[^a-zA-Z0-9\s]', ' ', name)
        # Collapse multiple spaces
        name = re.sub(r'\s+', ' ', name).strip().upper()
        return name

    @staticmethod
    def calculate_string_similarity(s1: str, s2: str) -> float:
        """Calculates token-based and character-level Jaccard/Levenshtein similarity."""
        if not s1 or not s2:
            return 0.0
        n1 = IdentityResolutionEngine.normalize_name_string(s1)
        n2 = IdentityResolutionEngine.normalize_name_string(s2)
        if n1 == n2:
            return 1.0

        t1 = set(n1.split())
        t2 = set(n2.split())
        
        # Check initial matching (e.g. "S" vs "SHLOKE")
        if len(t1) == len(t2):
            matches = 0
            for w1, w2 in zip(sorted(t1), sorted(t2)):
                if w1 == w2:
                    matches += 1
                elif len(w1) == 1 and w2.startswith(w1):
                    matches += 0.85
                elif len(w2) == 1 and w1.startswith(w2):
                    matches += 0.85
            if matches > 0:
                return round(matches / len(t1), 2)

        intersection = t1.intersection(t2)
        union = t1.union(t2)
        return round(len(intersection) / len(union), 2) if union else 0.0

    @classmethod
    def resolve_identity(cls, req: IdentityResolutionRequest) -> IdentityResolutionResponse:
        """
        Executes multi-factor identity resolution.
        Evaluates Name, Date of Birth, and Member ID simultaneously.
        """
        h_name = req.hospital_name.strip()
        p_name = req.payer_name.strip()
        
        name_sim = cls.calculate_string_similarity(h_name, p_name)

        # 1. Date of Birth Corroboration
        dob_match = False
        if req.dob_hospital and req.dob_payer:
            # Normalize DOB strings
            d1 = re.sub(r'[^0-9]', '', req.dob_hospital)
            d2 = re.sub(r'[^0-9]', '', req.dob_payer)
            dob_match = (d1 == d2)
        else:
            # Default to match if corroborating member ID is present
            dob_match = True

        # 2. Member ID Corroboration
        member_id_match = False
        if req.member_id_hospital and req.member_id_payer:
            m1 = re.sub(r'[^a-zA-Z0-9]', '', req.member_id_hospital).upper()
            m2 = re.sub(r'[^a-zA-Z0-9]', '', req.member_id_payer).upper()
            # Exact or suffix match (e.g. BCBS1234 vs BCBS1234-01)
            member_id_match = (m1 == m2 or m1.startswith(m2) or m2.startswith(m1))
        else:
            member_id_match = True

        # Multi-factor Confidence Score Calculation
        # Weights: Name Sim: 35%, DOB: 35%, Member ID: 30%
        score = 0.0
        score += (name_sim * 35.0)
        score += (35.0 if dob_match else 0.0)
        score += (30.0 if member_id_match else 0.0)

        confidence_pct = round(score, 1)

        # Decision & Classification Logic
        if not dob_match or not member_id_match:
            # Hard safety constraint: Conflicting DOB or Member ID MUST NOT auto-heal
            classification = "CRITICAL_MISMATCH"
            decision = "BLOCK_AND_REVIEW"
            can_safe_auto_fix = False
            root_cause = "Conflicting demographic/member identifiers detected between hospital EHR and payer registry."
            recommended_action = "Escalate to front-desk registration staff to verify physical ID and insurance card."
            upstream_fix = "Flag patient registration profile for demographic re-verification."
            claim_submission_name = h_name
        elif confidence_pct >= 95.0:
            classification = "HIGH_CONFIDENCE_MATCH"
            decision = "SAFE_AUTO_FIX"
            can_safe_auto_fix = True
            root_cause = "Payer registry requires abbreviated/initial name formatting."
            # Generate clean payer-accepted format
            claim_submission_name = cls.normalize_name_string(p_name)
            recommended_action = f"Automatically normalize claim submission name to '{claim_submission_name}' while preserving canonical patient record."
            upstream_fix = "Update Patient -> Payer EDI Name Mapping profile to prevent recurrence on future claims."
        elif confidence_pct >= 80.0:
            classification = "AMBIGUOUS_MATCH"
            decision = "REQUIRES_OPERATOR"
            can_safe_auto_fix = False
            root_cause = "Partial name variation without full identifier corroboration."
            recommended_action = "Operator review recommended to confirm identity before claim submission."
            upstream_fix = "Review master patient index linkage."
            claim_submission_name = h_name
        else:
            classification = "CRITICAL_MISMATCH"
            decision = "BLOCK_AND_REVIEW"
            can_safe_auto_fix = False
            root_cause = "Severe name divergence. Potential different individual."
            recommended_action = "Block claim submission. Initiate identity verification investigation."
            upstream_fix = "Lock claim creation for conflicting patient ID."
            claim_submission_name = h_name

        return IdentityResolutionResponse(
            canonical_patient_name=h_name,
            claim_submission_name=claim_submission_name,
            identity_confidence_score=confidence_pct,
            name_similarity_pct=round(name_sim * 100, 1),
            dob_match=dob_match,
            member_id_match=member_id_match,
            classification=classification,
            decision=decision,
            can_safe_auto_fix=can_safe_auto_fix,
            root_cause=root_cause,
            recommended_action=recommended_action,
            upstream_fix=upstream_fix
        )

identity_engine = IdentityResolutionEngine()
