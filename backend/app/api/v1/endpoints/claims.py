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

@router.get("", response_model=List[ClaimResponse], summary="List all claims with optional search filtering and account scoping")
def list_claims(
    query: Optional[str] = Query(None, description="Search term for ID, member name, diagnosis or type"),
    account_id: Optional[str] = Query(None, description="Account ID to filter claims"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Returns claims list for workspace operations with optional account filter."""
    q = db.query(Claim)
    if account_id:
        q = q.filter((Claim.account_id == account_id) | (Claim.account_id.is_(None)))
    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            (Claim.id.ilike(search_pattern)) |
            (Claim.member_name.ilike(search_pattern)) |
            (Claim.claim_type.ilike(search_pattern)) |
            (Claim.procedure.ilike(search_pattern))
        )
    
    claims = q.order_by(Claim.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        ClaimResponse(
            id=c.id,
            member=c.member_name,
            amount=c.amount,
            type=c.claim_type,
            risk=c.risk_level,
            prediction=c.prediction,
            status=c.status,
            submittedAt=c.submission_date or (c.created_at.strftime("%Y-%m-%d") if c.created_at else None),
            provider=c.provider,
            diagnosis=c.diagnosis,
            procedure=c.procedure,
            riskScore=c.risk_score,
            confidence=c.confidence,
            explanation=c.explanation,
            recommendation=c.recommendation,
            accountId=c.account_id,
            payerName=c.payer_name,
            lastAnalyzedAt=c.last_analyzed_at.strftime("%Y-%m-%d %H:%M:%S") if c.last_analyzed_at else None
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
        submittedAt=claim.submission_date or (claim.created_at.strftime("%Y-%m-%d") if claim.created_at else None),
        provider=claim.provider,
        diagnosis=claim.diagnosis,
        procedure=claim.procedure,
        riskScore=claim.risk_score,
        confidence=claim.confidence,
        explanation=claim.explanation,
        recommendation=claim.recommendation,
        accountId=claim.account_id,
        payerName=claim.payer_name,
        lastAnalyzedAt=claim.last_analyzed_at.strftime("%Y-%m-%d %H:%M:%S") if claim.last_analyzed_at else None
    )

@router.post("", response_model=ClaimResponse, status_code=201, summary="Create and submit a new claim")
def create_claim(claim_in: ClaimInput, db: Session = Depends(get_db)):
    """Ingests a new claim into the database, persists it, and runs ML inference."""
    prediction = ml_engine.predict(claim_in)
    
    claim_id = claim_in.claimId or f"CLM-{uuid.uuid4().hex[:6].upper()}"
    member_name = claim_in.memberName or f"Patient {claim_in.age or 45}"
    
    # Check if claim already exists to update
    existing = db.query(Claim).filter(Claim.id == claim_id).first()
    if existing:
        existing.member_name = member_name
        existing.amount = claim_in.claimAmount
        existing.claim_type = claim_in.claimType
        existing.risk_level = prediction.riskLevel
        existing.prediction = prediction.prediction
        existing.provider = claim_in.provider
        existing.diagnosis = claim_in.diagnosis
        existing.procedure = claim_in.procedure
        existing.treatment_cost = claim_in.treatmentCost or claim_in.claimAmount
        existing.hospitalization_duration = claim_in.hospitalizationDuration or 0
        existing.age = claim_in.age or 45
        existing.gender = claim_in.gender or "Female"
        existing.policy_type = claim_in.policyType or "Commercial PPO"
        existing.payer_name = claim_in.payerName or claim_in.policyType or "Commercial PPO"
        existing.coverage_duration = claim_in.coverageDuration or 24
        existing.previous_claims = claim_in.previousClaims or 1
        existing.risk_score = prediction.riskScore
        existing.confidence = prediction.confidence
        existing.explanation = prediction.explanation
        existing.recommendation = prediction.recommendation
        existing.account_id = claim_in.accountId or existing.account_id or "acc-apollo"
        existing.last_analyzed_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(existing)
        target_claim = existing
    else:
        new_claim = Claim(
            id=claim_id,
            member_name=member_name,
            amount=claim_in.claimAmount,
            claim_type=claim_in.claimType,
            risk_level=prediction.riskLevel,
            prediction=prediction.prediction,
            status="Pending",
            provider=claim_in.provider,
            submission_date=claim_in.submissionDate or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            diagnosis=claim_in.diagnosis,
            procedure=claim_in.procedure,
            treatment_cost=claim_in.treatmentCost or claim_in.claimAmount,
            hospitalization_duration=claim_in.hospitalizationDuration or 0,
            age=claim_in.age or 45,
            gender=claim_in.gender or "Female",
            policy_type=claim_in.policyType or "Commercial PPO",
            payer_name=claim_in.payerName or claim_in.policyType or "Commercial PPO",
            coverage_duration=claim_in.coverageDuration or 24,
            previous_claims=claim_in.previousClaims or 1,
            risk_score=prediction.riskScore,
            confidence=prediction.confidence,
            explanation=prediction.explanation,
            recommendation=prediction.recommendation,
            account_id=claim_in.accountId or "acc-apollo",
            last_analyzed_at=datetime.now(timezone.utc)
        )
        
        db.add(new_claim)
        db.commit()
        db.refresh(new_claim)
        target_claim = new_claim
    
    return ClaimResponse(
        id=target_claim.id,
        member=target_claim.member_name,
        amount=target_claim.amount,
        type=target_claim.claim_type,
        risk=target_claim.risk_level,
        prediction=target_claim.prediction,
        status=target_claim.status,
        submittedAt=target_claim.submission_date,
        provider=target_claim.provider,
        diagnosis=target_claim.diagnosis,
        procedure=target_claim.procedure,
        riskScore=target_claim.risk_score,
        confidence=target_claim.confidence,
        explanation=target_claim.explanation,
        recommendation=target_claim.recommendation,
        accountId=target_claim.account_id,
        payerName=target_claim.payer_name,
        lastAnalyzedAt=target_claim.last_analyzed_at.strftime("%Y-%m-%d %H:%M:%S") if target_claim.last_analyzed_at else None
    )

@router.post("/{id}/analyze", response_model=ClaimResponse, summary="Re-analyze an existing claim and update assessment")
def analyze_existing_claim(id: str, db: Session = Depends(get_db)):
    """Loads an existing claim, executes AI risk engine, updates its evaluation and timestamps."""
    claim = db.query(Claim).filter(Claim.id == id).first()
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim '{id}' not found.")
    
    claim_in = ClaimInput(
        claimId=claim.id,
        memberName=claim.member_name,
        claimAmount=claim.amount,
        claimType=claim.claim_type,
        provider=claim.provider,
        submissionDate=claim.submission_date,
        age=claim.age,
        gender=claim.gender,
        policyType=claim.policy_type,
        payerName=claim.payer_name,
        coverageDuration=claim.coverage_duration,
        previousClaims=claim.previous_claims,
        diagnosis=claim.diagnosis,
        procedure=claim.procedure,
        treatmentCost=claim.treatment_cost,
        hospitalizationDuration=claim.hospitalization_duration,
        accountId=claim.account_id
    )
    
    prediction = ml_engine.predict(claim_in)
    claim.risk_level = prediction.riskLevel
    claim.prediction = prediction.prediction
    claim.risk_score = prediction.riskScore
    claim.confidence = prediction.confidence
    claim.explanation = prediction.explanation
    claim.recommendation = prediction.recommendation
    claim.last_analyzed_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(claim)
    
    return ClaimResponse(
        id=claim.id,
        member=claim.member_name,
        amount=claim.amount,
        type=claim.claim_type,
        risk=claim.risk_level,
        prediction=claim.prediction,
        status=claim.status,
        submittedAt=claim.submission_date,
        provider=claim.provider,
        diagnosis=claim.diagnosis,
        procedure=claim.procedure,
        riskScore=claim.risk_score,
        confidence=claim.confidence,
        explanation=claim.explanation,
        recommendation=claim.recommendation,
        accountId=claim.account_id,
        payerName=claim.payer_name,
        lastAnalyzedAt=claim.last_analyzed_at.strftime("%Y-%m-%d %H:%M:%S") if claim.last_analyzed_at else None
    )

@router.post("/predict", response_model=PredictionResult, summary="AI explainable denial risk assessment")
def predict_claim_denial(claim_in: ClaimInput):
    """Executes AI ML model assessment returning prediction, confidence, risk score, and explainable recommendations."""
    return ml_engine.predict(claim_in)
