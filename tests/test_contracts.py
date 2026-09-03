"""
Test suite for validating contracts and cross-domain schemas.
Compatible with standard unittest and pytest.
"""
import json
import unittest
from pathlib import Path

CONTRACTS_DIR = Path(__file__).resolve().parent.parent / "contracts"

EXPECTED_SCHEMAS = [
    "patient.schema.json",
    "insurance.schema.json",
    "appointment.schema.json",
    "eligibility.schema.json",
    "coverage.schema.json",
    "authorization.schema.json",
    "financial.schema.json",
    "risk.schema.json",
    "clearance.schema.json",
    "recommendation.schema.json",
    "denial.schema.json",
    "workflow.schema.json",
    "api_spec.json"
]

class TestContractSchemas(unittest.TestCase):

    def test_all_schemas_exist_and_are_valid_json(self):
        for schema_filename in EXPECTED_SCHEMAS:
            schema_path = CONTRACTS_DIR / schema_filename
            self.assertTrue(schema_path.exists(), f"Schema file {schema_filename} missing from contracts/")
            with open(schema_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.assertIsInstance(data, dict, f"Schema {schema_filename} root must be a JSON object")

    def test_clearance_enums(self):
        with open(CONTRACTS_DIR / "clearance.schema.json", "r", encoding="utf-8") as f:
            clearance_schema = json.load(f)
        clearance_enums = clearance_schema["properties"]["clearance_status"]["enum"]
        self.assertEqual(set(clearance_enums), {"CLEARED", "NEEDS_ACTION", "HIGH_RISK"})

    def test_risk_enums(self):
        with open(CONTRACTS_DIR / "risk.schema.json", "r", encoding="utf-8") as f:
            risk_schema = json.load(f)
        risk_enums = risk_schema["properties"]["risk_level"]["enum"]
        self.assertEqual(set(risk_enums), {"LOW", "MEDIUM", "HIGH"})

    def test_authorization_enums(self):
        with open(CONTRACTS_DIR / "authorization.schema.json", "r", encoding="utf-8") as f:
            auth_schema = json.load(f)
        auth_enums = auth_schema["properties"]["authorization_status"]["enum"]
        self.assertEqual(set(auth_enums), {"NOT_REQUIRED", "REQUIRED", "PENDING", "APPROVED", "DENIED"})

    def test_validation_enums(self):
        with open(CONTRACTS_DIR / "insurance.schema.json", "r", encoding="utf-8") as f:
            ins_schema = json.load(f)
        val_enums = ins_schema["definitions"]["ValidationStatus"]["enum"]
        self.assertEqual(set(val_enums), {"MATCH", "PARTIAL_MATCH", "MISMATCH"})

if __name__ == "__main__":
    unittest.main()
