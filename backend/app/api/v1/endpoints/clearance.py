from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.clearance import ClearanceRecord
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.insurance import InsurancePolicy
from app.schemas.clearance import (
    ClearanceEvaluationRequest,
    ClearanceEvaluationResponse,
    PriorityQueueItem,
    ClearanceSummaryResponse
)
from app.services.clearance_engine import evaluate_patient_clearance
from app.services.authorization_service import approve_patient_authorization

router = APIRouter()

@router.post("/evaluate", response_model=ClearanceEvaluationResponse, summary="Run deterministic clearance evaluation")
def evaluate_clearance(req: ClearanceEvaluationRequest, db: Session = Depends(get_db)):
    """Executes deterministic Pre-Visit Financial Clearance engine for a patient."""
    return evaluate_patient_clearance(db, req.patient_id, req.appointment_id)

@router.get("/priority-queue", response_model=ClearanceSummaryResponse, summary="Get full clearance worklist priority queue")
def get_clearance_priority_queue(db: Session = Depends(get_db)):
    """Returns all pre-service encounters with clearance statuses, risk scores, and priority sorting."""
    clearances = db.query(ClearanceRecord).order_by(ClearanceRecord.risk_score.desc()).all()
    
    items: List[PriorityQueueItem] = []
    at_risk_revenue = 0.0
    cleared_count = 0
    needs_action_count = 0
    high_risk_count = 0

    for c in clearances:
        if c.clearance_status == "CLEARED":
            cleared_count += 1
        elif c.clearance_status == "NEEDS_ACTION":
            needs_action_count += 1
            at_risk_revenue += c.estimated_patient_responsibility
        elif c.clearance_status == "HIGH_RISK":
            high_risk_count += 1
            at_risk_revenue += c.estimated_patient_responsibility

        patient = db.query(Patient).filter(Patient.id == c.patient_id).first()
        appointment = db.query(Appointment).filter(Appointment.id == c.appointment_id).first()
        policy = db.query(InsurancePolicy).filter(InsurancePolicy.patient_id == c.patient_id).first()

        items.append(PriorityQueueItem(
            patient_id=c.patient_id,
            patient_name=f"{patient.first_name} {patient.last_name}" if patient else "Patient",
            dob=patient.dob if patient else "1985-01-01",
            appointment_id=c.appointment_id,
            appointment_datetime=appointment.appointment_datetime if appointment else "2026-09-04 09:30 AM",
            procedure_code=appointment.cpt_code if appointment else "99213",
            procedure_name=appointment.service_description if appointment else "Medical Encounter",
            payer_name=policy.payer_name if policy else "Commercial Payer",
            member_id=policy.member_id if policy else "UNKNOWN",
            group_number=policy.group_number if policy else "GRP-000",
            clearance_status=c.clearance_status,
            risk_score=c.risk_score,
            risk_level=c.risk_level,
            eligibility_status=c.eligibility_status,
            authorization_status=c.authorization_status,
            auth_number=c.auth_number,
            data_validation_status=c.data_validation_status,
            estimated_patient_responsibility=c.estimated_patient_responsibility,
            primary_blocker=c.primary_blocker,
            recommended_actions=c.recommended_actions or []
        ))

    total = len(clearances)
    clearance_rate = round((cleared_count / (total or 1)) * 100, 1)

    return ClearanceSummaryResponse(
        total_encounters=total,
        cleared_count=cleared_count,
        needs_action_count=needs_action_count,
        high_risk_count=high_risk_count,
        clearance_rate_pct=clearance_rate,
        at_risk_revenue=round(at_risk_revenue, 2),
        queue=items
    )

@router.post("/resolve/{patient_id}", response_model=ClearanceEvaluationResponse, summary="1-Click resolve & financially clear patient")
def resolve_clearance(patient_id: str, db: Session = Depends(get_db)):
    """Resolves pending authorization/validation blockers and assigns CLEARED status."""
    record = approve_patient_authorization(db, patient_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found.")
    return evaluate_patient_clearance(db, patient_id)
