from pydantic import BaseModel
from typing import Optional, List, Literal

class ExtractedBoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float
    label: str

class ExtractedFieldItem(BaseModel):
    fieldName: str
    label: str
    ocrValue: str
    hospitalValue: str
    status: Literal["MATCH", "PARTIAL_MATCH", "MISMATCH"]
    confidence: float
    box: Optional[ExtractedBoundingBox] = None

class OcrExtractionRequest(BaseModel):
    sample_id: Optional[str] = "sample-bcbs"
    image_base64: Optional[str] = None
    patient_id: Optional[str] = "PAT-1082"

class OcrExtractionResponse(BaseModel):
    sample_id: str
    payer_name: str
    plan_type: str
    patient_name: str
    member_id: str
    group_number: str
    dob: str
    rx_bin: str
    rx_pcn: str
    card_image_color: str
    overall_confidence: float
    fields: List[ExtractedFieldItem]

class FieldValidationResponse(BaseModel):
    all_match: bool
    mismatch_count: int
    critical_discrepancies: List[str]
    fields: List[ExtractedFieldItem]

class OcrSyncRequest(BaseModel):
    sample_id: str
    patient_id: str

class OcrSyncResponse(BaseModel):
    success: bool
    patient_id: str
    synchronized_fields: List[str]
    message: str
