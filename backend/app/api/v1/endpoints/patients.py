from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.patient import Patient
from app.models.insurance import InsurancePolicy
from app.models.appointment import Appointment
from app.models.clearance import ClearanceRecord
from app.schemas.patient import PatientCreate, PatientResponse, PatientDossierResponse, DossierInsurance, DossierAppointment, DossierFinancials, DossierPriorAuth, DossierClearance
from app.services.financial_service import calculate_financial_responsibility

router = APIRouter()

@router.get("", response_model=List[PatientResponse], summary="List all patients")
def list_patients(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Returns registered synthetic patient records."""
    patients = db.query(Patient).offset(skip).limit(limit).all()
    return patients

@router.get("/{id}", response_model=PatientResponse, summary="Get patient details")
def get_patient(id: str, db: Session = Depends(get_db)):
    """Retrieves patient demographic record by ID."""
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient '{id}' not found.")
    return patient

@router.get("/{id}/dossier", response_model=PatientDossierResponse, summary="Get full patient financial clearance dossier")
def get_patient_dossier(id: str, db: Session = Depends(get_db)):
    """Retrieves complete pre-service audit dossier including insurance, appointment, prior auth, and risk breakdown."""
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient '{id}' not found.")
    
    policy = db.query(InsurancePolicy).filter(InsurancePolicy.patient_id == id).first()
    appointment = db.query(Appointment).filter(Appointment.patient_id == id).first()
    clearance = db.query(ClearanceRecord).filter(ClearanceRecord.patient_id == id).first()
    financials = calculate_financial_responsibility(db, id)

    return PatientDossierResponse(
        patient_id=patient.id,
        first_name=patient.first_name,
        last_name=patient.last_name,
        dob=patient.dob,
        phone=patient.phone,
        email=patient.email,
        address=patient.address,
        insurance=DossierInsurance(
            payer_id=policy.payer_id if policy else "UNKNOWN",
            payer_name=policy.payer_name if policy else "Self-Pay / None",
            plan_name=policy.plan_name if policy else "None",
            member_id=policy.member_id if policy else "N/A",
            group_number=policy.group_number if policy else "N/A",
            policy_status=policy.policy_status if policy else "INACTIVE",
            effective_date=policy.effective_date if policy else "N/A",
            expiration_date=policy.expiration_date if policy else "N/A",
            in_network=policy.in_network if policy else False
        ),
        appointment=DossierAppointment(
            appointment_id=appointment.id if appointment else "APT-NONE",
            datetime=appointment.appointment_datetime if appointment else "Not Scheduled",
            department=appointment.department if appointment else "Outpatient",
            provider_name=appointment.provider_name if appointment else "Attending Staff, MD",
            cpt_code=appointment.cpt_code if appointment else "99213",
            service_description=appointment.service_description if appointment else "Clinical Consult"
        ),
        financials=DossierFinancials(
            total_estimated_cost=financials.total_estimated_cost,
            deductible_total=financials.deductible_total,
            deductible_remaining=financials.deductible_remaining,
            copay_amount=financials.copay_amount,
            coinsurance_percentage=financials.coinsurance_percentage,
            coinsurance_amount=financials.coinsurance_amount,
            estimated_patient_responsibility=financials.estimated_patient_responsibility,
            estimated_payer_responsibility=financials.estimated_payer_responsibility
        ),
        prior_auth=DossierPriorAuth(
            required=clearance.authorization_status != "NOT_REQUIRED" if clearance else False,
            status=clearance.authorization_status if clearance else "NOT_REQUIRED",
            auth_number=clearance.auth_number if clearance else None,
            notes=clearance.primary_blocker if (clearance and clearance.authorization_status in ["REQUIRED", "PENDING"]) else "Prior authorization active or not required."
        ),
        clearance=DossierClearance(
            status=clearance.clearance_status if clearance else "CLEARED",
            risk_score=clearance.risk_score if clearance else 15,
            risk_level=clearance.risk_level if clearance else "LOW",
            data_validation_status=clearance.data_validation_status if clearance else "MATCH",
            flags=clearance.flags if clearance else [],
            recommended_actions=clearance.recommended_actions if clearance else ["Proceed with standard pre-visit clearance."]
        )
    )

@router.post("", response_model=PatientResponse, status_code=201, summary="Register a new patient")
def register_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    """Registers a new synthetic patient."""
    existing = db.query(Patient).filter(Patient.id == patient_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Patient with ID '{patient_in.id}' already exists.")
    
    patient = Patient(
        id=patient_in.id,
        first_name=patient_in.first_name,
        last_name=patient_in.last_name,
        dob=patient_in.dob,
        phone=patient_in.phone,
        email=patient_in.email,
        address=patient_in.address
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient
