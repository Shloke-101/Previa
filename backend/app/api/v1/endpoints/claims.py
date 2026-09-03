from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.claim import Claim
from app.schemas.claim import ClaimInput, ClaimResponse, PredictionResult
from app.services.ml_service import ml_engine

router = APIRouter()

@router.get("", response_model=List[ClaimResponse], summary="List all claims with optional search filtering")
def list_claims(
    query: Optional[str] = Query(None, description="Search term for ID, member name, diagnosis or type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Returns claims list for workspace operations."""
    q = db.query(Claim)
    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            (Claim.id.ilike(search_pattern)) |
            (Claim.member_name.ilike(search_pattern)) |
            (Claim.claim_type.ilike(search_pattern)) |
            (Claim.procedure.ilike(search_pattern))
        )
    
    claims = q.offset(skip).limit(limit).all()
    
    return [
        ClaimResponse(
            id=c.id,
            member=c.member_name,
            amount=c.amount,
            type=c.claim_type,
            risk=c.risk_level,
            prediction=c.prediction,
            status=c.status,
            submittedAt=c.submission_date or c.created_at.strftime("%Y-%m-%d"),
            provider=c.provider,
            diagnosis=c.diagnosis,
            procedure=c.procedure,
            riskScore=c.risk_score,
            confidence=c.confidence,
            explanation=c.explanation,
            recommendation=c.recommendation
        )
        for c in claims
    ]

@router.get("/{id}", response_model=ClaimResponse, summary="Get single claim by ID")
def get_claim(id: str, db: Session = Depends(get_db)):
    """Retrieves detailed information for a single claim."""
    claim = db.query(Claim).filter(Claim.id == id).first()
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim '{id}' not found.")
    
    return ClaimResponse(
        id=claim.id,
        member=claim.member_name,
        amount=claim.amount,
        type=claim.claim_type,
        risk=claim.risk_level,
        prediction=claim.prediction,
        status=claim.status,
        submittedAt=claim.submission_date or claim.created_at.strftime("%Y-%m-%d"),
        provider=claim.provider,
        diagnosis=claim.diagnosis,
        procedure=claim.procedure,
        riskScore=claim.risk_score,
        confidence=claim.confidence,
        explanation=claim.explanation,
        recommendation=claim.recommendation
    )

@router.post("", response_model=ClaimResponse, status_code=201, summary="Create and submit a new claim")
def create_claim(claim_in: ClaimInput, db: Session = Depends(get_db)):
    """Ingests a new claim into the database and runs ML inference."""
    prediction = ml_engine.predict(claim_in)
    
    claim_id = claim_in.claimId or f"CLM-{uuid.uuid4().hex[:6].upper()}"
    
    new_claim = Claim(
        id=claim_id,
        member_name=f"Member {claim_in.age or 45}",
        amount=claim_in.claimAmount,
        claim_type=claim_in.claimType,
        risk_level=prediction.riskLevel,
        prediction=prediction.prediction,
        status="Pending",
        provider=claim_in.provider,
        submissionDate=claim_in.submissionDate or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        diagnosis=claim_in.diagnosis,
        procedure=claim_in.procedure,
        treatment_cost=claim_in.treatmentCost or claim_in.claimAmount,
        hospitalization_duration=claim_in.hospitalizationDuration or 0,
        age=claim_in.age or 45,
        gender=claim_in.gender or "Female",
        policy_type=claim_in.policyType or "Commercial PPO",
        coverage_duration=claim_in.coverageDuration or 24,
        previous_claims=claim_in.previousClaims or 1,
        risk_score=prediction.riskScore,
        confidence=prediction.confidence,
        explanation=prediction.explanation,
        recommendation=prediction.recommendation
    )
    
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)
    
    return ClaimResponse(
        id=new_claim.id,
        member=new_claim.member_name,
        amount=new_claim.amount,
        type=new_claim.claim_type,
        risk=new_claim.risk_level,
        prediction=new_claim.prediction,
        status=new_claim.status,
        submittedAt=new_claim.submissionDate,
        provider=new_claim.provider,
        diagnosis=new_claim.diagnosis,
        procedure=new_claim.procedure,
        riskScore=new_claim.risk_score,
        confidence=new_claim.confidence,
        explanation=new_claim.explanation,
        recommendation=new_claim.recommendation
    )

@router.post("/predict", response_model=PredictionResult, summary="AI explainable denial risk assessment")
def predict_claim_denial(claim_in: ClaimInput):
    """Executes AI ML model assessment returning prediction, confidence, risk score, and explainable recommendations."""
    return ml_engine.predict(claim_in)
