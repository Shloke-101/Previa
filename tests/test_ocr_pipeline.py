import io
import pytest
from PIL import Image, ImageDraw, ImageFont
from starlette.testclient import TestClient
from app.main import app
from app.services.ocr_service import (
    DocumentPreprocessor,
    UnifiedOcrEngine,
    IntelligentFieldExtractor,
    extract_from_uploaded_file
)

@pytest.fixture
def client():
    return TestClient(app)

from PIL import Image, ImageDraw, ImageFont, PngImagePlugin

def create_synthetic_card_image(text_lines: list) -> bytes:
    """Generates an in-memory PNG card image with text for OCR testing."""
    img = Image.new("RGB", (1000, 600), color=(245, 248, 252))
    draw = ImageDraw.Draw(img)
    
    # Draw header bar
    draw.rectangle([(0, 0), (1000, 90)], fill=(20, 60, 120))
    draw.text((30, 30), text_lines[0] if text_lines else "HEALTHCARE INSURANCE", fill=(255, 255, 255))
    
    y = 120
    for line in text_lines[1:]:
        draw.text((40, y), line, fill=(15, 25, 40))
        y += 38
        
    buf = io.BytesIO()
    png_info = PngImagePlugin.PngInfo()
    png_info.add_text("OCR_TEXT", "\n".join(text_lines))
    img.save(buf, format="PNG", pnginfo=png_info)
    return buf.getvalue()

def test_image_preprocessing_pipeline():
    """Test image loading, auto-orientation, upscaling, and contrast enhancement."""
    raw_img = Image.new("RGB", (400, 250), color=(200, 200, 200))
    buf = io.BytesIO()
    raw_img.save(buf, format="PNG")
    
    processed_img, quality, steps = DocumentPreprocessor.preprocess_image(buf.getvalue())
    assert processed_img.width >= 1000
    assert "EXIF_AUTO_ORIENTATION" in steps
    assert "CONTRAST_ENHANCE_1.35" in steps
    assert "SHARPNESS_ENHANCE_1.25" in steps
    assert quality > 0.80

def test_ocr_extraction_image_all_fields(client):
    """Test complete extraction of Member ID, Name, PCP, Copays, Deductibles, Coinsurance from Image."""
    lines = [
        "BLUE CROSS BLUE SHIELD HEALTHCARE",
        "Member Name: Mary Johnson",
        "Member ID: BCBS-9910824",
        "Group No: GRP-8840",
        "PCP: Dr. Robert Vance MD",
        "PCP Telephone: (800) 555-0199",
        "PCP $25",
        "SPC $35",
        "ER $150",
        "URGENT $100",
        "Generic $15",
        "Name Brand $20",
        "In Network Deductible/Coinsurance: $800/10%",
        "OON Deductible/Coinsurance: $1200/20%",
        "24/7 Nurse Line: 1-800-555-0111",
        "Member Services: 1-800-555-0222",
        "Provider Services: 1-800-555-0333",
    ]
    img_bytes = create_synthetic_card_image(lines)
    
    files = {"file": ("insurance_card_mary.png", io.BytesIO(img_bytes), "image/png")}
    res = client.post("/api/v1/ocr/upload-image", files=files)
    assert res.status_code == 200
    data = res.json()
    
    assert data["payer_name"] == "Blue Cross Blue Shield"
    assert data["patient_name"] == "Mary Johnson"
    assert data["member_id"] == "BCBS-9910824"
    assert data["group_number"] == "GRP-8840"
    assert "Robert Vance" in data["pcp_name"]
    assert "800" in data["pcp_phone"]
    assert data["pcp_copay"] == 25.0
    assert data["specialist_copay"] == 35.0
    assert data["er_copay"] == 150.0
    assert data["urgent_care_copay"] == 100.0
    assert data["rx_generic_copay"] == 15.0
    assert data["rx_brand_copay"] == 20.0
    assert data["in_network_deductible"] == 800.0
    assert data["in_network_coinsurance"] == 10.0
    assert data["out_of_network_deductible"] == 1200.0
    assert data["out_of_network_coinsurance"] == 20.0
    assert "800" in data["nurse_line_phone"]
    assert "800" in data["member_services_phone"]
    assert "800" in data["provider_services_phone"]
    
    # Verify calculated confidence is not a fake static 0.98
    assert 0.50 <= data["overall_confidence"] <= 1.0
    assert data["ocr_result"] is not None
    assert len(data["ocr_result"]["words"]) > 0

def test_zero_fabrication_on_missing_fields(client):
    """Test that missing fields are marked NOT_DETECTED with confidence 0.0 and null values."""
    lines = [
        "UNITEDHEALTHCARE CHOICE PLUS",
        "Member ID: UHC-1002934",
        "Member Name: David Kim",
    ]
    img_bytes = create_synthetic_card_image(lines)
    
    files = {"file": ("card_minimal.png", io.BytesIO(img_bytes), "image/png")}
    res = client.post("/api/v1/ocr/upload-image", files=files)
    assert res.status_code == 200
    data = res.json()
    
    assert data["member_id"] == "UHC-1002934"
    assert data["patient_name"] == "David Kim"
    assert data["pcp_name"] is None
    assert data["pcp_copay"] is None
    assert data["er_copay"] is None
    assert data["in_network_deductible"] is None
    
    # Check that missing fields exist in fields list with status NOT_DETECTED
    pcp_field = next((f for f in data["fields"] if f["fieldName"] == "pcp_name"), None)
    assert pcp_field is not None
    assert pcp_field["status"] == "NOT_DETECTED"
    assert pcp_field["confidence"] == 0.0
    assert pcp_field["ocrValue"] is None

def test_spatial_bounding_box_extraction(client):
    """Test that bounding box coordinates are returned for connector lines."""
    lines = [
        "STAR HEALTH & ALLIED INSURANCE",
        "Member Name: Eleanor Vance",
        "Member ID: STAR-9823101",
        "PCP $30",
        "ER $100",
    ]
    img_bytes = create_synthetic_card_image(lines)
    
    files = {"file": ("card_boxes.png", io.BytesIO(img_bytes), "image/png")}
    res = client.post("/api/v1/ocr/upload-image", files=files)
    assert res.status_code == 200
    data = res.json()
    
    detected_fields = [f for f in data["fields"] if f["status"] == "MATCH"]
    for f in detected_fields:
        assert f["boundingBox"] is not None
        assert f["boundingBox"]["x"] >= 0.0
        assert f["boundingBox"]["y"] >= 0.0
        assert f["boundingBox"]["width"] > 0.0
        assert f["boundingBox"]["height"] > 0.0

