from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Dict, Any, Union

class ExtractedBoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float
    label: str

class UnifiedOcrWord(BaseModel):
    text: str
    confidence: float = 0.98
    x: float
    y: float
    width: float
    height: float
    page: int = 1

class UnifiedOcrLine(BaseModel):
    text: str
    confidence: float = 0.98
    x: float
    y: float
    width: float
    height: float
    page: int = 1
    words: List[UnifiedOcrWord] = []

class UnifiedOcrResult(BaseModel):
    text: str
    words: List[UnifiedOcrWord] = []
    lines: List[UnifiedOcrLine] = []
    pages: List[Dict[str, Any]] = []
    ocr_confidence: float = 0.95
    engine_used: Optional[str] = "UnifiedOcrEngine"
    preprocessing_steps: Optional[List[str]] = []
    image_dimensions: Optional[List[int]] = None

class FieldCandidate(BaseModel):
    text: str
    confidence: float = 0.0
    boundingBox: Optional[ExtractedBoundingBox] = None
    spatial_score: float = 0.0
    label_matched: Optional[str] = None
    pattern_validity: float = 0.0

class ExtractedFieldItem(BaseModel):
    fieldName: str
    label: str
    ocrValue: Optional[str] = None
    value: Optional[str] = None
    hospitalValue: Optional[str] = None
    normalizedValue: Optional[str] = None
    confidence: float = 0.0
    status: Literal["MATCH", "PARTIAL_MATCH", "MISMATCH", "NEW", "NOT_DETECTED", "REVIEW_REQUIRED"] = "MATCH"
    pageNumber: Optional[int] = 1
    boundingBox: Optional[ExtractedBoundingBox] = None
    box: Optional[ExtractedBoundingBox] = None
    source: Optional[str] = "OCR"
    candidates: Optional[List[FieldCandidate]] = []

class IdentityResolutionInfo(BaseModel):
    status: str = "MATCH" # MATCH, NAME_VARIANCE_CONFIRMED, MISMATCH, CRITICAL_CONFLICT, NOT_DETECTED
    confidence: float = 0.98
    name_match: bool = True
    dob_match: bool = True
    member_id_match: bool = True
    safe_to_auto_resolve: bool = True
    payer_submission_format: Optional[str] = None
    explanation: str = "Identity corroborated against hospital master EHR record."

class PreSubmissionCheckInfo(BaseModel):
    claim_eligible: bool = True
    status: str = "PROTECTED" # PROTECTED, REVIEW_REQUIRED, BLOCKED
    passed_checks: List[str] = []
    blocking_reasons: List[str] = []

class OcrExtractionRequest(BaseModel):
    sample_id: Optional[str] = "sample-bcbs"
    image_base64: Optional[str] = None
    patient_id: Optional[str] = "PAT-1082"

class OcrExtractionResponse(BaseModel):
    sample_id: str
    payer_name: Optional[str] = None
    plan_type: Optional[str] = None
    patient_name: Optional[str] = None
    member_id: Optional[str] = None
    group_number: Optional[str] = None
    
    # 20 required core healthcare fields
    pcp_name: Optional[str] = None
    pcp_phone: Optional[str] = None
    pcp_copay: Optional[float] = None
    specialist_copay: Optional[float] = None
    er_copay: Optional[float] = None
    urgent_care_copay: Optional[float] = None
    rx_generic_copay: Optional[float] = None
    rx_brand_copay: Optional[float] = None
    in_network_deductible: Optional[float] = None
    in_network_coinsurance: Optional[float] = None
    out_of_network_deductible: Optional[float] = None
    out_of_network_coinsurance: Optional[float] = None
    nurse_line_phone: Optional[str] = None
    member_services_phone: Optional[str] = None
    provider_services_phone: Optional[str] = None

    # Auxiliary fields
    dob: Optional[str] = None
    rx_bin: Optional[str] = None
    rx_pcn: Optional[str] = None
    card_image_color: Optional[str] = "linear-gradient(135deg, #065f46 0%, #047857 100%)"
    overall_confidence: float
    fields: List[ExtractedFieldItem]
    ocr_result: Optional[UnifiedOcrResult] = None
    document_type: Optional[str] = "INSURANCE_CARD"
    type_confidence: Optional[float] = 0.98
    quality_score: Optional[float] = 0.95
    is_expired: Optional[bool] = False
    is_duplicate: Optional[bool] = False
    effective_date: Optional[str] = None
    expiration_date: Optional[str] = None
    auth_number: Optional[str] = None
    procedure_code: Optional[str] = None
    billed_amount: Optional[float] = None
    patient_responsibility: Optional[float] = None
    summary_text: Optional[str] = None
    raw_text: Optional[str] = None
    identity_resolution: Optional[IdentityResolutionInfo] = None
    pre_submission_guard: Optional[PreSubmissionCheckInfo] = None

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

class DocumentReviewRequest(BaseModel):
    action: Literal["ACCEPT", "EDIT", "REJECT", "BLOCK_CLAIM", "ESCALATE"]
    field_overrides: Optional[Dict[str, str]] = None
    operator_name: Optional[str] = "Jordan Davis"
    notes: Optional[str] = None

class DocumentListItem(BaseModel):
    id: str
    filename: str
    document_type: str
    patient_name: Optional[str] = None
    payer_name: Optional[str] = None
    status: str
    confidence: float
    quality_score: float
    created_at: str
    is_expired: bool = False
    is_duplicate: bool = False

class DocumentAnalyticsResponse(BaseModel):
    documents_uploaded: int
    documents_processed: int
    ocr_success_rate: float
    extraction_accuracy: float
    fields_extracted: int
    fields_requiring_review: int
    identity_mismatches_prevented: int
    claims_protected_from_denial: int
