from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.patient import Patient
from backend.app.models.insurance import InsurancePolicy
from backend.app.models.appointment import Appointment
from backend.app.models.clearance import ClearanceRecord
from backend.app.schemas.clearance import ClearanceEvaluationRequest, ClearanceEvaluationResponse
from backend.app.services.clearance_engine import evaluate_encounter_clearance

router = APIRouter(prefix="/clearance", tags=["Clearance Engine"])

@router.post("/evaluate", response_model=ClearanceEvaluationResponse)
def evaluate_clearance(payload: ClearanceEvaluationRequest, db: Session = Depends(get_db)):
    # 1. Fetch patient
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Patient {payload.patient_id} not found"
        )

    # 2. Fetch appointment
    appointment = db.query(Appointment).filter(Appointment.appointment_id == payload.appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Appointment {payload.appointment_id} not found"
        )

    # 3. Fetch linked insurance policy (either from appointment or patient's primary policy)
    policy = None
    if appointment.insurance_policy_id:
        policy = db.query(InsurancePolicy).filter(
            InsurancePolicy.insurance_policy_id == appointment.insurance_policy_id
        ).first()
    if not policy and patient.insurance_policies:
        policy = patient.insurance_policies[0]

    # 4. Evaluate clearance deterministically
    result = evaluate_encounter_clearance(patient, policy, appointment)

    # 5. Persist clearance record
    clearance_record = ClearanceRecord(
        clearance_id=result["clearance_id"],
        patient_id=result["patient_id"],
        appointment_id=result["appointment_id"],
        clearance_status=result["clearance_status"],
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        is_blocked=result["is_blocked"],
        blocking_reasons=result["blocking_reasons"],
        factors=result["factors"],
        recommended_actions=result["recommended_actions"],
        evaluated_at=result["evaluated_at"],
        evaluated_by=result["evaluated_by"]
    )
    db.add(clearance_record)
    db.commit()

    return result

@router.get("/{patient_id}", response_model=ClearanceEvaluationResponse)
def get_latest_patient_clearance(patient_id: str, db: Session = Depends(get_db)):
    record = db.query(ClearanceRecord).filter(
        ClearanceRecord.patient_id == patient_id
    ).order_by(ClearanceRecord.evaluated_at.desc()).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No clearance records found for patient {patient_id}"
        )
    return record
