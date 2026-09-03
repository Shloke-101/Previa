from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.insurance import InsurancePolicy
from backend.app.schemas.insurance import InsurancePolicyResponse, InsurancePolicyCreate

router = APIRouter(prefix="/insurance", tags=["Insurance"])

@router.get("/{insurance_policy_id}", response_model=InsurancePolicyResponse)
def get_insurance_policy(insurance_policy_id: str, db: Session = Depends(get_db)):
    policy = db.query(InsurancePolicy).filter(
        InsurancePolicy.insurance_policy_id == insurance_policy_id
    ).first()
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Insurance policy {insurance_policy_id} not found"
        )
    return policy

@router.post("", response_model=InsurancePolicyResponse, status_code=status.HTTP_201_CREATED)
def create_insurance_policy(payload: InsurancePolicyCreate, db: Session = Depends(get_db)):
    policy = InsurancePolicy(**payload.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy
