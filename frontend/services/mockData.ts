import {
  Patient,
  Appointment,
  InsurancePolicy,
  ClearanceEvaluation,
  RiskAssessment,
  RecommendedAction,
  DashboardSummary,
  PriorityQueueItem,
  DenialPattern,
  WorkflowTask,
  ValidationResult
} from '../types';

export const mockPatients: Patient[] = [
  {
    patient_id: 'pat-001-carter',
    first_name: 'John',
    last_name: 'Carter',
    date_of_birth: '1978-05-14',
    gender: 'Male',
    phone: '(555) 234-5678',
    email: 'john.carter@example.com',
    mrn: 'MRN-884920',
    address: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zip: '62704'
    },
    created_at: '2024-01-15T08:30:00Z'
  },
  {
    patient_id: 'pat-002-williams',
    first_name: 'Sarah',
    last_name: 'Williams',
    date_of_birth: '1990-11-22',
    gender: 'Female',
    phone: '(555) 876-5432',
    email: 'sarah.williams@example.com',
    mrn: 'MRN-392011',
    address: {
      street: '120 Pine Street',
      city: 'Chicago',
      state: 'IL',
      zip: '60601'
    },
    created_at: '2024-02-10T11:15:00Z'
  },
  {
    patient_id: 'pat-003-brown',
    first_name: 'Michael',
    last_name: 'Brown',
    date_of_birth: '1965-03-08',
    gender: 'Male',
    phone: '(555) 432-1098',
    email: 'michael.brown@example.com',
    mrn: 'MRN-773019',
    address: {
      street: '458 Oak Ridge Ave',
      city: 'Naperville',
      state: 'IL',
      zip: '60540'
    },
    created_at: '2024-03-01T09:00:00Z'
  },
  {
    patient_id: 'pat-004-rostova',
    first_name: 'Elena',
    last_name: 'Rostova',
    date_of_birth: '1983-09-30',
    gender: 'Female',
    phone: '(555) 901-2345',
    email: 'elena.rostova@example.com',
    mrn: 'MRN-109284',
    address: {
      street: '88 Maple Drive',
      city: 'Evanston',
      state: 'IL',
      zip: '60201'
    },
    created_at: '2024-03-12T14:20:00Z'
  },
  {
    patient_id: 'pat-005-kim',
    first_name: 'David',
    last_name: 'Kim',
    date_of_birth: '1995-07-19',
    gender: 'Male',
    phone: '(555) 678-9012',
    email: 'david.kim@example.com',
    mrn: 'MRN-554109',
    address: {
      street: '312 Michigan Ave',
      city: 'Chicago',
      state: 'IL',
      zip: '60611'
    },
    created_at: '2024-04-05T10:45:00Z'
  },
  {
    patient_id: 'pat-006-vance',
    first_name: 'Marcus',
    last_name: 'Vance',
    date_of_birth: '1958-12-03',
    gender: 'Male',
    phone: '(555) 345-6789',
    email: 'marcus.vance@example.com',
    mrn: 'MRN-902381',
    address: {
      street: '15 Cedar Lane',
      city: 'Aurora',
      state: 'IL',
      zip: '60505'
    },
    created_at: '2024-04-18T16:00:00Z'
  }
];

export const mockInsurancePolicies: Record<string, InsurancePolicy> = {
  'pat-001-carter': {
    insurance_policy_id: 'pol-001',
    patient_id: 'pat-001-carter',
    payer_name: 'BlueCross BlueShield',
    payer_id: 'BCBS-IL-001',
    member_id: 'BC-99823041',
    policy_number: 'POL-7738210',
    group_number: 'GRP-4401',
    policy_status: 'ACTIVE',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    network_tier: 'IN_NETWORK'
  },
  'pat-002-williams': {
    insurance_policy_id: 'pol-002',
    patient_id: 'pat-002-williams',
    payer_name: 'Aetna Health',
    payer_id: 'AETNA-60054',
    member_id: 'AET-4491028',
    policy_number: 'POL-1192840',
    group_number: 'GRP-8890',
    policy_status: 'ACTIVE',
    start_date: '2024-01-01',
    end_date: '2025-01-01',
    network_tier: 'IN_NETWORK'
  },
  'pat-003-brown': {
    insurance_policy_id: 'pol-003',
    patient_id: 'pat-003-brown',
    payer_name: 'UnitedHealthcare',
    payer_id: 'UHC-87726',
    member_id: 'UHC-1029384-OLD', // Mismatch vs EHR record UHC-1029384-NEW
    policy_number: 'POL-3329104',
    group_number: 'GRP-1209',
    policy_status: 'ACTIVE',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    network_tier: 'IN_NETWORK'
  },
  'pat-004-rostova': {
    insurance_policy_id: 'pol-004',
    patient_id: 'pat-004-rostova',
    payer_name: 'Cigna Choice',
    payer_id: 'CG-6230',
    member_id: 'CG-8871920',
    policy_number: 'POL-8839201',
    group_number: 'GRP-9901',
    policy_status: 'EXPIRED',
    start_date: '2023-01-01',
    end_date: '2024-08-15',
    network_tier: 'OUT_OF_NETWORK'
  },
  'pat-005-kim': {
    insurance_policy_id: 'pol-005',
    patient_id: 'pat-005-kim',
    payer_name: 'Humana Gold',
    payer_id: 'HUM-44102',
    member_id: 'HUM-3329102',
    policy_number: 'POL-5540192',
    group_number: 'GRP-3310',
    policy_status: 'ACTIVE',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    network_tier: 'IN_NETWORK'
  },
  'pat-006-vance': {
    insurance_policy_id: 'pol-006',
    patient_id: 'pat-006-vance',
    payer_name: 'Medicare Part B',
    payer_id: 'CMS-MEDICARE',
    member_id: '1EG4-TE5-MK77',
    policy_number: 'POL-0092817',
    group_number: 'N/A',
    policy_status: 'ACTIVE',
    start_date: '2024-01-01',
    end_date: '2025-12-31',
    network_tier: 'IN_NETWORK'
  }
};

export const mockAppointments: Record<string, Appointment> = {
  'pat-001-carter': {
    appointment_id: 'apt-001',
    patient_id: 'pat-001-carter',
    insurance_policy_id: 'pol-001',
    appointment_time: '2026-09-05T09:30:00Z',
    provider_name: 'Dr. Robert Chen, MD',
    department: 'Radiology / Imaging',
    procedure_code: '70551',
    procedure_description: 'MRI Brain Without Contrast',
    estimated_cost: 2450.00,
    location: 'Building A, Suite 300 - Diagnostic Center',
    status: 'SCHEDULED',
    clearance_status: 'HIGH_RISK',
    risk_score: 78
  },
  'pat-002-williams': {
    appointment_id: 'apt-002',
    patient_id: 'pat-002-williams',
    insurance_policy_id: 'pol-002',
    appointment_time: '2026-09-05T11:00:00Z',
    provider_name: 'Dr. Susan Vance, MD',
    department: 'Cardiology Specialist',
    procedure_code: '99214',
    procedure_description: 'Outpatient Office Consultation Level 4',
    estimated_cost: 320.00,
    location: 'Main Pavilion, 4th Floor',
    status: 'SCHEDULED',
    clearance_status: 'CLEARED',
    risk_score: 22
  },
  'pat-003-brown': {
    appointment_id: 'apt-003',
    patient_id: 'pat-003-brown',
    insurance_policy_id: 'pol-003',
    appointment_time: '2026-09-06T08:15:00Z',
    provider_name: 'Dr. Amanda Foster, MD',
    department: 'Oncology / Scan',
    procedure_code: '74177',
    procedure_description: 'CT Abdomen and Pelvis with Contrast',
    estimated_cost: 1850.00,
    location: 'Building B, Suite 105 - Outpatient Imaging',
    status: 'SCHEDULED',
    clearance_status: 'NEEDS_ACTION',
    risk_score: 61
  },
  'pat-004-rostova': {
    appointment_id: 'apt-004',
    patient_id: 'pat-004-rostova',
    insurance_policy_id: 'pol-004',
    appointment_time: '2026-09-06T14:00:00Z',
    provider_name: 'Dr. James Patterson, MD',
    department: 'Orthopedics',
    procedure_code: '27447',
    procedure_description: 'Arthroplasty Knee Total Knee Replacement',
    estimated_cost: 14200.00,
    location: 'Surgical Pavilion, Operating Suite 4',
    status: 'SCHEDULED',
    clearance_status: 'HIGH_RISK',
    risk_score: 95
  },
  'pat-005-kim': {
    appointment_id: 'apt-005',
    patient_id: 'pat-005-kim',
    insurance_policy_id: 'pol-005',
    appointment_time: '2026-09-07T10:00:00Z',
    provider_name: 'Dr. Elena Torres, MD',
    department: 'Dermatology',
    procedure_code: '11102',
    procedure_description: 'Tangential Biopsy of Skin Single Lesion',
    estimated_cost: 450.00,
    location: 'Specialty Care Center, Suite 210',
    status: 'SCHEDULED',
    clearance_status: 'NEEDS_ACTION',
    risk_score: 48
  },
  'pat-006-vance': {
    appointment_id: 'apt-006',
    patient_id: 'pat-006-vance',
    insurance_policy_id: 'pol-006',
    appointment_time: '2026-09-07T13:30:00Z',
    provider_name: 'Dr. William Zhang, MD',
    department: 'Pulmonology',
    procedure_code: '94010',
    procedure_description: 'Spirometry Pulmonary Function Test',
    estimated_cost: 290.00,
    location: 'Cardiopulmonary Lab, 2nd Floor',
    status: 'SCHEDULED',
    clearance_status: 'CLEARED',
    risk_score: 12
  }
};

export const mockRiskAssessments: Record<string, RiskAssessment> = {
  'pat-001-carter': {
    assessment_id: 'risk-001',
    patient_id: 'pat-001-carter',
    appointment_id: 'apt-001',
    risk_score: 78,
    risk_level: 'HIGH',
    factors: [
      {
        factor_code: 'missing_authorization',
        reason: 'CPT 70551 (MRI Brain) requires prior authorization for BlueCross Select plans but no approved auth number is attached to encounter.',
        impact: 30
      },
      {
        factor_code: 'critical_member_id_mismatch',
        reason: 'Uploaded insurance card displays Member ID BC-99823041 whereas hospital EHR record lists BC-99823014.',
        impact: 25
      },
      {
        factor_code: 'out_of_network',
        reason: 'Imaging Diagnostic Center is Tier-2 Preferred, triggering high out-of-network coinsurance penalty.',
        impact: 13
      },
      {
        factor_code: 'policy_expiring_soon',
        reason: 'Patient coverage cycle ends in 28 days and renewal documentation is unverified.',
        impact: 10
      }
    ],
    summary_explanation: 'High risk encounter due to missing mandatory prior authorization on MRI Brain and a critical member ID typo in EHR records. Claim would be auto-rejected by BlueCross without prior resolution.',
    evaluated_at: '2026-09-03T10:00:00Z'
  },
  'pat-002-williams': {
    assessment_id: 'risk-002',
    patient_id: 'pat-002-williams',
    appointment_id: 'apt-002',
    risk_score: 22,
    risk_level: 'LOW',
    factors: [
      {
        factor_code: 'policy_expiring_soon',
        reason: 'Policy expires in 45 days.',
        impact: 10
      },
      {
        factor_code: 'minor_name_mismatch',
        reason: 'Minor middle initial variation (Sarah A. Williams vs Sarah Williams).',
        impact: 12
      }
    ],
    summary_explanation: 'Low risk encounter. Insurance policy is active, consultation procedure does not mandate prior auth, and all patient demographics match verified records.',
    evaluated_at: '2026-09-03T10:05:00Z'
  },
  'pat-003-brown': {
    assessment_id: 'risk-003',
    patient_id: 'pat-003-brown',
    appointment_id: 'apt-003',
    risk_score: 61,
    risk_level: 'MEDIUM',
    factors: [
      {
        factor_code: 'critical_member_id_mismatch',
        reason: 'Member ID mismatch: UHC-1029384-OLD on card vs UHC-1029384-NEW on hospital system.',
        impact: 25
      },
      {
        factor_code: 'missing_referral',
        reason: 'Primary Care Provider referral letter missing from patient chart for CT Scan procedure.',
        impact: 26
      },
      {
        factor_code: 'policy_expiring_soon',
        reason: 'Policy expires within 30 days.',
        impact: 10
      }
    ],
    summary_explanation: 'Needs Action encounter. Member ID mismatch and missing PCP referral letter must be updated prior to visit to guarantee payer clearance.',
    evaluated_at: '2026-09-03T10:10:00Z'
  },
  'pat-004-rostova': {
    assessment_id: 'risk-004',
    patient_id: 'pat-004-rostova',
    appointment_id: 'apt-004',
    risk_score: 95,
    risk_level: 'HIGH',
    factors: [
      {
        factor_code: 'inactive_insurance',
        reason: 'Cigna policy terminated on 2024-08-15. Patient currently has no active commercial coverage on file.',
        impact: 40
      },
      {
        factor_code: 'missing_authorization',
        reason: 'Total Knee Replacement surgery requires prior authorization.',
        impact: 30
      },
      {
        factor_code: 'out_of_network',
        reason: 'Provider is out-of-network.',
        impact: 25
      }
    ],
    summary_explanation: 'Critical High Risk. Patient policy is EXPIRED and terminated. Major inpatient surgery encounter cannot proceed without obtaining active replacement primary coverage.',
    evaluated_at: '2026-09-03T10:15:00Z'
  },
  'pat-005-kim': {
    assessment_id: 'risk-005',
    patient_id: 'pat-005-kim',
    appointment_id: 'apt-005',
    risk_score: 48,
    risk_level: 'MEDIUM',
    factors: [
      {
        factor_code: 'coverage_restriction',
        reason: 'CPT 11102 has cosmetic exclusions unless clinical documentation confirms dysplastic nevus.',
        impact: 23
      },
      {
        factor_code: 'critical_member_id_mismatch',
        reason: 'Group number discrepancy on insurance file.',
        impact: 25
      }
    ],
    summary_explanation: 'Medium risk encounter requiring clinical documentation upload to clear procedure coverage restriction.',
    evaluated_at: '2026-09-03T10:20:00Z'
  },
  'pat-006-vance': {
    assessment_id: 'risk-006',
    patient_id: 'pat-006-vance',
    appointment_id: 'apt-006',
    risk_score: 12,
    risk_level: 'LOW',
    factors: [
      {
        factor_code: 'minor_name_mismatch',
        reason: 'Name spelling verified with CMS Medicare master database.',
        impact: 12
      }
    ],
    summary_explanation: 'Low risk encounter. Medicare Part B coverage active and verified.',
    evaluated_at: '2026-09-03T10:25:00Z'
  }
};

export const mockClearanceEvaluations: Record<string, ClearanceEvaluation> = {
  'pat-001-carter': {
    clearance_id: 'clr-001',
    patient_id: 'pat-001-carter',
    appointment_id: 'apt-001',
    clearance_status: 'HIGH_RISK',
    risk_score: 78,
    risk_level: 'HIGH',
    is_blocked: true,
    blocking_reasons: [
      'Missing required prior authorization for CPT 70551 (MRI Brain)',
      'Member ID discrepancy between insurance card scan and EHR record'
    ],
    eligibility_verified: true,
    coverage_verified: true,
    authorization_satisfied: false,
    validation_passed: false,
    estimated_patient_responsibility: 450.00,
    priority_rank: 1,
    evaluated_at: '2026-09-03T10:00:00Z',
    evaluated_by: 'PREVIA_CLEARANCE_ENGINE_v1.2'
  },
  'pat-002-williams': {
    clearance_id: 'clr-002',
    patient_id: 'pat-002-williams',
    appointment_id: 'apt-002',
    clearance_status: 'CLEARED',
    risk_score: 22,
    risk_level: 'LOW',
    is_blocked: false,
    blocking_reasons: [],
    eligibility_verified: true,
    coverage_verified: true,
    authorization_satisfied: true,
    validation_passed: true,
    estimated_patient_responsibility: 35.00,
    priority_rank: 6,
    evaluated_at: '2026-09-03T10:05:00Z',
    evaluated_by: 'PREVIA_CLEARANCE_ENGINE_v1.2'
  },
  'pat-003-brown': {
    clearance_id: 'clr-003',
    patient_id: 'pat-003-brown',
    appointment_id: 'apt-003',
    clearance_status: 'NEEDS_ACTION',
    risk_score: 61,
    risk_level: 'MEDIUM',
    is_blocked: true,
    blocking_reasons: [
      'Member ID mismatch requires registrar confirmation',
      'PCP referral document not linked to encounter'
    ],
    eligibility_verified: true,
    coverage_verified: true,
    authorization_satisfied: true,
    validation_passed: false,
    estimated_patient_responsibility: 280.00,
    priority_rank: 2,
    evaluated_at: '2026-09-03T10:10:00Z',
    evaluated_by: 'PREVIA_CLEARANCE_ENGINE_v1.2'
  },
  'pat-004-rostova': {
    clearance_id: 'clr-004',
    patient_id: 'pat-004-rostova',
    appointment_id: 'apt-004',
    clearance_status: 'HIGH_RISK',
    risk_score: 95,
    risk_level: 'HIGH',
    is_blocked: true,
    blocking_reasons: [
      'Expired insurance policy on record (Terminated 2024-08-15)',
      'Missing prior authorization for total knee replacement',
      'Facility out-of-network for expired policy'
    ],
    eligibility_verified: false,
    coverage_verified: false,
    authorization_satisfied: false,
    validation_passed: false,
    estimated_patient_responsibility: 14200.00,
    priority_rank: 3,
    evaluated_at: '2026-09-03T10:15:00Z',
    evaluated_by: 'PREVIA_CLEARANCE_ENGINE_v1.2'
  },
  'pat-005-kim': {
    clearance_id: 'clr-005',
    patient_id: 'pat-005-kim',
    appointment_id: 'apt-005',
    clearance_status: 'NEEDS_ACTION',
    risk_score: 48,
    risk_level: 'MEDIUM',
    is_blocked: true,
    blocking_reasons: [
      'Clinical justification documentation required for skin biopsy coverage'
    ],
    eligibility_verified: true,
    coverage_verified: false,
    authorization_satisfied: true,
    validation_passed: true,
    estimated_patient_responsibility: 90.00,
    priority_rank: 4,
    evaluated_at: '2026-09-03T10:20:00Z',
    evaluated_by: 'PREVIA_CLEARANCE_ENGINE_v1.2'
  },
  'pat-006-vance': {
    clearance_id: 'clr-006',
    patient_id: 'pat-006-vance',
    appointment_id: 'apt-006',
    clearance_status: 'CLEARED',
    risk_score: 12,
    risk_level: 'LOW',
    is_blocked: false,
    blocking_reasons: [],
    eligibility_verified: true,
    coverage_verified: true,
    authorization_satisfied: true,
    validation_passed: true,
    estimated_patient_responsibility: 20.00,
    priority_rank: 5,
    evaluated_at: '2026-09-03T10:25:00Z',
    evaluated_by: 'PREVIA_CLEARANCE_ENGINE_v1.2'
  }
};

export const mockRecommendedActions: Record<string, RecommendedAction[]> = {
  'pat-001-carter': [
    {
      action_id: 'act-001',
      patient_id: 'pat-001-carter',
      appointment_id: 'apt-001',
      problem_code: 'MISSING_AUTHORIZATION',
      action_type: 'REQUEST_PRIOR_AUTH',
      priority: 'URGENT',
      recommended_step: 'Submit prior authorization request for MRI Brain (CPT 70551) to BlueCross portal or call 1-800-555-BCBS.',
      assigned_role: 'AUTH_SPECIALIST',
      status: 'OPEN',
      created_at: '2026-09-03T10:00:00Z'
    },
    {
      action_id: 'act-002',
      patient_id: 'pat-001-carter',
      appointment_id: 'apt-001',
      problem_code: 'MEMBER_ID_MISMATCH',
      action_type: 'UPDATE_EHR_RECORD',
      priority: 'HIGH',
      recommended_step: 'Verify card scan and update patient MRN record with Member ID BC-99823041.',
      assigned_role: 'REGISTRAR',
      status: 'OPEN',
      created_at: '2026-09-03T10:00:00Z'
    }
  ],
  'pat-002-williams': [],
  'pat-003-brown': [
    {
      action_id: 'act-003',
      patient_id: 'pat-003-brown',
      appointment_id: 'apt-003',
      problem_code: 'MEMBER_ID_MISMATCH',
      action_type: 'UPDATE_EHR_RECORD',
      priority: 'HIGH',
      recommended_step: 'Contact patient or review card scan to update Member ID from UHC-1029384-OLD to current active number.',
      assigned_role: 'REGISTRAR',
      status: 'OPEN',
      created_at: '2026-09-03T10:10:00Z'
    },
    {
      action_id: 'act-004',
      patient_id: 'pat-003-brown',
      appointment_id: 'apt-003',
      problem_code: 'MISSING_REFERRAL',
      action_type: 'REQUEST_REFERRAL',
      priority: 'MEDIUM',
      recommended_step: 'Obtain Primary Care Physician referral letter for outpatient CT scan.',
      assigned_role: 'REGISTRAR',
      status: 'OPEN',
      created_at: '2026-09-03T10:10:00Z'
    }
  ],
  'pat-004-rostova': [
    {
      action_id: 'act-005',
      patient_id: 'pat-004-rostova',
      appointment_id: 'apt-004',
      problem_code: 'EXPIRED_POLICY',
      action_type: 'OBTAIN_SECONDARY_INSURANCE',
      priority: 'URGENT',
      recommended_step: 'Contact patient immediately to collect updated commercial or replacement Medicare insurance card prior to surgical scheduling.',
      assigned_role: 'FINANCIAL_COUNSELOR',
      status: 'OPEN',
      created_at: '2026-09-03T10:15:00Z'
    }
  ],
  'pat-005-kim': [
    {
      action_id: 'act-006',
      patient_id: 'pat-005-kim',
      appointment_id: 'apt-005',
      problem_code: 'NON_COVERED_SERVICE',
      action_type: 'UPDATE_EHR_RECORD',
      priority: 'MEDIUM',
      recommended_step: 'Attach clinical notes confirming medical necessity for skin biopsy procedure.',
      assigned_role: 'REGISTRAR',
      status: 'OPEN',
      created_at: '2026-09-03T10:20:00Z'
    }
  ],
  'pat-006-vance': []
};

