from pydantic import BaseModel, Field
from typing import Optional, List, Literal

class ClaimInput(BaseModel):
    claimId: Optional[str] = Field(None, description="Optional custom claim identifier")
    memberName: Optional[str] = Field(None, description="Patient/Member full name")
    claimAmount: float = Field(..., gt=0, description="Dollar amount of claim")
    claimType: str = Field(..., description="Inpatient, Outpatient, Specialist, Prescription")
    provider: Optional[str] = Field("General Hospital System", description="Healthcare provider name")
    submissionDate: Optional[str] = Field(None, description="Date of claim submission")
    age: Optional[int] = Field(45, ge=0, le=125, description="Patient age")
    gender: Optional[str] = Field("Female", description="Patient gender")
    policyType: Optional[str] = Field("Commercial PPO", description="Insurance plan type")
    payerName: Optional[str] = Field("Commercial PPO", description="Insurance payer name")
    coverageDuration: Optional[int] = Field(24, ge=0, description="Active policy duration in months")
    previousClaims: Optional[int] = Field(1, ge=0, description="Count of past submitted claims")
    diagnosis: Optional[str] = Field("M54.5 - Low back pain", description="ICD-10 primary diagnosis")
    procedure: Optional[str] = Field("72148 - MRI Lumbar Spine", description="CPT procedure code/name")
    treatmentCost: Optional[float] = Field(0.0, description="Treatment fee")
    hospitalizationDuration: Optional[int] = Field(0, ge=0, description="Hospital stay in days")
    accountId: Optional[str] = Field("acc-apollo", description="Associated tenant/account identifier")

class FeatureImportanceItem(BaseModel):
    name: str
    value: float

class PredictionResult(BaseModel):
    prediction: Literal["Approve", "Deny"]
    confidence: float = Field(..., ge=0.0, le=1.0)
    riskScore: int = Field(..., ge=0, le=100)
    riskLevel: Literal["Low", "Medium", "High"]
    featureImportance: List[FeatureImportanceItem] = []
    explanation: str
    recommendation: str

class ClaimResponse(BaseModel):
    id: str
    member: str
    amount: float
    type: str
    risk: Literal["Low", "Medium", "High"]
    prediction: Literal["Approve", "Deny"]
    status: Literal["Approved", "Denied", "Pending", "Under Review"]
    submittedAt: Optional[str] = None
    provider: Optional[str] = None
    diagnosis: Optional[str] = None
    procedure: Optional[str] = None
    riskScore: Optional[int] = None
    confidence: Optional[float] = None
    explanation: Optional[str] = None
    recommendation: Optional[str] = None
    accountId: Optional[str] = None
    payerName: Optional[str] = None
    lastAnalyzedAt: Optional[str] = None

    class Config:
        from_attributes = True

class ClaimListResponse(BaseModel):
    total: int
    claims: List[ClaimResponse]
