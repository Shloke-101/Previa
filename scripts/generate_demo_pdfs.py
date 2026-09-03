import fitz # PyMuPDF
import os

def create_insurance_card_pdf(output_path: str):
    doc = fitz.open()
    # Standard card/document page (A5 landscape or small document)
    page = doc.new_page(width=500, height=320)
    
    # Background rect
    rect_bg = fitz.Rect(15, 15, 485, 305)
    page.draw_rect(rect_bg, color=(0.1, 0.2, 0.45), fill=(0.06, 0.15, 0.35), width=2)
    
    # Header Accent bar
    header_bar = fitz.Rect(15, 15, 485, 65)
    page.draw_rect(header_bar, color=(0.02, 0.5, 0.7), fill=(0.02, 0.45, 0.65))
    
    # Header Text
    page.insert_text((30, 42), "STAR HEALTH & ALLIED INSURANCE", fontsize=15, color=(1, 1, 1), fontname="helv")
    page.insert_text((30, 56), "Comprehensive Health Advantage Tier 1 Policy", fontsize=9, color=(0.85, 0.95, 1), fontname="helv")
    page.insert_text((370, 48), "IN-NETWORK", fontsize=10, color=(1, 1, 1), fontname="helv")
    
    # Body Content
    # Member Name
    page.insert_text((35, 100), "MEMBER NAME", fontsize=8, color=(0.65, 0.75, 0.9), fontname="helv")
    page.insert_text((35, 118), "SHLOKE ROY", fontsize=14, color=(1, 1, 1), fontname="helv")
    
    # Member ID & Group No
    page.insert_text((35, 150), "MEMBER ID / POLICY #", fontsize=8, color=(0.65, 0.75, 0.9), fontname="helv")
    page.insert_text((35, 168), "STAR-8842109", fontsize=13, color=(0.2, 0.8, 1), fontname="helv")
    
    page.insert_text((220, 150), "GROUP NUMBER", fontsize=8, color=(0.65, 0.75, 0.9), fontname="helv")
    page.insert_text((220, 168), "GRP-4410", fontsize=13, color=(1, 1, 1), fontname="helv")
    
    page.insert_text((350, 150), "DATE OF BIRTH", fontsize=8, color=(0.65, 0.75, 0.9), fontname="helv")
    page.insert_text((350, 168), "18/06/2004", fontsize=13, color=(1, 1, 1), fontname="helv")
    
    # Coverage & Dates
    page.insert_text((35, 205), "EFFECTIVE DATE", fontsize=8, color=(0.65, 0.75, 0.9), fontname="helv")
    page.insert_text((35, 220), "2026-01-01", fontsize=10, color=(1, 1, 1), fontname="helv")
    
    page.insert_text((150, 205), "EXPIRATION DATE", fontsize=8, color=(0.65, 0.75, 0.9), fontname="helv")
    page.insert_text((150, 220), "2026-12-31", fontsize=10, color=(0.3, 0.9, 0.5), fontname="helv")
    
    page.insert_text((280, 205), "COPAY (PCP / SPEC)", fontsize=8, color=(0.65, 0.75, 0.9), fontname="helv")
    page.insert_text((280, 220), "$25 / $45", fontsize=10, color=(1, 1, 1), fontname="helv")
    
    page.insert_text((400, 205), "DEDUCTIBLE", fontsize=8, color=(0.65, 0.75, 0.9), fontname="helv")
    page.insert_text((400, 220), "$1,500.00", fontsize=10, color=(1, 1, 1), fontname="helv")
    
    # Pharmacy Rx Box
    rx_box = fitz.Rect(30, 245, 470, 290)
    page.draw_rect(rx_box, color=(0.2, 0.35, 0.6), fill=(0.08, 0.2, 0.4), width=1)
    
    page.insert_text((40, 262), "RxBIN: 004336", fontsize=9, color=(1, 1, 1), fontname="helv")
    page.insert_text((160, 262), "RxPCN: ADV", fontsize=9, color=(1, 1, 1), fontname="helv")
    page.insert_text((270, 262), "RxGRP: RX8821", fontsize=9, color=(1, 1, 1), fontname="helv")
    page.insert_text((370, 262), "PAYER ID: 88410", fontsize=9, color=(1, 1, 1), fontname="helv")
    page.insert_text((40, 280), "Claims Address: EDI Gateway 837 / PO Box 1024, Mumbai 400001", fontsize=8, color=(0.7, 0.8, 0.95), fontname="helv")
    
    doc.save(output_path)
    doc.close()
    print(f"Generated Insurance Card PDF at: {output_path}")

