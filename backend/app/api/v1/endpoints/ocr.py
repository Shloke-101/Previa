from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.schemas.ocr import (
    OcrExtractionRequest,
    OcrExtractionResponse,
    FieldValidationResponse,
    OcrSyncRequest,
    OcrSyncResponse
)
from app.services.ocr_service import extract_insurance_card_data, sync_ocr_to_master

router = APIRouter()

@router.get("/extract", response_model=OcrExtractionResponse, summary="Extract insurance card fields with optical bounding boxes")
def extract_ocr_get(sample_id: str = Query("sample-bcbs")):
    """Extracts structured fields, optical confidence ratings, and bounding coordinates."""
    return extract_insurance_card_data(sample_id)

@router.post("/extract", response_model=OcrExtractionResponse, summary="Extract fields from uploaded insurance card")
def extract_ocr_post(req: OcrExtractionRequest):
    """Processes uploaded card scan image / preset and returns structured field extraction."""
    sample_id = req.sample_id or "sample-bcbs"
    return extract_insurance_card_data(sample_id)

@router.post("/validate", response_model=FieldValidationResponse, summary="Validate extracted card data against hospital EHR")
def validate_ocr_fields(req: OcrExtractionRequest):
    """Compares card fields against hospital EHR record and returns field matching statuses."""
    data = extract_insurance_card_data(req.sample_id or "sample-bcbs")
    mismatches = [f.fieldName for f in data.fields if f.status == "MISMATCH"]
    
    return FieldValidationResponse(
        all_match=len(mismatches) == 0,
        mismatch_count=len(mismatches),
        critical_discrepancies=mismatches,
        fields=data.fields
    )

@router.post("/sync", response_model=OcrSyncResponse, summary="1-Click synchronize OCR card fields into hospital record")
def sync_ocr_fields(req: OcrSyncRequest, db: Session = Depends(get_db)):
    """Synchronizes verified physical card data into patient master index, eliminating claim rejection risks."""
    synced = sync_ocr_to_master(db, req.sample_id, req.patient_id)
    return OcrSyncResponse(
        success=True,
        patient_id=req.patient_id,
        synchronized_fields=synced,
        message=f"Successfully synchronized {len(synced)} fields into patient master record."
    )
