from backend.app.routers.health import router as health_router
from backend.app.routers.patients import router as patients_router
from backend.app.routers.appointments import router as appointments_router
from backend.app.routers.insurance import router as insurance_router
from backend.app.routers.clearance import router as clearance_router
from backend.app.routers.dashboard import router as dashboard_router

__all__ = [
    "health_router",
    "patients_router",
    "appointments_router",
    "insurance_router",
    "clearance_router",
    "dashboard_router"
]
