from typing import List
from sqlalchemy.orm import Session
from app.models.self_heal import PayerRuleDriftRecord
from app.schemas.self_heal import PayerRuleDriftItem, PayerRuleDriftResponse

class PayerRuleDriftDetector:
    """
    Payer Rule Drift Detector.
    Monitors recent claim adjudication rejections to detect shifting payer modifier,
    prior authorization, and billing guidelines before widespread denial spikes occur.
    """

    @classmethod
    def get_detected_drifts(cls, db: Session) -> PayerRuleDriftResponse:
        records = db.query(PayerRuleDriftRecord).all()
        items = [
            PayerRuleDriftItem(
                id=r.id,
                payer_id=r.payer_id,
                payer_name=r.payer_name,
                procedure_code=r.procedure_code,
                changed_rule=r.changed_rule,
                old_state=r.old_state,
                new_state=r.new_state,
                detected_at=r.detected_at.strftime("%Y-%m-%d %H:%M UTC"),
                affected_claims_count=r.affected_claims_count,
                revenue_at_risk=r.revenue_at_risk,
                recommended_action=r.recommended_action,
                status=r.status,
                is_safe_auto_update=r.is_safe_auto_update
            )
            for r in records
        ]
        return PayerRuleDriftResponse(total_drifts=len(items), active_drifts=items)

rule_drift_detector = PayerRuleDriftDetector()
