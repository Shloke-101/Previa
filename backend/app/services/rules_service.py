from typing import List
from sqlalchemy.orm import Session
from app.models.rule import PreventiveRule
from app.schemas.rules import PreventiveRuleResponse

def get_preventive_rules(db: Session) -> List[PreventiveRuleResponse]:
    """Retrieves all configurable preventive clearance rules."""
    rules = db.query(PreventiveRule).all()
    return [
        PreventiveRuleResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            trigger_type=r.trigger_type,
            trigger_condition=r.trigger_condition,
            action=r.action,
            enabled=r.enabled,
            prevented_count_this_month=r.prevented_count_this_month
        )
        for r in rules
    ]

def toggle_rule_state(db: Session, rule_id: str) -> tuple[bool, str]:
    """Toggles the enabled status of a preventive clearance rule."""
    rule = db.query(PreventiveRule).filter(PreventiveRule.id == rule_id).first()
    if not rule:
        return False, f"Rule '{rule_id}' not found."
    
    rule.enabled = not rule.enabled
    db.commit()
    return rule.enabled, f"Rule '{rule.title}' is now {'ENABLED' if rule.enabled else 'DISABLED'}."