export const mockDashboardSummary: DashboardSummary = {
  total_upcoming_patients: 142,
  cleared_count: 98,
  needs_action_count: 28,
  high_risk_count: 16,
  pending_verification_count: 5,
  potential_financial_exposure: 184500.00,
  prevented_denial_dollars: 428000.00
};

export const mockPriorityQueue: PriorityQueueItem[] = mockPatients
  .map(p => ({
    patient: p,
    appointment: mockAppointments[p.patient_id],
    insurance: mockInsurancePolicies[p.patient_id],
    clearance: mockClearanceEvaluations[p.patient_id],
    risk: mockRiskAssessments[p.patient_id],
    recommended_actions: mockRecommendedActions[p.patient_id] || [],
    primary_issue: mockClearanceEvaluations[p.patient_id]?.blocking_reasons[0] || 'No critical issue'
  }))
  .sort((a, b) => (a.clearance?.priority_rank || 99) - (b.clearance?.priority_rank || 99));

export const mockDenialPatterns: DenialPattern[] = [
  {
    id: 'pat-den-001',
    reason_code: 'CO-197',
    description: 'Precertification / prior authorization omitted for outpatient imaging procedure',
    claims_affected: 300,
    dollar_volume: 412000.00,
    primary_procedure: '70551 (MRI Brain)',
    payer_name: 'BlueCross BlueShield',
    root_cause: 'Scheduler workflow bypasses authorization flag when scheduling MRI encounters less than 3 days out.',
    preventive_rule: 'Auto-flag all MRI appointments upon order creation and generate prior auth task 5 days pre-visit.',
    rule_enabled: true
  },
  {
    id: 'pat-den-002',
    reason_code: 'CO-16',
    description: 'Claim lacks patient demographic / member ID agreement with payer eligibility database',
    claims_affected: 185,
    dollar_volume: 198000.00,
    primary_procedure: '99214 (Office Visit)',
    payer_name: 'UnitedHealthcare',
    root_cause: 'Front desk intake transcribes member numbers without performing OCR verification or real-time 270/271 check.',
    preventive_rule: 'Require mandatory OCR card upload validation prior to check-in status confirmation.',
    rule_enabled: true
  },
  {
    id: 'pat-den-003',
    reason_code: 'CO-27',
    description: 'Expenses incurred after coverage terminated date',
    claims_affected: 92,
    dollar_volume: 310000.00,
    primary_procedure: '27447 (Total Knee Replacement)',
    payer_name: 'Cigna Health',
    root_cause: 'Recurring eligibility re-verifications were not scheduled 48 hours prior to surgical encounters.',
    preventive_rule: 'Auto-verify active policy status via 270 real-time query 48 hours prior to all surgical admissions.',
    rule_enabled: true
  },
  {
    id: 'pat-den-004',
    reason_code: 'CO-96',
    description: 'Non-covered charge(s) or procedure limitation reached',
    claims_affected: 64,
    dollar_volume: 85000.00,
    primary_procedure: '11102 (Skin Biopsy)',
    payer_name: 'Humana',
    root_cause: 'Clinical notes missing dysplastic diagnosis code prior to procedure billing.',
    preventive_rule: 'Trigger medical necessity documentation request if procedure code lacks secondary diagnostic support.',
    rule_enabled: false
  }
];

