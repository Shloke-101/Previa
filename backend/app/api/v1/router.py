from fastapi import APIRouter

from app.api.v1.endpoints import (
    dashboard,
    claims,
    patients,
    appointments,
    eligibility,
    coverage,
    authorization,
    clearance,
    financial,
    analytics,
    model,
    rules,
    ocr,
    self_heal
)

api_router = APIRouter()

api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(claims.router, prefix="/claims", tags=["Claims"])
api_router.include_router(patients.router, prefix="/patients", tags=["Patients"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
api_router.include_router(eligibility.router, prefix="/eligibility", tags=["Eligibility Verification"])
api_router.include_router(coverage.router, prefix="/coverage", tags=["Coverage & Network"])
api_router.include_router(authorization.router, prefix="/workflows/authorization", tags=["Prior Authorization"])
api_router.include_router(clearance.router, prefix="/clearance", tags=["Clearance Engine"])
api_router.include_router(financial.router, prefix="/financial", tags=["Financial Estimation"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Denial Analytics & RCA"])
api_router.include_router(model.router, prefix="/model", tags=["Model Intelligence"])
api_router.include_router(rules.router, prefix="/rules", tags=["Preventive Rules Engine"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["Insurance Card OCR"])
api_router.include_router(self_heal.router, prefix="/self-heal", tags=["RCM Self-Healing Engine"])