def create_prior_auth_pdf(output_path: str):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4
    
    # Header
    page.insert_text((50, 50), "BLUE CROSS BLUE SHIELD HEALTHCARE", fontsize=16, color=(0.1, 0.2, 0.5), fontname="helv")
    page.insert_text((50, 70), "ELECTRONIC PRIOR AUTHORIZATION DETERMINATION NOTICE", fontsize=12, color=(0.1, 0.4, 0.2), fontname="helv")
    page.draw_line((50, 80), (545, 80), color=(0.7, 0.7, 0.7), width=1)
    
    # Status Banner
    status_box = fitz.Rect(50, 95, 545, 140)
    page.draw_rect(status_box, color=(0.1, 0.5, 0.2), fill=(0.9, 0.98, 0.92), width=1.5)
    page.insert_text((65, 120), "DETERMINATION STATUS: APPROVED (EXPEDITED)", fontsize=13, color=(0.05, 0.45, 0.15), fontname="helv")
    page.insert_text((65, 133), "This prior authorization is valid for the requested procedure and provider.", fontsize=9, color=(0.2, 0.3, 0.2), fontname="helv")
    
    # Structured Details Table
    page.insert_text((50, 170), "AUTHORIZATION DETAILS", fontsize=11, color=(0.1, 0.2, 0.4), fontname="helv")
    
    y = 195
    details = [
        ("Prior Authorization #:", "AUTH-BCBS-99104"),
        ("Patient Name:", "Shloke Roy"),
        ("Member ID:", "BCBS-9823101"),
        ("Date of Birth:", "18/06/2004"),
        ("Payer Name:", "Blue Cross Blue Shield"),
        ("Requested Procedure (CPT):", "72148 - MRI Lumbar Spine w/o Contrast"),
        ("Authorized Provider:", "Dr. Sarah Lin, MD (Diagnostic Radiology)"),
        ("Effective Date:", "2026-08-01"),
        ("Expiration Date:", "2026-11-30"),
        ("Authorized Visits / Units:", "1 Procedure Encounter"),
        ("Place of Service:", "11 - Outpatient Imaging Center"),
    ]
    
    for label, val in details:
        page.insert_text((55, y), label, fontsize=10, color=(0.3, 0.35, 0.4), fontname="helv")
        page.insert_text((230, y), val, fontsize=10, color=(0.05, 0.1, 0.2), fontname="helv")
        page.draw_line((50, y + 5), (545, y + 5), color=(0.9, 0.92, 0.95), width=0.5)
        y += 24
        
    page.insert_text((50, y + 30), "Clinical Decision Support Notes: Meets InterQual medical necessity criteria.", fontsize=9, color=(0.4, 0.4, 0.4), fontname="helv")
    
    doc.save(output_path)
    doc.close()
    print(f"Generated Prior Auth PDF at: {output_path}")

def create_eob_pdf(output_path: str):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4
    
    # Header
    page.insert_text((50, 50), "UNITEDHEALTHCARE CHOICE PLUS", fontsize=16, color=(0.15, 0.1, 0.4), fontname="helv")
    page.insert_text((50, 70), "EXPLANATION OF BENEFITS / REMITTANCE ADVICE", fontsize=12, color=(0.4, 0.1, 0.1), fontname="helv")
    page.draw_line((50, 80), (545, 80), color=(0.7, 0.7, 0.7), width=1)
    
    y = 105
    details = [
        ("Claim Reference #:", "CLM-28490"),
        ("Patient Name:", "Shloke Roy"),
        ("Member ID:", "UHC-7712399-01"),
        ("Date of Service:", "2026-09-01"),
        ("Payer Name:", "UnitedHealthcare"),
        ("Provider:", "Advanced Surgery Institute"),
        ("Billed Amount:", "$12,750.00"),
        ("Allowed Amount:", "$0.00"),
        ("Paid Amount:", "$0.00"),
        ("Patient Responsibility:", "$1,850.00"),
        ("CARC Denial Code:", "CO-197 Missing / Expired Prior Authorization"),
        ("Remark Code (RARC):", "N286 Required Pre-Service Clinical Auth Absent"),
    ]
    
    for label, val in details:
        page.insert_text((55, y), label, fontsize=10, color=(0.3, 0.35, 0.4), fontname="helv")
        page.insert_text((230, y), val, fontsize=10, color=(0.05, 0.1, 0.2), fontname="helv")
        page.draw_line((50, y + 5), (545, y + 5), color=(0.9, 0.92, 0.95), width=0.5)
        y += 24
        
    doc.save(output_path)
    doc.close()
    print(f"Generated EOB PDF at: {output_path}")

if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    create_insurance_card_pdf("data/Demo_Insurance_Card_Shloke_Roy.pdf")
    create_prior_auth_pdf("data/Demo_Prior_Auth_Approval.pdf")
    create_eob_pdf("data/Demo_EOB_Denial_Remittance.pdf")