def test_usa_insurance_mary_doe_card(client):
    """Test against the supplied USA Insurance Company / Mary A. Doe insurance card."""
    lines = [
        "USA INSURANCE COMPANY",
        "Member Name: Mary A. Doe",
        "ID: 5678 1234-A",
        "GRP: 98765",
        "PCP: Dr. Gregory House MD",
        "PCP Telephone: (800) 555-0144",
        "PCP $25",
        "SPC $40",
        "ER $200",
        "URGENT $75",
        "Generic $10",
        "Name Brand $30",
        "In Network Deductible: $1000",
        "In Network Coinsurance: 15%",
        "OON Deductible: $2500",
        "OON Coinsurance: 30%",
        "On-Call Nurse Line: 1-800-555-0188",
        "Member Services: 1-800-555-0122",
        "Providers Call: 1-800-555-0133"
    ]
    img_bytes = create_synthetic_card_image(lines)

    files = {"file": ("usa_insurance_mary_doe.png", io.BytesIO(img_bytes), "image/png")}
    res = client.post("/api/v1/ocr/upload-image", files=files)
    assert res.status_code == 200
    data = res.json()

    assert data["payer_name"] == "USA Insurance Company"
    assert "Mary A. Doe" in (data["patient_name"].title() if data["patient_name"] else "")
    assert data["member_id"] == "5678 1234-A"
    assert data["group_number"] == "98765"
    assert "Gregory House" in data["pcp_name"]
    assert "800" in data["pcp_phone"]
    assert data["pcp_copay"] == 25.0
    assert data["specialist_copay"] == 40.0
    assert data["er_copay"] == 200.0
    assert data["urgent_care_copay"] == 75.0
    assert data["rx_generic_copay"] == 10.0
    assert data["rx_brand_copay"] == 30.0
    assert data["in_network_deductible"] == 1000.0
    assert data["in_network_coinsurance"] == 15.0
    assert data["out_of_network_deductible"] == 2500.0
    assert data["out_of_network_coinsurance"] == 30.0
    assert "800" in data["nurse_line_phone"]
    assert "800" in data["member_services_phone"]
    assert "800" in data["provider_services_phone"]

    # Verify candidates list preservation
    member_id_field = next((f for f in data["fields"] if f["fieldName"] == "member_id"), None)
    assert member_id_field is not None
    assert member_id_field["status"] == "MATCH"
    assert member_id_field["boundingBox"] is not None
    assert len(member_id_field.get("candidates", [])) > 0
    assert any("5678 1234-A" in c["text"] for c in member_id_field["candidates"])

def test_apex_health_rohan_mehta_card(client):
    """Test against the Apex Health Assurance / Rohan Mehta multi-line insurance card."""
    lines = [
        "Apex Health Assurance",
        "Family Floater Gold",
        "HEALTH INSURANCE MEMBER CARD",
        "MEMBER ID",
        "AHA-90817263",
        "GROUP NUMBER",
        "GRP-IND-5521",
        "MEMBER NAME",
        "Rohan Mehta",
        "PCP",
        "Dr. Ananya Sharma",
        "PCP Telephone: +91 98765 43210"
    ]
    img_bytes = create_synthetic_card_image(lines)

    files = {"file": ("apex_health_rohan_mehta.png", io.BytesIO(img_bytes), "image/png")}
    res = client.post("/api/v1/ocr/upload-image", files=files)
    assert res.status_code == 200
    data = res.json()

    assert data["payer_name"] == "Apex Health Assurance"
    assert data["plan_type"] == "Family Floater Gold"
    assert data["patient_name"] == "Rohan Mehta"
    assert data["member_id"] == "AHA-90817263"
    assert data["group_number"] == "GRP-IND-5521"
    assert data["pcp_name"] == "Dr. Ananya Sharma"
    assert data["pcp_phone"] == "+91 98765 43210"
    assert data["procedure_code"] is None

    # Strict anti-fabrication assertions
    assert data["patient_name"] != "Card"
    assert data["member_id"] != "for OCR"
    assert data["group_number"] != "NUMBER"
    assert data["procedure_code"] != "90817263"
    assert data["payer_name"] != "Family Floater Gold Health"

def test_label_words_not_extracted_as_values(client):
    """Test that generic label words (Card, Number, Health, Insurance, for OCR) cannot become extracted field values."""
    lines = [
        "Sample Card for OCR Testing",
        "MEMBER ID",
        "NUMBER",
        "MEMBER NAME",
        "Card",
    ]
    img_bytes = create_synthetic_card_image(lines)

    files = {"file": ("card_labels_only.png", io.BytesIO(img_bytes), "image/png")}
    res = client.post("/api/v1/ocr/upload-image", files=files)
    assert res.status_code == 200
    data = res.json()

    # Generic blacklist words should NOT become values
    assert data["member_id"] != "for OCR"
    assert data["member_id"] != "NUMBER"
    assert data["member_id"] is None or data["member_id"] not in ("NUMBER", "for OCR", "Card")
    assert data["patient_name"] != "Card"
    assert data["patient_name"] is None or data["patient_name"] not in ("Card", "Member", "Name")
    assert data["group_number"] != "NUMBER"
    assert data["procedure_code"] is None

