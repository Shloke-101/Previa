from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.rule import PreventiveRule
from app.schemas.rules import PreventiveRuleCreate, PreventiveRuleResponse, RuleToggleResponse
from app.services.rules_service import get_preventive_rules, toggle_rule_state

router = APIRouter()

@router.get("", response_model=List[PreventiveRuleResponse], summary="List all preventive clearance rules")
def list_rules(db: Session = Depends(get_db)):
    """Returns configurable deterministic preventive clearance rules."""
    return get_preventive_rules(db)

@router.post("/{id}/toggle", response_model=RuleToggleResponse, summary="Toggle preventive rule enabled state")
def toggle_rule(id: str, db: Session = Depends(get_db)):
    """Enables or disables an autonomous guard rule."""
    enabled, message = toggle_rule_state(db, id)
    return RuleToggleResponse(id=id, enabled=enabled, message=message)

@router.post("", response_model=PreventiveRuleResponse, status_code=201, summary="Create a new preventive rule")
def create_rule(rule_in: PreventiveRuleCreate, db: Session = Depends(get_db)):
    """Registers a new deterministic preventive guard trigger."""
    rule = PreventiveRule(
        id=rule_in.id,
        title=rule_in.title,
        description=rule_in.description,
        trigger_type=rule_in.trigger_type,
        trigger_condition=rule_in.trigger_condition,
        action=rule_in.action,
        enabled=rule_in.enabled,
        prevented_count_this_month=0
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule
