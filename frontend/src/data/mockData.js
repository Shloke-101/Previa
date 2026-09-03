export const mockClearanceItems = [
  {
    patient_id: "PAT-1082",
    patient_name: "Eleanor Vance",
    dob: "1984-06-14",
    appointment_id: "APT-8821",
    appointment_datetime: "2026-09-04 09:30 AM",
    procedure_code: "72148",
    procedure_name: "MRI Lumbar Spine w/o Contrast",
    payer_name: "Blue Cross Blue Shield",
    member_id: "BCBS-9823101",
    group_number: "GRP-4410",
    clearance_status: "HIGH_RISK",
    risk_score: 88,
    risk_level: "HIGH",
    eligibility_status: "ACTIVE",
    authorization_status: "REQUIRED",
    data_validation_status: "MATCH",
    estimated_patient_responsibility: 450.00,
    primary_blocker: "Prior authorization required by BCBS but not initiated",
    recommended_actions: [
      "Initiate expedited Prior Auth portal submission for CPT 72148",
      "Attach clinical chart notes from Dr. Martinez dated 2026-08-20"
    ]
  },
  {
    patient_id: "PAT-2094",
    patient_name: "Marcus Aurelius Thorne",
    dob: "1972-11-03",
    appointment_id: "APT-8822",
    appointment_datetime: "2026-09-04 10:15 AM",
    procedure_code: "99214",
    procedure_name: "Office Visit Level 4 (Cardiology)",
    payer_name: "Aetna Health",
    member_id: "AET-550912",
    group_number: "GRP-8812",
    clearance_status: "CLEARED",
    risk_score: 12,
    risk_level: "LOW",
    eligibility_status: "ACTIVE",
    authorization_status: "NOT_REQUIRED",
    data_validation_status: "MATCH",
    estimated_patient_responsibility: 35.00,
    recommended_actions: [
      "Collect $35.00 specialist copay at check-in"
    ]
  },
  {
    patient_id: "PAT-3301",
    patient_name: "Sophia Rodriguez",
    dob: "1995-02-28",
    appointment_id: "APT-8823",
    appointment_datetime: "2026-09-04 11:00 AM",
    procedure_code: "93000",
    procedure_name: "Electrocardiogram (ECG Routine)",
    payer_name: "UnitedHealthcare",
    member_id: "UHC-7712399",
    group_number: "GRP-2020",
    clearance_status: "NEEDS_ACTION",
    risk_score: 54,
    risk_level: "MEDIUM",
    eligibility_status: "ACTIVE",
    authorization_status: "NOT_REQUIRED",
    data_validation_status: "MISMATCH",
    estimated_patient_responsibility: 65.00,
    primary_blocker: "Member ID on card (UHC-7712399-01) differs from EHR (UHC-7712399)",
    recommended_actions: [
      "Confirm suffix '-01' with patient or run 1-click OCR field synchronization",
      "Verify dependent relationship code"
    ]
  },
  {
    patient_id: "PAT-4115",
    patient_name: "David K. Chen",
    dob: "1968-08-19",
    appointment_id: "APT-8824",
    appointment_datetime: "2026-09-04 01:30 PM",
    procedure_code: "29881",
    procedure_name: "Arthroscopy Knee Meniscectomy",
    payer_name: "Cigna Healthcare",
    member_id: "CIG-330198",
    group_number: "GRP-9011",
    clearance_status: "CLEARED",
    risk_score: 18,
    risk_level: "LOW",
    eligibility_status: "ACTIVE",
    authorization_status: "APPROVED",
    auth_number: "AUTH-CG-99201",
    data_validation_status: "MATCH",
    estimated_patient_responsibility: 320.00,
    recommended_actions: [
      "Pre-authorized through 2026-10-15 (Auth #AUTH-CG-99201)",
      "Offer pre-service digital payment link for $320.00"
    ]
  },
  {
    patient_id: "PAT-5229",
    patient_name: "Harrison Brooks",
    dob: "1959-12-05",
    appointment_id: "APT-8825",
    appointment_datetime: "2026-09-04 02:45 PM",
    procedure_code: "45378",
    procedure_name: "Diagnostic Colonoscopy",
    payer_name: "Humana Gold Plus",
    member_id: "HUM-110294",
    group_number: "GRP-1004",
    clearance_status: "HIGH_RISK",
    risk_score: 92,
    risk_level: "HIGH",
    eligibility_status: "TERMINATED",
    authorization_status: "NOT_REQUIRED",
    data_validation_status: "MISMATCH",
    estimated_patient_responsibility: 1850.00,
    primary_blocker: "Insurance policy terminated on 2026-08-31",
    recommended_actions: [
      "Contact patient immediately to capture updated secondary or new primary insurance",
      "Provide Self-Pay Good Faith Estimate if uninsured"
    ]
  },
  {
    patient_id: "PAT-6440",
    patient_name: "Chloe Jenkins",
    dob: "2001-04-12",
    appointment_id: "APT-8826",
    appointment_datetime: "2026-09-05 08:30 AM",
    procedure_code: "70450",
    procedure_name: "CT Head/Brain w/o Contrast",
    payer_name: "Blue Cross Blue Shield",
    member_id: "BCBS-449102",
    group_number: "GRP-4410",
    clearance_status: "NEEDS_ACTION",
    risk_score: 62,
    risk_level: "MEDIUM",
    eligibility_status: "ACTIVE",
    authorization_status: "PENDING",
    auth_number: "PA-PENDING-441",
    data_validation_status: "PARTIAL_MATCH",
    estimated_patient_responsibility: 150.00,
    primary_blocker: "Prior authorization submitted 48h ago, determination pending from payer",
    recommended_actions: [
      "Check BCBS Availity portal for real-time auth approval",
      "Call payer prior auth expedited hotline if not determined by 4 PM"
    ]
  }
];

export const mockDossiers = {
  "PAT-1082": {
    patient_id: "PAT-1082",
    first_name: "Eleanor",
    last_name: "Vance",
    dob: "1984-06-14",
    phone: "(555) 234-5678",
    email: "eleanor.vance@example.com",
    address: "742 Evergreen Terrace, Springfield, IL 62704",
    insurance: {
      payer_id: "BCBS-IL",
      payer_name: "Blue Cross Blue Shield of Illinois",
      plan_name: "Blue Precision HMO Tier 1",
      member_id: "BCBS-9823101",
      group_number: "GRP-4410",
      policy_status: "ACTIVE",
      effective_date: "2026-01-01",
      expiration_date: "2026-12-31",
      in_network: true
    },
    appointment: {
      appointment_id: "APT-8821",
      datetime: "2026-09-04 09:30 AM",
      department: "Advanced Diagnostic Radiology",
      provider_name: "Dr. Sarah Lin, MD",
      cpt_code: "72148",
      service_description: "Magnetic Resonance Imaging (MRI), Lumbar Spine w/o Contrast"
    },
    financials: {
      total_estimated_cost: 1450.00,
      deductible_total: 1500.00,
      deductible_remaining: 350.00,
      copay_amount: 0.00,
      coinsurance_percentage: 20,
      coinsurance_amount: 100.00,
      estimated_patient_responsibility: 450.00,
      estimated_payer_responsibility: 1000.00
    },
    prior_auth: {
      required: true,
      status: "REQUIRED",
      notes: "BCBS mandates prior authorization for high-tech imaging (CPT 70000-79999). Lack of auth results in 100% claim denial."
    },
    clearance: {
      status: "HIGH_RISK",
      risk_score: 88,
      risk_level: "HIGH",
      data_validation_status: "MATCH",
      flags: [
        "Missing mandatory Prior Authorization for MRI Lumbar Spine",
        "Upcoming appointment in < 24 hours"
      ],
      recommended_actions: [
        "Submit urgent prior auth request via Availity",
        "Verify medical necessity documentation is attached"
      ]
    }
  },
  "PAT-2094": {
    patient_id: "PAT-2094",
    first_name: "Marcus",
    last_name: "Thorne",
    dob: "1972-11-03",
    phone: "(555) 876-5432",
    email: "marcus.thorne@example.com",
    address: "100 Pine Street, Chicago, IL 60601",
    insurance: {
      payer_id: "AETNA-01",
      payer_name: "Aetna Choice POS II",
      plan_name: "Open Access Managed Care",
      member_id: "AET-550912",
      group_number: "GRP-8812",
      policy_status: "ACTIVE",
      effective_date: "2026-01-01",
      expiration_date: "2026-12-31",
      in_network: true
    },
    appointment: {
      appointment_id: "APT-8822",
      datetime: "2026-09-04 10:15 AM",
      department: "Cardiology Consult",
      provider_name: "Dr. Robert Chen, MD",
      cpt_code: "99214",
      service_description: "Office Outpatient Visit, Established, Moderate Complexity"
    },
    financials: {
      total_estimated_cost: 210.00,
      deductible_total: 1000.00,
      deductible_remaining: 0.00,
      copay_amount: 35.00,
      coinsurance_percentage: 0,
      coinsurance_amount: 0.00,
      estimated_patient_responsibility: 35.00,
      estimated_payer_responsibility: 175.00
    },
    prior_auth: {
      required: false,
      status: "NOT_REQUIRED"
    },
    clearance: {
      status: "CLEARED",
      risk_score: 12,
      risk_level: "LOW",
      data_validation_status: "MATCH",
      flags: [],
      recommended_actions: [
        "Collect $35.00 copayment upon check-in"
      ]
    }
  },
  "PAT-3301": {
    patient_id: "PAT-3301",
    first_name: "Sophia",
    last_name: "Rodriguez",
    dob: "1995-02-28",
    phone: "(555) 432-1098",
    email: "sophia.rodriguez@example.com",
    address: "420 Oak Avenue, Naperville, IL 60540",
    insurance: {
      payer_id: "UHC-CHOICE",
      payer_name: "UnitedHealthcare Choice Plus",
      plan_name: "National Network PPO",
      member_id: "UHC-7712399",
      group_number: "GRP-2020",
      policy_status: "ACTIVE",
      effective_date: "2026-03-01",
      expiration_date: "2027-02-28",
      in_network: true
    },
    appointment: {
      appointment_id: "APT-8823",
      datetime: "2026-09-04 11:00 AM",
      department: "Cardiovascular Diagnostics",
      provider_name: "Dr. Robert Chen, MD",
      cpt_code: "93000",
      service_description: "Electrocardiogram Routine ECG with Interpretation"
    },
    financials: {
      total_estimated_cost: 165.00,
      deductible_total: 750.00,
      deductible_remaining: 65.00,
      copay_amount: 0.00,
      coinsurance_percentage: 0,
      coinsurance_amount: 0.00,
      estimated_patient_responsibility: 65.00,
      estimated_payer_responsibility: 100.00
    },
    prior_auth: {
      required: false,
      status: "NOT_REQUIRED"
    },
    clearance: {
      status: "NEEDS_ACTION",
      risk_score: 54,
      risk_level: "MEDIUM",
      data_validation_status: "MISMATCH",
      flags: [
        "Member ID suffix variance between OCR scan ('-01') and EHR record"
      ],
      recommended_actions: [
        "Sync member ID with suffix -01 from verified card scan",
        "Confirm primary insured vs dependent"
      ]
    }
  }
};

export const mockRiskEvaluations = {
  "PAT-1082": {
    patient_id: "PAT-1082",
    composite_score: 88,
    risk_level: "HIGH",
    top_denial_probability: 0.94,
    explanation: "Critical risk driven by missing mandatory prior authorization for high-tech imaging service within 24 hours of appointment.",
    factors: [
      {
        id: "rf-1",
        name: "Prior Authorization Missing",
        category: "AUTHORIZATION",
        weight: 0.40,
        scoreContribution: 40,
        description: "CPT 72148 requires payer pre-authorization which is currently uninitiated.",
        status: "FAIL"
      },
      {
        id: "rf-2",
        name: "Encounter Proximity (<24 Hours)",
        category: "HISTORICAL",
        weight: 0.20,
        scoreContribution: 18,
        description: "Lead time for standard payer review exceeds remaining hours before visit.",
        status: "FAIL"
      },
      {
        id: "rf-3",
        name: "Historical Payer Imaging Denial Rate",
        category: "HISTORICAL",
        weight: 0.15,
        scoreContribution: 15,
        description: "BCBS Illinois denies 28.4% of unauthorized MRI claims without retrospective appeals.",
        status: "FAIL"
      },
      {
        id: "rf-4",
        name: "Demographic & Policy Active Verification",
        category: "ELIGIBILITY",
        weight: 0.15,
        scoreContribution: 5,
        description: "Policy is active and in-network.",
        status: "PASS"
      },
      {
        id: "rf-5",
        name: "OCR Field Integrity",
        category: "DATA_MISMATCH",
        weight: 0.10,
        scoreContribution: 10,
        description: "All card data matches hospital master record.",
        status: "PASS"
      }
    ]
  },
  "PAT-3301": {
    patient_id: "PAT-3301",
    composite_score: 54,
    risk_level: "MEDIUM",
    top_denial_probability: 0.45,
    explanation: "Moderate risk due to Member ID formatting discrepancy between EHR and physical card.",
    factors: [
      {
        id: "rf-1",
        name: "Member ID Suffix Discrepancy",
        category: "DATA_MISMATCH",
        weight: 0.35,
        scoreContribution: 30,
        description: "EHR record missing '-01' suffix extracted from physical card.",
        status: "WARNING"
      },
      {
        id: "rf-2",
        name: "Eligibility Status",
        category: "ELIGIBILITY",
        weight: 0.30,
        scoreContribution: 10,
        description: "Policy active and in-network.",
        status: "PASS"
      },
      {
        id: "rf-3",
        name: "Authorization Mandate",
        category: "AUTHORIZATION",
        weight: 0.25,
        scoreContribution: 5,
        description: "Routine ECG does not require authorization.",
        status: "PASS"
      },
      {
        id: "rf-4",
        name: "Financial Estimate Clarity",
        category: "HISTORICAL",
        weight: 0.10,
        scoreContribution: 9,
        description: "Estimated patient deductible remaining is $65.00.",
        status: "PASS"
      }
    ]
  }
};

