import { ClearanceStatus, AuthorizationStatus, ValidationStatus, RiskLevel } from './clearance';

export interface PatientDossier {
  patient_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  
  // Insurance Details
  insurance: {
    payer_id: string;
    payer_name: string;
    plan_name: string;
    member_id: string;
    group_number: string;
    policy_status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'TERMINATED';
    effective_date: string;
    expiration_date: string;
    in_network: boolean;
  };

  // Appointment & Clinical
  appointment: {
    appointment_id: string;
    datetime: string;
    department: string;
    provider_name: string;
    cpt_code: string;
    service_description: string;
  };

  // Financial Estimation
  financials: {
    total_estimated_cost: number;
    deductible_total: number;
    deductible_remaining: number;
    copay_amount: number;
    coinsurance_percentage: number;
    coinsurance_amount: number;
    estimated_patient_responsibility: number;
    estimated_payer_responsibility: number;
  };

  // Prior Authorization
  prior_auth: {
    required: boolean;
    status: AuthorizationStatus;
    auth_number?: string;
    submitted_date?: string;
    expiration_date?: string;
    notes?: string;
  };

  // Clearance & Risk
  clearance: {
    status: ClearanceStatus;
    risk_score: number;
    risk_level: RiskLevel;
    data_validation_status: ValidationStatus;
    flags: string[];
    recommended_actions: string[];
  };
}
