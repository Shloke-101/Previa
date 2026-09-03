from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.insurance import InsurancePolicy
from app.models.clearance import ClearanceRecord
from app.schemas.ocr import OcrExtractionResponse, ExtractedFieldItem, ExtractedBoundingBox

# Preset Synthetic Card Extractions
MOCK_OCR_SAMPLES: Dict[str, Dict[str, Any]] = {
    "sample-bcbs": {
        "sample_id": "sample-bcbs",
        "payer_name": "Blue Cross Blue Shield",
        "plan_type": "PPO Comprehensive Plus Tier 1",
        "patient_name": "ELEANOR VANCE",
        "member_id": "BCBS-9823101",
        "group_number": "GRP-4410",
        "dob": "06/14/1984",
        "rx_bin": "004336",
        "rx_pcn": "ADV",
        "card_image_color": "linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)",
        "overall_confidence": 0.98,
        "fields": [
            {
                "fieldName": "patient_name",
                "label": "Member Name",
                "ocrValue": "ELEANOR VANCE",
                "hospitalValue": "Eleanor Vance",
                "status": "MATCH",
                "confidence": 0.98,
                "box": {"x": 8, "y": 35, "width": 45, "height": 12, "label": "Name"}
            },
            {
                "fieldName": "member_id",
                "label": "Member ID",
                "ocrValue": "BCBS-9823101",
                "hospitalValue": "BCBS-9823101",
                "status": "MATCH",
                "confidence": 0.99,
                "box": {"x": 8, "y": 52, "width": 38, "height": 12, "label": "Member ID"}
            },
            {
                "fieldName": "group_number",
                "label": "Group Number",
                "ocrValue": "GRP-4410",
                "hospitalValue": "GRP-4410",
                "status": "MATCH",
                "confidence": 0.96,
                "box": {"x": 55, "y": 52, "width": 32, "height": 12, "label": "Group No"}
            },
            {
                "fieldName": "payer_name",
                "label": "Payer Name",
                "ocrValue": "BLUE CROSS BLUE SHIELD",
                "hospitalValue": "Blue Cross Blue Shield",
                "status": "MATCH",
                "confidence": 0.99,
                "box": {"x": 8, "y": 12, "width": 60, "height": 14, "label": "Payer"}
            }
        ]
    },
    "sample-uhc-mismatch": {
        "sample_id": "sample-uhc-mismatch",
        "payer_name": "UnitedHealthcare",
        "plan_type": "Choice Plus PPO",
        "patient_name": "SOPHIA RODRIGUEZ",
        "member_id": "UHC-7712399-01",
        "group_number": "GRP-2020",
        "dob": "02/28/1995",
        "rx_bin": "610279",
        "rx_pcn": "9901",
        "card_image_color": "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        "overall_confidence": 0.95,
        "fields": [
            {
                "fieldName": "patient_name",
                "label": "Member Name",
                "ocrValue": "SOPHIA RODRIGUEZ",
                "hospitalValue": "Sophia Rodriguez",
                "status": "MATCH",
                "confidence": 0.97,
                "box": {"x": 8, "y": 35, "width": 48, "height": 12, "label": "Name"}
            },
            {
                "fieldName": "member_id",
                "label": "Member ID",
                "ocrValue": "UHC-7712399-01",
                "hospitalValue": "UHC-7712399",
                "status": "MISMATCH",
                "confidence": 0.95,
                "box": {"x": 8, "y": 52, "width": 42, "height": 12, "label": "Member ID"}
            },
            {
                "fieldName": "group_number",
                "label": "Group Number",
                "ocrValue": "GRP-2020",
                "hospitalValue": "GRP-2020",
                "status": "MATCH",
                "confidence": 0.98,
                "box": {"x": 55, "y": 52, "width": 32, "height": 12, "label": "Group No"}
            }
        ]
    }
}

def extract_insurance_card_data(sample_id: str = "sample-bcbs") -> OcrExtractionResponse:
    """Simulates Tesseract / OpenCV optical field extraction with bounding boxes and confidence levels."""
    sample = MOCK_OCR_SAMPLES.get(sample_id, MOCK_OCR_SAMPLES["sample-bcbs"])
    fields = [
        ExtractedFieldItem(
            fieldName=f["fieldName"],
            label=f["label"],
            ocrValue=f["ocrValue"],
            hospitalValue=f["hospitalValue"],
            status=f["status"],
            confidence=f["confidence"],
            box=ExtractedBoundingBox(**f["box"]) if f.get("box") else None
        )
        for f in sample["fields"]
    ]

    return OcrExtractionResponse(
        sample_id=sample["sample_id"],
        payer_name=sample["payer_name"],
        plan_type=sample["plan_type"],
        patient_name=sample["patient_name"],
        member_id=sample["member_id"],
        group_number=sample["group_number"],
        dob=sample["dob"],
        rx_bin=sample["rx_bin"],
        rx_pcn=sample["rx_pcn"],
        card_image_color=sample["card_image_color"],
        overall_confidence=sample["overall_confidence"],
        fields=fields
    )

def sync_ocr_to_master(db: Session, sample_id: str, patient_id: str) -> List[str]:
    """Synchronizes extracted OCR card fields into patient master record and updates clearance state."""
    synced = []
    if sample_id == "sample-uhc-mismatch":
        policy = db.query(InsurancePolicy).filter(InsurancePolicy.patient_id == patient_id).first()
        if policy:
            policy.member_id = "UHC-7712399-01"
            synced.append("member_id: UHC-7712399-01")

        clearance = db.query(ClearanceRecord).filter(ClearanceRecord.patient_id == patient_id).first()
        if clearance:
            clearance.data_validation_status = "MATCH"
            clearance.clearance_status = "CLEARED"
            clearance.risk_score = 14
            clearance.risk_level = "LOW"
            clearance.primary_blocker = None
            clearance.recommended_actions = ["Member ID synchronized with OCR verification. Encounter cleared."]
            clearance.flags = []
            synced.append("clearance_status -> CLEARED")
        db.commit()

    return synced