export const mockCardSamples = [
  {
    id: "sample-bcbs",
    payerName: "Blue Cross Blue Shield",
    planType: "PPO Comprehensive Plus",
    patientName: "ELEANOR VANCE",
    memberId: "BCBS-9823101",
    groupNumber: "GRP-4410",
    dob: "06/14/1984",
    rxBin: "004336",
    rxPcn: "ADV",
    cardImageColor: "linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)",
    fields: [
      {
        fieldName: "patient_name",
        label: "Member Name",
        ocrValue: "ELEANOR VANCE",
        hospitalValue: "Eleanor Vance",
        status: "MATCH",
        confidence: 0.98,
        box: { x: 8, y: 35, width: 45, height: 12, label: "Name" }
      },
      {
        fieldName: "member_id",
        label: "Member ID",
        ocrValue: "BCBS-9823101",
        hospitalValue: "BCBS-9823101",
        status: "MATCH",
        confidence: 0.99,
        box: { x: 8, y: 52, width: 38, height: 12, label: "Member ID" }
      },
      {
        fieldName: "group_number",
        label: "Group Number",
        ocrValue: "GRP-4410",
        hospitalValue: "GRP-4410",
        status: "MATCH",
        confidence: 0.96,
        box: { x: 55, y: 52, width: 32, height: 12, label: "Group No" }
      },
      {
        fieldName: "payer_name",
        label: "Payer Name",
        ocrValue: "BLUE CROSS BLUE SHIELD",
        hospitalValue: "Blue Cross Blue Shield",
        status: "MATCH",
        confidence: 0.99,
        box: { x: 8, y: 12, width: 60, height: 14, label: "Payer" }
      }
    ]
  },
  {
    id: "sample-uhc-mismatch",
    payerName: "UnitedHealthcare",
    planType: "Choice Plus PPO",
    patientName: "SOPHIA RODRIGUEZ",
    memberId: "UHC-7712399-01",
    groupNumber: "GRP-2020",
    dob: "02/28/1995",
    rxBin: "610279",
    rxPcn: "9901",
    cardImageColor: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    fields: [
      {
        fieldName: "patient_name",
        label: "Member Name",
        ocrValue: "SOPHIA RODRIGUEZ",
        hospitalValue: "Sophia Rodriguez",
        status: "MATCH",
        confidence: 0.97,
        box: { x: 8, y: 35, width: 48, height: 12, label: "Name" }
      },
      {
        fieldName: "member_id",
        label: "Member ID",
        ocrValue: "UHC-7712399-01",
        hospitalValue: "UHC-7712399",
        status: "MISMATCH",
        confidence: 0.95,
        box: { x: 8, y: 52, width: 42, height: 12, label: "Member ID" }
      },
      {
        fieldName: "group_number",
        label: "Group Number",
        ocrValue: "GRP-2020",
        hospitalValue: "GRP-2020",
        status: "MATCH",
        confidence: 0.98,
        box: { x: 55, y: 52, width: 32, height: 12, label: "Group No" }
      }
    ]
  }
];