export const mockPendingWorkflows: WorkflowTask[] = [
  {
    workflow_id: 'wf-001',
    patient_id: 'pat-001-carter',
    appointment_id: 'apt-001',
    task_type: 'AUTOMATED_PRIOR_AUTH_SUBMISSION',
    title: 'Prior Auth Task: MRI Brain (70551)',
    description: 'Automated authorization request initiated with BlueCross payer portal for John Carter.',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    created_at: '2026-09-03T09:15:00Z'
  },
  {
    workflow_id: 'wf-002',
    patient_id: 'pat-003-brown',
    appointment_id: 'apt-003',
    task_type: 'MEMBER_ID_VERIFICATION_ALERT',
    title: 'EHR Record Update: Member ID Mismatch',
    description: 'Registrar action task dispatched to verify card scan vs EHR value for Michael Brown.',
    priority: 'HIGH',
    status: 'PENDING',
    created_at: '2026-09-03T10:10:00Z'
  },
  {
    workflow_id: 'wf-003',
    patient_id: 'pat-004-rostova',
    appointment_id: 'apt-004',
    task_type: 'FINANCIAL_COUNSELOR_OUTREACH',
    title: 'Urgent Patient Outreach: Terminated Policy',
    description: 'Financial counselor assigned to obtain active replacement coverage for Elena Rostova.',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    created_at: '2026-09-03T10:15:00Z'
  }
];

export const mockOcrSampleResult = {
  extracted_data: {
    payer_name: 'BlueCross BlueShield of Illinois',
    member_id: 'BC-99823041',
    policy_number: 'POL-7738210',
    group_number: 'GRP-4401',
    patient_name: 'John Carter',
    date_of_birth: '1978-05-14'
  },
  ocr_confidence: 0.96
};

export const mockValidationSampleResult: ValidationResult = {
  patient_id: 'pat-001-carter',
  validation_status: 'PARTIAL_MATCH',
  field_validations: [
    { field_name: 'Payer Name', ocr_value: 'BlueCross BlueShield of Illinois', ehr_value: 'BlueCross BlueShield', status: 'MATCH' },
    { field_name: 'Member ID', ocr_value: 'BC-99823041', ehr_value: 'BC-99823014', status: 'MISMATCH' },
    { field_name: 'Policy Number', ocr_value: 'POL-7738210', ehr_value: 'POL-7738210', status: 'MATCH' },
    { field_name: 'Group Number', ocr_value: 'GRP-4401', ehr_value: 'GRP-4401', status: 'MATCH' },
    { field_name: 'Patient Name', ocr_value: 'John Carter', ehr_value: 'John Carter', status: 'MATCH' },
    { field_name: 'Date of Birth', ocr_value: '1978-05-14', ehr_value: '1978-05-14', status: 'MATCH' }
  ]
};
