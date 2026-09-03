import unittest
from datetime import datetime, date, timedelta
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database import Base, engine, SessionLocal
from backend.app.models.patient import Patient
from backend.app.models.insurance import InsurancePolicy
from backend.app.models.appointment import Appointment
from backend.app.seed import seed_database

class TestBackendAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Create tables and seed data for integration tests
        Base.metadata.create_all(bind=engine)
        seed_database()
        cls.client = TestClient(app)

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "Previa (PVFC) Backend API")

    def test_02_list_patients(self):
        res = self.client.get("/api/patients")
        self.assertEqual(res.status_code, 200)
        patients = res.json()
        self.assertGreaterEqual(len(patients), 7)
        first = patients[0]
        self.assertIn("patient_id", first)
        self.assertIn("first_name", first)
        self.assertIn("mrn", first)

    def test_03_get_patient_detail(self):
        patients_res = self.client.get("/api/patients")
        patient_id = patients_res.json()[0]["patient_id"]

        res = self.client.get(f"/api/patients/{patient_id}")
        self.assertEqual(res.status_code, 200)
        detail = res.json()
        self.assertEqual(detail["patient_id"], patient_id)
        self.assertIn("insurance_policies", detail)
        self.assertIn("appointments", detail)

    def test_04_create_patient(self):
        new_patient = {
            "first_name": "Alexander",
            "last_name": "Fleming",
            "date_of_birth": "1992-07-15",
            "gender": "MALE",
            "mrn": f"MRN-TEST-{datetime.utcnow().timestamp()}",
            "phone": "555-019-2831",
            "email": "alex.fleming@mockhealth.org",
            "address": {"street": "100 Medical Blvd", "city": "Chicago", "state": "IL", "postal_code": "60601"}
        }
        res = self.client.post("/api/patients", json=new_patient)
        self.assertEqual(res.status_code, 201)
        created = res.json()
        self.assertEqual(created["first_name"], "Alexander")
        self.assertIn("patient_id", created)

    def test_05_list_appointments(self):
        res = self.client.get("/api/appointments")
        self.assertEqual(res.status_code, 200)
        appts = res.json()
        self.assertGreaterEqual(len(appts), 7)
        first = appts[0]
        self.assertIn("appointment_id", first)
        self.assertIn("procedure_code", first)
        self.assertIn("patient", first)

    def test_06_get_insurance_policy(self):
        patients_res = self.client.get("/api/patients")
        elena = next(p for p in patients_res.json() if p["first_name"] == "Elena")
        detail_res = self.client.get(f"/api/patients/{elena['patient_id']}")
        policy_id = detail_res.json()["insurance_policies"][0]["insurance_policy_id"]

        res = self.client.get(f"/api/insurance/{policy_id}")
        self.assertEqual(res.status_code, 200)
        policy = res.json()
        self.assertEqual(policy["insurance_policy_id"], policy_id)
        self.assertEqual(policy["payer_name"], "BlueCross BlueShield")

    def test_07_clearance_evaluation_cleared(self):
        # Elena Rostova should be CLEARED
        patients_res = self.client.get("/api/patients")
        elena = next(p for p in patients_res.json() if p["first_name"] == "Elena")
        detail_res = self.client.get(f"/api/patients/{elena['patient_id']}")
        appt_id = detail_res.json()["appointments"][0]["appointment_id"]

        payload = {
            "patient_id": elena["patient_id"],
            "appointment_id": appt_id
        }
        res = self.client.post("/api/clearance/evaluate", json=payload)
        self.assertEqual(res.status_code, 200)
        clearance = res.json()
        self.assertEqual(clearance["clearance_status"], "CLEARED")
        self.assertEqual(clearance["risk_level"], "LOW")
        self.assertFalse(clearance["is_blocked"])

    def test_08_clearance_evaluation_high_risk_mismatch(self):
        # Rahul Sharma has Member ID Mismatch -> HIGH_RISK
        patients_res = self.client.get("/api/patients")
        rahul = next(p for p in patients_res.json() if p["first_name"] == "Rahul")
        detail_res = self.client.get(f"/api/patients/{rahul['patient_id']}")
        appt_id = detail_res.json()["appointments"][0]["appointment_id"]

        payload = {
            "patient_id": rahul["patient_id"],
            "appointment_id": appt_id
        }
        res = self.client.post("/api/clearance/evaluate", json=payload)
        self.assertEqual(res.status_code, 200)
        clearance = res.json()
        self.assertEqual(clearance["clearance_status"], "HIGH_RISK")
        self.assertIn("critical_member_id_mismatch", [f["factor_code"] for f in clearance["factors"]])
        self.assertTrue(clearance["is_blocked"])

    def test_09_clearance_evaluation_missing_auth(self):
        # Marcus Vance has MRI Brain 70553 without auth -> NEEDS_ACTION / HIGH risk
        patients_res = self.client.get("/api/patients")
        marcus = next(p for p in patients_res.json() if p["first_name"] == "Marcus")
        detail_res = self.client.get(f"/api/patients/{marcus['patient_id']}")
        appt_id = detail_res.json()["appointments"][0]["appointment_id"]

        payload = {
            "patient_id": marcus["patient_id"],
            "appointment_id": appt_id
        }
        res = self.client.post("/api/clearance/evaluate", json=payload)
        self.assertEqual(res.status_code, 200)
        clearance = res.json()
        self.assertEqual(clearance["clearance_status"], "NEEDS_ACTION")
        self.assertIn("missing_authorization", [f["factor_code"] for f in clearance["factors"]])

    def test_10_dashboard_endpoints(self):
        # 1. Summary
        sum_res = self.client.get("/api/dashboard/summary")
        self.assertEqual(sum_res.status_code, 200)
        summary = sum_res.json()
        self.assertGreaterEqual(summary["total_upcoming_patients"], 7)
        self.assertGreaterEqual(summary["cleared_count"], 1)

        # 2. Priority Queue
        prio_res = self.client.get("/api/dashboard/priority")
        self.assertEqual(prio_res.status_code, 200)
        queue = prio_res.json()
        self.assertGreaterEqual(len(queue), 1)
        self.assertIn("priority_rank", queue[0])

        # 3. Alerts
        alert_res = self.client.get("/api/dashboard/alerts")
        self.assertEqual(alert_res.status_code, 200)
        alerts = alert_res.json()
        self.assertGreaterEqual(len(alerts), 1)
        self.assertIn("severity", alerts[0])

if __name__ == "__main__":
    unittest.main()
