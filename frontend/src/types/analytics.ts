export interface DenialCategoryStat {
  code: string;
  category: string;
  count: number;
  preventablePercentage: number;
  color: string;
}

export interface PayerDenialStat {
  payerName: string;
  denialRate: number;
  topDenialReason: string;
  avgResolutionDays: number;
}

export interface PreventiveRule {
  id: string;
  title: string;
  description: string;
  triggerType: 'TIME_BASED' | 'EVENT_BASED' | 'THRESHOLD';
  triggerCondition: string;
  action: string;
  enabled: boolean;
  preventedCountThisMonth: number;
}
