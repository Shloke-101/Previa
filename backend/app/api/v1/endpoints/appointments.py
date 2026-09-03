from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentResponse

router = APIRouter()

@router.get("", response_model=List[AppointmentResponse], summary="List appointments")
def list_appointments(
    department: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Returns scheduled patient encounters."""
    q = db.query(Appointment)
    if department:
        q = q.filter(Appointment.department.ilike(f"%{department}%"))
    return q.offset(skip).limit(limit).all()

@router.get("/{id}", response_model=AppointmentResponse, summary="Get appointment by ID")
def get_appointment(id: str, db: Session = Depends(get_db)):
    """Retrieves single scheduled appointment details."""
    apt = db.query(Appointment).filter(Appointment.id == id).first()
    if not apt:
        raise HTTPException(status_code=404, detail=f"Appointment '{id}' not found.")
    return apt

@router.post("", response_model=AppointmentResponse, status_code=201, summary="Create new appointment")
def create_appointment(apt_in: AppointmentCreate, db: Session = Depends(get_db)):
    """Creates a new patient encounter schedule."""
    apt = Appointment(
        id=apt_in.id,
        patient_id=apt_in.patient_id,
        appointment_datetime=apt_in.appointment_datetime,
        department=apt_in.department,
        provider_name=apt_in.provider_name,
        cpt_code=apt_in.cpt_code,
        service_description=apt_in.service_description,
        estimated_cost=apt_in.estimated_cost
    )
    db.add(apt)
    db.commit()
    db.refresh(apt)
    return apt
