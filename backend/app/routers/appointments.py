from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from backend.app.database import get_db
from backend.app.models.appointment import Appointment
from backend.app.models.patient import Patient
from backend.app.models.insurance import InsurancePolicy
from backend.app.schemas.appointment import AppointmentCreate, AppointmentResponse

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.get("", response_model=List[AppointmentResponse])
def list_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    department: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(Appointment).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.insurance_policy)
    )
    if department:
        query = query.filter(Appointment.department == department)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    
    return query.order_by(Appointment.appointment_time.asc()).offset(skip).limit(limit).all()

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: str, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.insurance_policy)
    ).filter(Appointment.appointment_id == appointment_id).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Appointment {appointment_id} not found"
        )
    return appointment

@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Patient {payload.patient_id} does not exist"
        )
    
    # If insurance_policy_id provided, verify
    if payload.insurance_policy_id:
        policy = db.query(InsurancePolicy).filter(
            InsurancePolicy.insurance_policy_id == payload.insurance_policy_id
        ).first()
        if not policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Insurance policy {payload.insurance_policy_id} does not exist"
            )

    appointment = Appointment(**payload.model_dump())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment
