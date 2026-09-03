from pydantic import BaseModel
from typing import List, Optional

class DashboardStatsResponse(BaseModel):
    totalClaims: int
    approvedClaims: int
    deniedClaims: int
    highRiskClaims: int
    avgProcessingTime: float # in hours
    revenueProtectedMtd: float
    clearanceRatePct: float
    interceptionRatePct: float

class TimePoint(BaseModel):
    label: str
    claims: int
    approved: int
    denied: int

class RiskPoint(BaseModel):
    name: str
    value: int
    fill: Optional[str] = None

class DenialCategoryResponse(BaseModel):
    code: str
    category: str
    count: int
    preventablePercentage: int
    color: str
    totalDollarImpact: float

class PayerStatResponse(BaseModel):
    payerName: str
    denialRate: float
    topDenialReason: str
    avgResolutionDays: int

class AnalyticsDataResponse(BaseModel):
    claimsOverTime: List[TimePoint]
    riskDistribution: List[RiskPoint]
    categories: List[DenialCategoryResponse]
    payerStats: List[PayerStatResponse]

class ModelMetricsResponse(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1: float
    rocAuc: float
    version: str
    predictions: int
    trainingDataSize: str
    lastEvaluated: str
    featureImportance: List[dict]
    confusionMatrix: List[List[int]]
