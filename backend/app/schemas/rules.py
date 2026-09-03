from pydantic import BaseModel
from typing import Optional

class PreventiveRuleCreate(BaseModel):
    id: str
    title: str
    description: str
    trigger_type: str = "TIME_BASED"
    trigger_condition: str
    action: str
    enabled: bool = True

class PreventiveRuleResponse(BaseModel):
    id: str
    title: str
    description: str
    trigger_type: str
    trigger_condition: str
    action: str
    enabled: bool
    prevented_count_this_month: int

    class Config:
        from_attributes = True

class RuleToggleResponse(BaseModel):
    id: str
    enabled: bool
    message: str
