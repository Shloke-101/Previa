import uuid
from datetime import datetime, date, timedelta
from decimal import Decimal

from backend.app.database import SessionLocal, engine, Base
from backend.app.models.patient import Patient
from backend.app.models.insurance import InsurancePolicy
from backend.app.models.appointment import Appointment
from backend.app.models.clearance import ClearanceRecord

def seed_database():
    print("[*] Creating database schema tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Patient).count() > 0:
            print("[*] Database already populated with synthetic patients. Resetting seed data...")
            db.query(ClearanceRecord).delete()
            db.query(Appointment).delete()
            db.query(InsurancePolicy).delete()
            db.query(Patient).delete()
            db.commit()

        print("[*] Seeding 7 comprehensive synthetic patient scenarios...")

        today = date.today()
        now = datetime.utcnow()

        # ----------------------------------------------------
        # Scenario 1: Elena Rostova -> Standard CLEARED (Low Risk)
        # ----------------------------------------------------
        p1 = Patient(
            patient_id=str(uuid.uuid4()),
            first_name="Elena",
            last_name="Rostova",
            date_of_birth=date(1985, 4, 12),
            gender="FEMALE",
            mrn="MRN-882910",
            phone="312-555-0144",
            email="elena.rostova@mockhealth.org",
            address={"street": "442 Michigan Ave", "city": "Chicago", "state": "IL", "postal_code": "60611"}
        )
        db.add(p1)

        ins1 = InsurancePolicy(
            insurance_policy_id=str(uuid.uuid4()),
            patient_id=p1.patient_id,
            payer_name="BlueCross BlueShield",
            payer_id="BCBS-IL-001",
            plan_name="BlueChoice PPO Advantage",
            member_id="BC9928172",
            policy_number="POL-449102",
            group_number="GRP-88192",
            policy_status="ACTIVE",
            network_tier="IN_NETWORK",
            start_date=today - timedelta(days=180),
            end_date=today + timedelta(days=185),
            field_validations=[
                {"field_name": "member_id", "card_value": "BC9928172", "record_value": "BC9928172", "status": "MATCH", "severity": "CRITICAL"},
                {"field_name": "patient_name", "card_value": "Elena Rostova", "record_value": "Elena Rostova", "status": "MATCH", "severity": "MEDIUM"}
            ]
        )
        db.add(ins1)

        appt1 = Appointment(
            appointment_id=str(uuid.uuid4()),
            patient_id=p1.patient_id,
            insurance_policy_id=ins1.insurance_policy_id,
            appointment_time=now + timedelta(days=2, hours=3),
            provider_name="Dr. Gregory House, MD",
            department="Internal Medicine",
            facility_name="Main Campus Clinic - Suite 300",
            procedure_code="99213",
            procedure_description="Office or outpatient visit, established patient, 20-29 mins",
            estimated_cost=Decimal("220.00"),
            status="SCHEDULED"
        )
        db.add(appt1)

        # ----------------------------------------------------
        # Scenario 2: Marcus Vance -> Prior Auth Required / Missing (Needs Action)
        # ----------------------------------------------------
        p2 = Patient(
            patient_id=str(uuid.uuid4()),
            first_name="Marcus",
            last_name="Vance",
            date_of_birth=date(1972, 11, 3),
            gender="MALE",
            mrn="MRN-104928",
            phone="312-555-0188",
            email="marcus.vance@mockhealth.org",
            address={"street": "128 W Wacker Dr", "city": "Chicago", "state": "IL", "postal_code": "60601"}
        )
        db.add(p2)

        ins2 = InsurancePolicy(
            insurance_policy_id=str(uuid.uuid4()),
            patient_id=p2.patient_id,
            payer_name="Aetna Health",
            payer_id="AETNA-001",
            plan_name="Aetna Open Choice PPO",
            member_id="AET883719",
            policy_number="POL-992817",
            group_number="GRP-33100",
            policy_status="ACTIVE",
            network_tier="IN_NETWORK",
            start_date=today - timedelta(days=120),
            end_date=today + timedelta(days=245),
            field_validations=[
                {"field_name": "member_id", "card_value": "AET883719", "record_value": "AET883719", "status": "MATCH", "severity": "CRITICAL"}
            ]
        )
        db.add(ins2)

        appt2 = Appointment(
            appointment_id=str(uuid.uuid4()),
            patient_id=p2.patient_id,
            insurance_policy_id=ins2.insurance_policy_id,
            appointment_time=now + timedelta(days=3, hours=5),
            provider_name="Dr. Allison Cameron, MD",
            department="Radiology",
            facility_name="Advanced Imaging Pavilion",
            procedure_code="70553",
            procedure_description="MRI Brain with and without contrast",
            estimated_cost=Decimal("1850.00"),
            status="SCHEDULED"
        )
        db.add(appt2)

        # ----------------------------------------------------
        # Scenario 3: Rahul Sharma -> OCR Member ID Mismatch (High Risk)
        # ----------------------------------------------------
        p3 = Patient(
            patient_id=str(uuid.uuid4()),
            first_name="Rahul",
            last_name="Sharma",
            date_of_birth=date(2005, 5, 12),
            gender="MALE",
            mrn="MRN-773918",
            phone="312-555-0199",
            email="rahul.sharma@mockhealth.org",
            address={"street": "810 S Halsted St", "city": "Chicago", "state": "IL", "postal_code": "60607"}
        )
        db.add(p3)

        ins3 = InsurancePolicy(
            insurance_policy_id=str(uuid.uuid4()),
            patient_id=p3.patient_id,
            payer_name="UnitedHealthcare",
            payer_id="UHC-001",
            plan_name="UHC Choice Plus",
            member_id="AB123465",  # Hospital record has typo
            policy_number="POL-554219",
            group_number="GRP-99001",
            policy_status="ACTIVE",
            network_tier="IN_NETWORK",
            start_date=today - timedelta(days=90),
            end_date=today + timedelta(days=275),
            card_ocr_data={
                "extracted_member_id": "AB123456",
                "extracted_name": "Rahul Sharma",
                "ocr_confidence": 0.96
            },
            field_validations=[
                {"field_name": "member_id", "card_value": "AB123456", "record_value": "AB123465", "status": "MISMATCH", "severity": "CRITICAL", "message": "OCR card Member ID differs from hospital EHR MRN record"},
                {"field_name": "patient_name", "card_value": "Rahul Sharma", "record_value": "Rahul Sharma", "status": "MATCH", "severity": "MEDIUM"}
            ]
        )
        db.add(ins3)

        appt3 = Appointment(
            appointment_id=str(uuid.uuid4()),
            patient_id=p3.patient_id,
            insurance_policy_id=ins3.insurance_policy_id,
            appointment_time=now + timedelta(days=1, hours=2),
            provider_name="Dr. Eric Foreman, MD",
            department="Neurology",
            facility_name="Neuroscience Center",
            procedure_code="99214",
            procedure_description="Office or outpatient visit, 30-39 mins, complex diagnostic",
            estimated_cost=Decimal("350.00"),
            status="SCHEDULED"
        )
        db.add(appt3)

        # ----------------------------------------------------
        # Scenario 4: Sarah Jenkins -> Expired Insurance Policy (High Risk)
        # ----------------------------------------------------
        p4 = Patient(
            patient_id=str(uuid.uuid4()),
            first_name="Sarah",
            last_name="Jenkins",
            date_of_birth=date(1990, 8, 22),
            gender="FEMALE",
            mrn="MRN-338291",
            phone="312-555-0233",
            email="sarah.jenkins@mockhealth.org",
            address={"street": "1500 N Wells St", "city": "Chicago", "state": "IL", "postal_code": "60610"}
        )
        db.add(p4)

        ins4 = InsurancePolicy(
            insurance_policy_id=str(uuid.uuid4()),
            patient_id=p4.patient_id,
            payer_name="Cigna Health",
            payer_id="CIGNA-001",
            plan_name="Cigna Connect Comprehensive",
            member_id="CIG-0029182",
            policy_number="POL-119283",
            group_number="GRP-44120",
            policy_status="EXPIRED",
            network_tier="IN_NETWORK",
            start_date=today - timedelta(days=400),
            end_date=today - timedelta(days=35),  # Expired 35 days ago
            field_validations=[
                {"field_name": "member_id", "card_value": "CIG-0029182", "record_value": "CIG-0029182", "status": "MATCH", "severity": "CRITICAL"}
            ]
        )
        db.add(ins4)

        appt4 = Appointment(
            appointment_id=str(uuid.uuid4()),
            patient_id=p4.patient_id,
            insurance_policy_id=ins4.insurance_policy_id,
            appointment_time=now + timedelta(days=4, hours=1),
            provider_name="Dr. Robert Chase, MD",
            department="Cardiology",
            facility_name="Heart & Vascular Institute",
            procedure_code="93000",
            procedure_description="Electrocardiogram, routine ECG with at least 12 leads",
            estimated_cost=Decimal("290.00"),
            status="SCHEDULED"
        )
        db.add(appt4)

        # ----------------------------------------------------
        # Scenario 5: David Kim -> Out-of-Network Facility (Needs Action)
        # ----------------------------------------------------
        p5 = Patient(
            patient_id=str(uuid.uuid4()),
            first_name="David",
            last_name="Kim",
            date_of_birth=date(1978, 2, 18),
            gender="MALE",
            mrn="MRN-554910",
            phone="312-555-0721",
            email="david.kim@mockhealth.org",
            address={"street": "920 W Fulton Market", "city": "Chicago", "state": "IL", "postal_code": "60607"}
        )
        db.add(p5)

        ins5 = InsurancePolicy(
            insurance_policy_id=str(uuid.uuid4()),
            patient_id=p5.patient_id,
            payer_name="Humana",
            payer_id="HUMANA-001",
            plan_name="Humana Gold Plus HMO",
            member_id="HUM-881920",
            policy_number="POL-661928",
            group_number="GRP-11002",
            policy_status="ACTIVE",
            network_tier="OUT_OF_NETWORK",
            start_date=today - timedelta(days=100),
            end_date=today + timedelta(days=265)
        )
        db.add(ins5)

        appt5 = Appointment(
            appointment_id=str(uuid.uuid4()),
            patient_id=p5.patient_id,
            insurance_policy_id=ins5.insurance_policy_id,
            appointment_time=now + timedelta(days=5, hours=6),
            provider_name="Dr. Lisa Cuddy, MD",
            department="Cardiology",
            facility_name="Outpatient Specialty Wing",
            procedure_code="99243",
            procedure_description="Office consultation for new or established patient, 40 mins",
            estimated_cost=Decimal("410.00"),
            status="SCHEDULED"
        )
        db.add(appt5)

        # ----------------------------------------------------
        # Scenario 6: Maria Garcia -> Standard Cleared (Low Risk)
        # ----------------------------------------------------
        p6 = Patient(
            patient_id=str(uuid.uuid4()),
            first_name="Maria",
            last_name="Garcia",
            date_of_birth=date(1995, 6, 30),
            gender="FEMALE",
            mrn="MRN-662019",
            phone="312-555-0881",
            email="maria.garcia@mockhealth.org",
            address={"street": "2100 S Damen Ave", "city": "Chicago", "state": "IL", "postal_code": "60608"}
        )
        db.add(p6)

        ins6 = InsurancePolicy(
            insurance_policy_id=str(uuid.uuid4()),
            patient_id=p6.patient_id,
            payer_name="BlueCross BlueShield",
            payer_id="BCBS-IL-001",
            plan_name="Blue Precision HMO",
            member_id="BC5519283",
            policy_number="POL-330192",
            group_number="GRP-88192",
            policy_status="ACTIVE",
            network_tier="IN_NETWORK",
            start_date=today - timedelta(days=60),
            end_date=today + timedelta(days=305)
        )
        db.add(ins6)

        appt6 = Appointment(
            appointment_id=str(uuid.uuid4()),
            patient_id=p6.patient_id,
            insurance_policy_id=ins6.insurance_policy_id,
            appointment_time=now + timedelta(days=6, hours=2),
            provider_name="Dr. James Wilson, MD",
            department="Dermatology",
            facility_name="Dermatology Center",
            procedure_code="11102",
            procedure_description="Tangential biopsy of skin single lesion",
            estimated_cost=Decimal("195.00"),
            status="SCHEDULED"
        )
        db.add(appt6)

        # ----------------------------------------------------
        # Scenario 7: James Wilson -> Policy Expiring in 12 Days (Needs Action)
        # ----------------------------------------------------
        p7 = Patient(
            patient_id=str(uuid.uuid4()),
            first_name="James",
            last_name="Wilson",
            date_of_birth=date(1968, 9, 14),
            gender="MALE",
            mrn="MRN-449102",
            phone="312-555-0455",
            email="james.wilson@mockhealth.org",
            address={"street": "600 N Clark St", "city": "Chicago", "state": "IL", "postal_code": "60654"}
        )
        db.add(p7)

        ins7 = InsurancePolicy(
            insurance_policy_id=str(uuid.uuid4()),
            patient_id=p7.patient_id,
            payer_name="UnitedHealthcare",
            payer_id="UHC-001",
            plan_name="UHC Options PPO",
            member_id="UHC-992019",
            policy_number="POL-771829",
            group_number="GRP-99001",
            policy_status="ACTIVE",
            network_tier="IN_NETWORK",
            start_date=today - timedelta(days=350),
            end_date=today + timedelta(days=12)  # Expiring in 12 days
        )
        db.add(ins7)

        appt7 = Appointment(
            appointment_id=str(uuid.uuid4()),
            patient_id=p7.patient_id,
            insurance_policy_id=ins7.insurance_policy_id,
            appointment_time=now + timedelta(days=7, hours=4),
            provider_name="Dr. Chris Taub, MD",
            department="Orthopedics",
            facility_name="Orthopedic Surgery Center",
            procedure_code="20610",
            procedure_description="Arthrocentesis, aspiration and/or injection, major joint",
            estimated_cost=Decimal("380.00"),
            status="SCHEDULED"
        )
        db.add(appt7)

        db.commit()
        print("[SUCCESS] Successfully seeded 7 synthetic patients and encounters!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
