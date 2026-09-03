// Canonical Domain Interfaces matching contracts/*.schema.json

export type ClearanceStatus = 'CLEARED' | 'NEEDS_ACTION' | 'HIGH_RISK';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ValidationStatus = 'MATCH' | 'PARTIAL_MATCH' | 'MISMATCH';
export type AuthorizationStatus = 'NOT_REQUIRED' | 'REQUIRED' | 'PENDING' | 'APPROVED' | 'DENIED';
export type ActionPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ActionStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';

export type ProblemCode =
  | 'MEMBER_ID_MISMATCH'
  | 'INACTIVE_POLICY'
  | 'EXPIRED_POLICY'
  | 'MISSING_AUTHORIZATION'
  | 'OUT_OF_NETWORK'
  | 'MISSING_REFERRAL'
  | 'NON_COVERED_SERVICE'
  | 'DATA_ENTRY_ERROR';

export type ActionType =
  | 'UPDATE_EHR_RECORD'
  | 'REQUEST_PRIOR_AUTH'
  | 'CONTACT_PAYER'
  | 'REQUEST_REFERRAL'
  | 'COLLECT_COPAY_PREPAYMENT'
  | 'OBTAIN_SECONDARY_INSURANCE';

export type FactorCode =
  | 'inactive_insurance'
  | 'expired_policy'
  | 'missing_authorization'
  | 'critical_member_id_mismatch'
  | 'policy_number_mismatch'
  | 'dob_mismatch'
  | 'out_of_network'
  | 'policy_expiring_soon'
  | 'minor_name_mismatch'
  | 'coverage_restriction'
  | 'missing_referral';

export interface Patient {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  email?: string;
  mrn: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  created_at?: string;
}

export interface InsurancePolicy {
  insurance_policy_id: string;
  patient_id: string;
  payer_name: string;
  payer_id: string;
  member_id: string;
  policy_number: string;
  group_number?: string;
  policy_status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'PENDING';
  start_date: string;
  end_date: string;
  network_tier: 'IN_NETWORK' | 'OUT_OF_NETWORK' | 'TIER_2';
  relationship_to_subscriber?: string;
}

export interface Appointment {
  appointment_id: string;
  patient_id: string;
  insurance_policy_id?: string;
  appointment_time: string;
  provider_name: string;
  department: string;
  procedure_code: string;
  procedure_description: string;
  estimated_cost: number;
  location: string;
  status: 'SCHEDULED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  clearance_status?: ClearanceStatus;
  risk_score?: number;
}

export interface EligibilityVerification {
  verification_id: string;
  patient_id: string;
  insurance_policy_id: string;
  is_eligible: boolean;
  status_code: string;
  status_message: string;
  effective_date: string;
  termination_date?: string;
  verified_at: string;
}

export interface CoverageCheck {
  coverage_id: string;
  patient_id: string;
  procedure_code: string;
  is_covered: boolean;
  prior_authorization_required: boolean;
  limitations?: string[];
  checked_at: string;
}

export interface FinancialEstimate {
  estimate_id: string;
  patient_id: string;
  appointment_id: string;
  total_procedure_cost: number;
  insurance_estimated_payment: number;
  estimated_patient_responsibility: number;
  deductible_total: number;
  deductible_remaining: number;
  copay_amount: number;
  coinsurance_percentage: number;
  calculated_at: string;
}

export interface RiskFactor {
  factor_code: FactorCode;
  reason: string;
  impact: number;
}

export interface RiskAssessment {
  assessment_id: string;
  patient_id: string;
  appointment_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  factors: RiskFactor[];
  summary_explanation: string;
  evaluated_at: string;
}

export interface RecommendedAction {
  action_id: string;
  patient_id: string;
  appointment_id: string;
  problem_code: ProblemCode;
  action_type: ActionType;
  priority: ActionPriority;
  recommended_step: string;
  assigned_role: 'REGISTRAR' | 'FINANCIAL_COUNSELOR' | 'AUTH_SPECIALIST' | 'BILLING';
  status: ActionStatus;
  resolution_note?: string;
  created_at: string;
  resolved_at?: string | null;
}

export interface ClearanceEvaluation {
  clearance_id: string;
  patient_id: string;
  appointment_id: string;
  clearance_status: ClearanceStatus;
  risk_score: number;
  risk_level: RiskLevel;
  is_blocked: boolean;
  blocking_reasons: string[];
  eligibility_verified: boolean;
  coverage_verified: boolean;
  authorization_satisfied: boolean;
  validation_passed: boolean;
  estimated_patient_responsibility: number;
  priority_rank?: number;
  evaluated_at: string;
  evaluated_by?: string;
}

export interface DashboardSummary {
  total_upcoming_patients: number;
  cleared_count: number;
  needs_action_count: number;
  high_risk_count: number;
  pending_verification_count: number;
  potential_financial_exposure: number;
  prevented_denial_dollars: number;
}

export interface PriorityQueueItem {
  patient: Patient;
  appointment: Appointment;
  insurance: InsurancePolicy;
  clearance: ClearanceEvaluation;
  risk: RiskAssessment;
  recommended_actions: RecommendedAction[];
  primary_issue: string;
}

export interface OcrExtractionResult {
  extracted_data: {
    payer_name: string;
    member_id: string;
    policy_number: string;
    group_number: string;
    patient_name: string;
    date_of_birth: string;
  };
  ocr_confidence: number;
}

export interface ValidationField {
  field_name: string;
  ocr_value: string;
  ehr_value: string;
  status: ValidationStatus;
}

export interface ValidationResult {
  patient_id: string;
  validation_status: ValidationStatus;
  field_validations: ValidationField[];
}

export interface DenialPattern {
  id: string;
  reason_code: string;
  description: string;
  claims_affected: number;
  dollar_volume: number;
  primary_procedure: string;
  payer_name: string;
  root_cause: string;
  preventive_rule: string;
  rule_enabled: boolean;
}

export interface WorkflowTask {
  workflow_id: string;
  patient_id: string;
  appointment_id: string;
  task_type: string;
  title: string;
  description: string;
  priority: ActionPriority;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  created_at: string;
}
