from sqlalchemy.orm import Session
from app.models.insurance import InsurancePolicy
from app.models.appointment import Appointment
from app.schemas.financial import FinancialEstimateResponse

def calculate_financial_responsibility(
    db: Session,
    patient_id: str,
    procedure_cost: float = None
) -> FinancialEstimateResponse:
    """
    Calculates estimated out-of-pocket patient financial responsibility using deterministic formula:
    Deductible_Remaining + Copay + (Allowable - Deductible_Remaining) * Coinsurance_Pct
    """
    policy = db.query(InsurancePolicy).filter(InsurancePolicy.patient_id == patient_id).first()
    appointment = db.query(Appointment).filter(Appointment.patient_id == patient_id).first()

    total_cost = procedure_cost or (appointment.estimated_cost if appointment else 450.0)
    
    if not policy or policy.policy_status != "ACTIVE":
        # Uninsured / Terminated: 100% self-pay
        return FinancialEstimateResponse(
            patient_id=patient_id,
            total_estimated_cost=total_cost,
            deductible_total=0.0,
            deductible_remaining=0.0,
            copay_amount=0.0,
            coinsurance_percentage=100.0,
            coinsurance_amount=total_cost,
            estimated_patient_responsibility=total_cost,
            estimated_payer_responsibility=0.0,
            formula_used="Self-Pay: Total Incurred Charge"
        )

    deductible_rem = min(policy.deductible_remaining, total_cost)
    copay = policy.copay_amount
    subject_to_coinsurance = max(0.0, total_cost - deductible_rem - copay)
    coinsurance_amt = subject_to_coinsurance * (policy.coinsurance_percentage / 100.0)
    
    patient_resp = deductible_rem + copay + coinsurance_amt
    payer_resp = max(0.0, total_cost - patient_resp)

    return FinancialEstimateResponse(
        patient_id=patient_id,
        total_estimated_cost=round(total_cost, 2),
        deductible_total=round(policy.deductible_total, 2),
        deductible_remaining=round(policy.deductible_remaining, 2),
        copay_amount=round(copay, 2),
        coinsurance_percentage=round(policy.coinsurance_percentage, 1),
        coinsurance_amount=round(coinsurance_amt, 2),
        estimated_patient_responsibility=round(patient_resp, 2),
        estimated_payer_responsibility=round(payer_resp, 2)
    )
