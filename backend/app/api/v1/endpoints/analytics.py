from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.analytics import AnalyticsDataResponse, TimePoint, RiskPoint
from app.services.rca_service import get_denial_rca_categories, get_payer_vulnerability_stats

router = APIRouter()

@router.get("", response_model=AnalyticsDataResponse, summary="Get comprehensive denial analytics and trends")
def get_analytics(db: Session = Depends(get_db)):
    """Returns analytics on claims over time, risk distributions, CARC categories, and payer statistics."""
    categories = get_denial_rca_categories(db)
    payer_stats = get_payer_vulnerability_stats()

    claims_over_time = [
        TimePoint(label="Jan 01", claims=820, approved=620, denied=200),
        TimePoint(label="Jan 08", claims=1050, approved=810, denied=240),
        TimePoint(label="Jan 15", claims=920, approved=720, denied=200),
        TimePoint(label="Jan 22", claims=1280, approved=1010, denied=270),
        TimePoint(label="Jan 29", claims=1170, approved=960, denied=210),
        TimePoint(label="Feb 05", claims=1420, approved=1150, denied=270),
    ]

    risk_distribution = [
        RiskPoint(name="Low risk", value=62, fill="#20b486"),
        RiskPoint(name="Medium risk", value=25, fill="#f4b740"),
        RiskPoint(name="High risk", value=13, fill="#e56b6f"),
    ]

    return AnalyticsDataResponse(
        claimsOverTime=claims_over_time,
        riskDistribution=risk_distribution,
        categories=categories,
        payerStats=payer_stats
    )

@router.get("/rca-report", response_class=PlainTextResponse, summary="Export RCA report as CSV")
def export_rca_report_csv(db: Session = Depends(get_db)):
    """Exports root-cause denial analytics breakdown in CSV format."""
    categories = get_denial_rca_categories(db)
    lines = ["CARC_Code,Category,Denial_Count,Preventable_Percentage,Dollar_Impact,Recommended_Upstream_Shift"]
    for c in categories:
        lines.append(f"{c.code},\"{c.category}\",{c.count},{c.preventablePercentage}%,${c.totalDollarImpact:,.2f},\"Automated 72h Pre-Service Verification Gate\"")
    return "\n".join(lines)
