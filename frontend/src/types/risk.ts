import { RiskLevel } from './clearance';

export interface RiskFactor {
  id: string;
  name: string;
  category: 'ELIGIBILITY' | 'AUTHORIZATION' | 'DATA_MISMATCH' | 'NETWORK' | 'HISTORICAL';
  weight: number;
  scoreContribution: number;
  description: string;
  status: 'FAIL' | 'WARNING' | 'PASS';
}

export interface RiskEvaluation {
  patient_id: string;
  composite_score: number; // 0 to 100
  risk_level: RiskLevel;
  factors: RiskFactor[];
  top_denial_probability: number;
  explanation: string;
}
