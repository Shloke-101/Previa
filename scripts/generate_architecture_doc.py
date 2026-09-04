import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    """Sets background color of a table cell."""
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets internal padding for a table cell."""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def add_styled_heading(doc, text, level):
    p = doc.add_heading(text, level=level)
    p.paragraph_format.space_before = Pt(14 if level == 1 else (10 if level == 2 else 6))
    p.paragraph_format.space_after = Pt(4)
    run = p.runs[0]
    if level == 1:
        run.font.size = Pt(18)
        run.font.bold = True
        run.font.color.rgb = RGBColor(30, 58, 138) # Deep Navy
    elif level == 2:
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = RGBColor(37, 99, 235) # Royal Blue
    elif level == 3:
        run.font.size = Pt(11.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(15, 23, 42) # Slate Dark
    return p

def add_callout_box(doc, title, text, bg_hex="F8FAFC", border_hex="2563EB"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{border_hex}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    
    r_title = p.add_run(f"📌 {title}\n")
    r_title.bold = True
    r_title.font.size = Pt(10.5)
    r_title.font.color.rgb = RGBColor(30, 58, 138)
    
    r_text = p.add_run(text)
    r_text.font.size = Pt(9.5)
    r_text.font.color.rgb = RGBColor(51, 65, 85)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def format_table_headers(table, headers, col_widths, bg_hex="1E3A8A"):
    hdr_cells = table.rows[0].cells
    for idx, header_text in enumerate(headers):
        hdr_cells[idx].text = header_text
        hdr_cells[idx].width = Inches(col_widths[idx])
        set_cell_background(hdr_cells[idx], bg_hex)
        set_cell_margins(hdr_cells[idx], top=100, bottom=100, left=120, right=120)
        p = hdr_cells[idx].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.bold = True
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(255, 255, 255)

def style_data_row(row, values, col_widths, is_even=False):
    bg_hex = "F8FAFC" if is_even else "FFFFFF"
    for idx, val in enumerate(values):
        cell = row.cells[idx]
        cell.text = str(val)
        cell.width = Inches(col_widths[idx])
        set_cell_background(cell, bg_hex)
        set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.size = Pt(9.0)
            run.font.color.rgb = RGBColor(30, 41, 59)

def generate_document(output_path: str):
    doc = Document()
    
    # Page setup - Margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        
        # Header / Footer setup
        header = section.header
        p_hdr = header.paragraphs[0]
        p_hdr.text = "Previa (PVFC) System Architecture & Feature Deep Dive | Confidential Technical Specification"
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_hdr.runs[0].font.size = Pt(8)
        p_hdr.runs[0].font.color.rgb = RGBColor(148, 163, 184)
        
        footer = section.footer
        p_ftr = footer.paragraphs[0]
        p_ftr.text = "Previa: Pre-Visit Financial Clearance & Closed-Loop Self-Healing RCM Platform — Page "
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_ftr.runs[0].font.size = Pt(8)
        p_ftr.runs[0].font.color.rgb = RGBColor(148, 163, 184)

    # -------------------------------------------------------------------------
    # DOCUMENT COVER / TITLE BLOCK
    # -------------------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(24)
    title_p.paragraph_format.space_after = Pt(4)
    r_title = title_p.add_run("PREVIA (PVFC)")
    r_title.bold = True
    r_title.font.size = Pt(28)
    r_title.font.color.rgb = RGBColor(30, 58, 138)
    
    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(16)
    r_sub = sub_p.add_run("Pre-Visit Financial Clearance, Real-Time Eligibility, Multi-Engine OCR & Self-Healing Denial Prevention System")
    r_sub.font.size = Pt(13)
    r_sub.font.color.rgb = RGBColor(71, 85, 105)
    
    # Metadata Box
    meta_table = doc.add_table(rows=2, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_widths = [3.25, 3.25]
    
    meta_table.rows[0].cells[0].text = "Document Version: 1.0 (Production Architecture)"
    meta_table.rows[0].cells[1].text = "Architecture Tier: Enterprise Healthcare Monorepo"
    meta_table.rows[1].cells[0].text = "Primary Backend: FastAPI / Python 3.11+ / SQLAlchemy"
    meta_table.rows[1].cells[1].text = "Primary Frontend: Next.js 16+ Turbopack / Vite 6 SPA"
    
    for row in meta_table.rows:
        for idx, cell in enumerate(row.cells):
            cell.width = Inches(meta_widths[idx])
            set_cell_background(cell, "F1F5F9")
            set_cell_margins(cell, top=60, bottom=60, left=100, right=100)
            cell.paragraphs[0].runs[0].font.size = Pt(8.5)
            cell.paragraphs[0].runs[0].font.color.rgb = RGBColor(51, 65, 85)
            cell.paragraphs[0].runs[0].font.bold = True
            
    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # -------------------------------------------------------------------------
    # SECTION 1: EXECUTIVE SUMMARY & ARCHITECTURAL PHILOSOPHY
    # -------------------------------------------------------------------------
    add_styled_heading(doc, "1. Executive Summary & Architectural Philosophy", level=1)
    
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "In traditional healthcare Revenue Cycle Management (RCM), provider organizations operate in a reactive posture. "
        "Claims are generated post-service, transmitted via EDI 837 batches, and adjudicated weeks later by commercial or government payers. "
        "Industry data demonstrates that over 70% of claim denials—such as missing prior authorizations (CARC CO-197), terminated policy coverage (CO-27), "
        "or demographic/member ID mismatches (CO-16)—stem from preventable breakdowns during pre-registration and intake. "
        "By the time an electronic remittance advice (ERA 835) arrives with a denial, the cost of rework, appeals, and write-offs averages $118 per claim."
    )
    
    add_callout_box(
        doc,
        "The Previa Core Philosophy",
        "\"Do not wait for an eligibility problem or document variance to become a claim denial 45 days after service. "
        "Detect, resolve, and autonomously self-heal the breakdown upstream during the pre-visit window.\"",
        bg_hex="EFF6FF",
        border_hex="1D4ED8"
    )
    
    p2 = doc.add_paragraph()
    p2.paragraph_format.line_spacing = 1.15
    p2.add_run(
        "Previa (PVFC) is built on three core pillars of operational excellence:\n"
        "1. Shift-Left Clearance: Real-time 270/271 electronic eligibility sweeps, coverage verifications, and prior authorization checks executed 72 hours and 24 hours prior to appointment time.\n"
        "2. Multi-Engine Document Ingestion: High-accuracy OCR extraction of insurance cards, Explanation of Benefits (EOB), and prior auth approvals with geometric layout analysis and automatic person-code suffix reconciliation.\n"
        "3. Closed-Loop Self-Healing RCM: Automated error clustering, payer rule drift detection, and pre-submission guards that fix root causes before claim generation with cryptographic audit trails and 1-click rollback."
    )

    # -------------------------------------------------------------------------
    # SECTION 2: MULTI-ENGINE OCR & INTELLIGENT EXTRACTION PIPELINE
    # -------------------------------------------------------------------------
    add_styled_heading(doc, "2. Multi-Engine Document OCR & Intelligent Extraction Pipeline", level=1)
    
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "The OCR and document intelligence subsystem (app/services/ocr_service.py) handles arbitrary unstructured and semi-structured documents, "
        "including two-sided insurance cards, EOB remittance notices, and Prior Authorization determination letters."
    )
    
    add_styled_heading(doc, "2.1 Hybrid Optical & Vector Text Extraction Architecture", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "To achieve industry-leading extraction fidelity across clean digital PDFs, scanned faxes, and skewed mobile camera photos, "
        "Previa executes a layered, multi-engine extraction cascade:"
    )
    
    ocr_table = doc.add_table(rows=1, cols=4)
    ocr_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    col_w = [1.5, 1.7, 1.8, 1.5]
    format_table_headers(ocr_table, ["Extraction Engine", "Processing Method", "Key Capabilities", "Target Artifacts"], col_w)
    
    rows_data = [
        ("PyMuPDF (fitz)", "Direct vector stream extraction & word bbox rendering", "Sub-millisecond text extraction, exact spatial bounding coordinates", "Digital PDF Cards, EOB PDFs, Auth Letters"),
        ("Tesseract OCR (v5.x)", "LSTM neural optical character recognition", "Multi-language character recognition, noise-resilient text detection", "Scanned physical cards, rasterized faxes, photo uploads"),
        ("Pillow / OpenCV Preprocessing", "Grayscale, adaptive thresholding, contrast normalization", "Deskewing, shadow removal, morphological closing of card borders", "Noisy camera photos, low-contrast insurance cards"),
        ("Adaptive Regex Parser", "Layout-aware multi-line regex & fuzzy alias matching", "Resolves multi-word labels ('MEMBER ID', 'GROUP #', 'CO-PAY')", "Extracted token stream from all OCR engines")
    ]
    
    for idx, (eng, meth, cap, art) in enumerate(rows_data):
        row = ocr_table.add_row()
        style_data_row(row, [eng, meth, cap, art], col_w, is_even=(idx % 2 == 1))
        
    doc.add_paragraph().paragraph_format.space_after = Pt(8)
    
    add_styled_heading(doc, "2.2 Field-Level Coordinate & Layout Analysis", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "Standard OCR tools return flat string blobs that lose structural context. Previa introduces UnifiedOcrResult containing unified lines and words "
        "with normalized bounding box geometry [ymin, xmin, ymax, xmax] relative to page dimensions. "
        "When identifying key-value pairs (e.g. 'MEMBER ID: BCBS-9823101-01'), the engine conducts a 3-tier spatial analysis:\n"
        "• Tier 1 (Inline Remainder): Inspects trailing characters immediately following the matched label prefix on the identical line.\n"
        "• Tier 2 (Next Line Lookahead): Evaluates the immediately adjacent line located directly below the label within an allowed vertical delta (dy <= 0.08).\n"
        "• Tier 3 (Same-Y Horizontal Bounding): Scans rightward bounding boxes possessing overlapping vertical ranges (|ymin_lbl - ymin_val| <= 0.03)."
    )
    
    add_styled_heading(doc, "2.3 Automatic Person-Code Suffix Synchronization", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "A notorious driver of CARC CO-16 denials is member ID person-code suffix omission. Hospital EHR master indices frequently record base subscriber IDs "
        "(e.g., 'UHC-7712399'), while the physical card carried by a dependent explicitly appends a person code suffix (e.g., '-01' for subscriber, '-02' for spouse). "
        "Previa's OCR pipeline detects trailing suffix patterns (e.g., re.search(r'[-/](0[1-9]|[1-9])$', extracted_id)) and automatically triggers an "
        "Identity Resolution audit event, enabling 1-click synchronization into the pre-service clearance stream without destructive database writes."
    )

    # -------------------------------------------------------------------------
    # SECTION 3: REAL-TIME CLAIM EVALUATION & CLEARANCE ENGINE
    # -------------------------------------------------------------------------
    add_styled_heading(doc, "3. Real-Time Eligibility & Claim Evaluation Engine", level=1)
    
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "The Claim Evaluation & Financial Clearance Engine (app/services/clearance_service.py & ml_service.py) transforms disparate eligibility records, "
        "clinical CPT procedure codes, and payer coverage rules into deterministic financial assessments and actionable clearance designations."
    )
    
    add_styled_heading(doc, "3.1 Real-Time 270/271 Eligibility & Benefit Verification", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "The system executes electronic benefit inquiry simulations modeling HIPAA EDI 270/271 transactions against major payer gateways "
        "(Blue Cross Blue Shield, UnitedHealthcare, Aetna, Cigna, Humana, Star Health). The engine evaluates:\n"
        "• Policy Temporal Status: Verifies that appointment_date falls strictly within [effective_date, expiration_date].\n"
        "• Network Participation: Determines whether the scheduled rendering physician and facility are contracted in-network.\n"
        "• Procedural Coverage & Medical Necessity: Validates whether scheduled CPT codes (e.g. 72148 MRI Lumbar Spine, 27447 Knee Arthroplasty) are standard covered benefits."
    )
    
    add_styled_heading(doc, "3.2 The 72-Hour Mandatory Prior Authorization Gate", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "High-tech imaging, specialized surgeries, and biological therapies mandate prior authorization (PA). "
        "Previa's clearance engine maintains deterministic payer prior auth tables. If an encounter requires PA and no active authorization number is recorded "
        "within 72 hours of the appointment, the clearance state is strictly locked to HIGH_RISK, generating an automated provider escalation task."
    )
    
    add_styled_heading(doc, "3.3 Deterministic Patient Responsibility Mathematical Formula", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "Patient out-of-pocket responsibility is calculated using pure mathematical determinism to ensure 100% auditability and compliance with No Surprises Act regulations:"
    )
    
    add_callout_box(
        doc,
        "Patient Responsibility Calculation Formula",
        "Estimated Patient Responsibility = Copay + min(Remaining Deductible, Allowable Service Cost) + "
        "max(0, Allowable Service Cost - Remaining Deductible) * Coinsurance Percentage\n\n"
        "Example (MRI Lumbar Spine - $1,450.00 Cost, $350.00 Remaining Deductible, 20% Coinsurance, $0 Copay):\n"
        "• Deductible Portion: min($350.00, $1,450.00) = $350.00\n"
        "• Coinsurance Portion: ($1,450.00 - $350.00) * 0.20 = $1,100.00 * 0.20 = $220.00\n"
        "• Total Estimated Out-of-Pocket = $0.00 + $350.00 + $220.00 = $570.00",
        bg_hex="F0FDF4",
        border_hex="16A34A"
    )

    add_styled_heading(doc, "3.4 Explainable Weighted Risk Scoring Model (0–100)", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "Unlike black-box neural networks that cannot be audited by hospital billing directors, Previa calculates risk scores using an explainable, "
        "additive multi-factor framework where every point is attributed to a transparent clinical or administrative root cause:"
    )
    
    risk_table = doc.add_table(rows=1, cols=4)
    risk_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    r_col_w = [1.8, 1.0, 1.8, 1.9]
    format_table_headers(risk_table, ["Risk Factor", "Score Weight", "Severity Level", "Operational Impact / Root Cause"], r_col_w)
    
    risk_data = [
        ("Policy Terminated / Inactive", "+50 Points", "CRITICAL", "Guaranteed CO-27 claim rejection if submitted"),
        ("Missing Mandatory Prior Auth", "+40 Points", "CRITICAL", "Guaranteed CO-197 non-covered service denial"),
        ("Member ID / Suffix Mismatch", "+25 Points", "HIGH", "Causes CO-16 electronic clearinghouse rejection"),
        ("Out-of-Network Provider Tier", "+20 Points", "MEDIUM", "High patient out-of-pocket balance or balance billing risk"),
        ("Policy Expiring in < 30 Days", "+10 Points", "LOW", "Risk of retroactive termination before billing cycle"),
        ("Low Financial Responsibility Ratio", "-10 Points", "FAVORABLE", "Active in-network coverage with confirmed pre-auth")
    ]
    
    for idx, (fac, wt, sev, imp) in enumerate(risk_data):
        row = risk_table.add_row()
        style_data_row(row, [fac, wt, sev, imp], r_col_w, is_even=(idx % 2 == 1))
        
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_styled_heading(doc, "3.5 Canonical Clearance Status Triaging", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "Based on risk score and verification blockers, encounters are categorized into three canonical operational states:\n"
        "• CLEARED (Score 0–39): All verification gates passed. Patient is fast-tracked for seamless arrival and check-in.\n"
        "• NEEDS_ACTION (Score 40–69): Patient is eligible, but actionable administrative tasks exist (e.g., 1-click OCR suffix sync, copay collection).\n"
        "• HIGH_RISK (Score 70–100): Critical blocker detected (terminated insurance, missing prior authorization). Fast check-in blocked; escalated to pre-service RCM."
    )

    # -------------------------------------------------------------------------
    # SECTION 4: CLOSED-LOOP SELF-HEALING RCM & DENIAL PREVENTION
    # -------------------------------------------------------------------------
    add_styled_heading(doc, "4. Closed-Loop Self-Healing RCM & Denial Prevention Engine", level=1)
    
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "The RCM Self-Healing Subsystem (app/services/self_healing/) represents Previa's most transformative architectural capability. "
        "Rather than repeatedly flagging the same denial errors to human operators, the system identifies systematic patterns across claims, "
        "deploys automated upstream normalization rules, and verifies claim integrity prior to clearinghouse submission."
    )
    
    add_styled_heading(doc, "4.1 Error Clustering & Problem Hotspot Aggregation", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "The Error Clustering Engine (error_clustering.py) continuously analyzes historical and pending claims. "
        "It aggregates recurring rejections into high-impact Problem Clusters based on Claim Adjustment Reason Codes (CARC), Remittance Advice Remark Codes (RARC), "
        "and field discrepancies. Priority scores (0–100) are computed dynamically using financial impact, recurrence frequency, and fix preventability."
    )
    
    heal_table = doc.add_table(rows=1, cols=4)
    heal_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    h_col_w = [1.5, 1.4, 1.8, 1.8]
    format_table_headers(heal_table, ["Problem ID & Code", "Category", "Root Cause Analysis", "Self-Healing Automated Action"], h_col_w)
    
    heal_data = [
        ("PROB-ID-260\nERR-ID-NORM", "Patient Identity Mismatch", "Payer EDI mandates abbreviated initials ('S ROY') vs EHR full legal names", "Automated deterministic name normalization on EDI 837 claim stream"),
        ("PROB-AUTH-204\nCO-197", "Authorization Workflow", "High-tech MRI/CT ordered without prior auth gateway check", "Enforce 72-hour pre-service electronic PA gate & alert rendering provider"),
        ("PROB-MOD-149\nERR-MOD-DRIFT", "Payer Modifier Rules", "Payer silently updated Modifier 25 rule on same-day minor procedures", "Auto-update claim validation rule to append Modifier 25 for affected payer"),
        ("PROB-ELIG-95\nCO-27", "Terminated Coverage", "Patients verified at Day 1 lost coverage at month-end prior to Day 28 visit", "Trigger automated 24-hour pre-encounter batch 270 re-verification sweep")
    ]
    
    for idx, (pid, cat, rca, act) in enumerate(heal_data):
        row = heal_table.add_row()
        style_data_row(row, [pid, cat, rca, act], h_col_w, is_even=(idx % 2 == 1))
        
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_styled_heading(doc, "4.2 Payer Rule Drift Detection", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "Health plans regularly update adjudication policies without formal notification to providers. "
        "Previa's Rule Drift Detector (rule_drift_detector.py) identifies statistical spikes in specific denial codes for specific payer-CPT combinations. "
        "When confidence exceeds 95% (e.g., UnitedHealthcare rejecting CPT 29881 without Modifier 25), the engine creates a PayerRuleDriftRecord "
        "and deploys an upstream pre-submission validation guard."
    )

    add_styled_heading(doc, "4.3 Three-Way Decision Engine & Safety Boundary", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "To ensure patient safety and clinical integrity, Previa enforces a strict Deterministic Safety Boundary:\n"
        "1. SAFE_AUTO_FIX (Confidence >= 0.95): Administrative formatting, trailing suffix synchronization, and EDI abbreviation normalization are safely resolved automatically.\n"
        "2. REQUIRES_OPERATOR (Confidence < 0.95 or Clinical): Missing clinical documentation, medical necessity disputes, and prior auth creations are routed to staff worklists.\n"
        "3. BLOCK_SUBMISSION: Encounters with guaranteed termination denials (CO-27) are intercepted and prevented from entering clearinghouse queues."
    )

    add_styled_heading(doc, "4.4 Immutable Audit Trails & 1-Click Rollback", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "Every self-healing operation generates an immutable SelfHealAuditEvent record containing:\n"
        "• Event ID & Timestamp (UTC)\n"
        "• Claim ID and Patient ID\n"
        "• Original Value vs Corrected Value\n"
        "• Rule Used & Machine Learning Confidence Score\n"
        "• Rollback Status ('ACTIVE' vs 'ROLLED_BACK')\n\n"
        "Billing managers can inspect any automated correction in the UI and trigger a 1-Click Rollback, instantly restoring original values and logging the reversal."
    )

    # -------------------------------------------------------------------------
    # SECTION 5: FRONTEND ARCHITECTURE & OPERATIONAL WORKFLOWS
    # -------------------------------------------------------------------------
    add_styled_heading(doc, "5. Frontend Architecture & Operational Workflows", level=1)
    
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "The frontend is engineered as a modern, dual-target interface supporting both Next.js 16+ (App Router with Turbopack) and Vite 6+ SPA mode. "
        "Key operational workflows include:\n"
        "• Multi-Tenant Healthcare Workspaces: Allows seamless switching between hospital profiles (Apex Memorial, Apollo Enterprise, Max Healthcare, Fortis Health) and Clean Slate zero-record intake mode.\n"
        "• Priority Clearance Queues: Real-time worklists grouped by clearance status with instant search, payer filtering, and 1-click OCR field synchronization.\n"
        "• Interactive Patient Dossier: Comprehensive 360-degree patient financial views displaying active insurance cards, eligibility breakdown, auth status, and historical remittance advice.\n"
        "• Denial Analytics & Before/After ROI Dashboards: Dynamic Recharts visualizations quantifying prevented denial dollars, average days in A/R reduction, and automated clean-claim rates."
    )

    # -------------------------------------------------------------------------
    # SECTION 6: TECHNICAL SPECIFICATIONS & SYSTEM DATA MODELS
    # -------------------------------------------------------------------------
    add_styled_heading(doc, "6. Technical Specifications & Canonical Data Models", level=1)
    
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.add_run(
        "Previa enforces 13 validated JSON Schemas located in the contracts/ directory as the single source of truth across all subsystems:"
    )
    
    model_table = doc.add_table(rows=1, cols=3)
    model_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    m_col_w = [1.8, 1.8, 2.9]
    format_table_headers(model_table, ["Schema / Entity", "Primary Database Model", "Core Fields & Enums"], m_col_w)
    
    model_data = [
        ("patient.schema.json", "Patient", "id, first_name, last_name, dob, phone, email, address"),
        ("insurance.schema.json", "InsurancePolicy", "id, patient_id, payer_id, payer_name, member_id, group_number, policy_status (ACTIVE/INACTIVE/TERMINATED), deductible, copay"),
        ("appointment.schema.json", "Appointment", "id, patient_id, appointment_datetime, department, provider_name, cpt_code, service_description, estimated_cost"),
        ("clearance.schema.json", "ClearanceRecord", "id, patient_id, appointment_id, clearance_status (CLEARED/NEEDS_ACTION/HIGH_RISK), risk_score (0-100), primary_blocker, estimated_patient_responsibility"),
        ("self_heal.schema.json", "SelfHealProblem / AuditEvent", "id, error_category, frequency, financial_impact, decision_type (SAFE_AUTO_FIX/REQUIRES_OPERATOR), rollback_status"),
        ("denial.schema.json", "DenialRecord", "id, carc_code (CO-197/CO-27/CO-16), category, count, preventable_percentage, total_dollar_impact, root_cause")
    ]
    
    for idx, (sch, mod, fld) in enumerate(model_data):
        row = model_table.add_row()
        style_data_row(row, [sch, mod, fld], m_col_w, is_even=(idx % 2 == 1))
        
    doc.add_paragraph().paragraph_format.space_after = Pt(14)
    
    # Conclusion note
    add_callout_box(
        doc,
        "System Verification & Compliance Note",
        "Previa (PVFC) is architected for strict HIPAA compliance utilizing 100% synthetic mock patient data. "
        "All 13 canonical contract schemas pass automated JSON validation (scripts/validate_contracts.py). "
        "Production deployment is fully supported on Render (render.yaml) and Vercel (vercel.json).",
        bg_hex="F8FAFC",
        border_hex="475569"
    )

    doc.save(output_path)
    print(f"[SUCCESS] Document generated successfully at: {output_path}")

if __name__ == "__main__":
    out_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "Previa_System_Architecture_and_Features_Deep_Dive.docx"))
    generate_document(out_file)
