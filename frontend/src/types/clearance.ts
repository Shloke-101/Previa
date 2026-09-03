export type ClearanceStatus = 'CLEARED' | 'NEEDS_ACTION' | 'HIGH_RISK';
export type ValidationStatus = 'MATCH' | 'PARTIAL_MATCH' | 'MISMATCH';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type AuthorizationStatus = 'NOT_REQUIRED' | 'REQUIRED' | 'PENDING' | 'APPROVED' | 'DENIED';

export interface ClearanceItem {
  patient_id: string;
  patient_name: string;
  dob: string;
  appointment_id: string;
  appointment_datetime: string;
  procedure_code: string;
  procedure_name: string;
  payer_name: string;
  member_id: string;
  group_number: string;
  clearance_status: ClearanceStatus;
  risk_score: number;
  risk_level: RiskLevel;
  eligibility_status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  authorization_status: AuthorizationStatus;
  auth_number?: string;
  data_validation_status: ValidationStatus;
  estimated_patient_responsibility: number;
  primary_blocker?: string;
  recommended_actions: string[];
}