export const mockDenialCategories = [
  { code: "CO-197", category: "Missing / Expired Prior Authorization", count: 142, preventablePercentage: 94, color: "#f43f5e" },
  { code: "CO-27", category: "Expenses Incurred After Coverage Terminated", count: 88, preventablePercentage: 98, color: "#f59e0b" },
  { code: "CO-16", category: "Claim Lacks Information / ID Mismatch", count: 64, preventablePercentage: 91, color: "#06b6d4" },
  { code: "CO-50", category: "Non-Covered Service / Medical Necessity", count: 39, preventablePercentage: 78, color: "#8b5cf6" },
  { code: "CO-29", category: "Timely Filing Limit Exceeded", count: 18, preventablePercentage: 85, color: "#64748b" }
];

export const mockPayerStats = [
  { payerName: "Blue Cross Blue Shield", denialRate: 14.2, topDenialReason: "CO-197 (Missing Prior Auth)", avgResolutionDays: 14 },
  { payerName: "UnitedHealthcare", denialRate: 18.7, topDenialReason: "CO-16 (Member ID Suffix)", avgResolutionDays: 18 },
  { payerName: "Cigna Healthcare", denialRate: 8.4, topDenialReason: "CO-50 (Procedure Coverage)", avgResolutionDays: 9 },
  { payerName: "Aetna Health", denialRate: 6.9, topDenialReason: "CO-27 (Terminated Policy)", avgResolutionDays: 8 }
];

export const mockPreventiveRules = [
  {
    id: "rule-1",
    title: "72-Hour Mandatory Prior Auth Guard",
    description: "Automatically flags encounters with CPT codes requiring prior authorization if no approval is logged 72 hours prior to visit.",
    triggerType: "TIME_BASED",
    triggerCondition: "Appointment T - 72h & PriorAuthStatus != APPROVED",
    action: "Escalate to Pre-Service RCM Worklist & Send Provider Alert",
    enabled: true,
    preventedCountThisMonth: 48
  },
  {
    id: "rule-2",
    title: "Real-Time 24-Hour Policy Re-Verification",
    description: "Automatically re-verifies 270/271 eligibility 24 hours prior to appointment to detect month-end terminations.",
    triggerType: "TIME_BASED",
    triggerCondition: "Appointment T - 24h",
    action: "Execute 270 Eligibility Inquiry & Update Clearance Status",
    enabled: true,
    preventedCountThisMonth: 31
  },
  {
    id: "rule-3",
    title: "OCR Member ID Suffix Auto-Reconciliation",
    description: "Identifies when extracted OCR member ID contains trailing person-code suffix and suggests 1-click sync.",
    triggerType: "EVENT_BASED",
    triggerCondition: "Card Upload Event & Suffix Variance Detected",
    action: "Prompt Staff with 1-Click Sync Badge",
    enabled: true,
    preventedCountThisMonth: 19
  }
];
