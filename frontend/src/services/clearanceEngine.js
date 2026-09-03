import {
  mockClearanceItems,
  mockDossiers,
  mockRiskEvaluations,
  mockCardSamples,
  mockDenialCategories,
  mockPayerStats,
  mockPreventiveRules
} from '../data/mockData.js';

class ClearanceStore {
  constructor() {
    this.queue = JSON.parse(JSON.stringify(mockClearanceItems));
    this.dossiers = JSON.parse(JSON.stringify(mockDossiers));
    this.riskEvaluations = JSON.parse(JSON.stringify(mockRiskEvaluations));
    this.cardSamples = JSON.parse(JSON.stringify(mockCardSamples));
    this.denialCategories = JSON.parse(JSON.stringify(mockDenialCategories));
    this.payerStats = JSON.parse(JSON.stringify(mockPayerStats));
    this.rules = JSON.parse(JSON.stringify(mockPreventiveRules));
    this.activePatientId = 'PAT-1082';
  }

  getQueue() {
    return this.queue;
  }

  getPatientDossier(patientId) {
    return this.dossiers[patientId] || this.createFallbackDossier(patientId);
  }

  getRiskEvaluation(patientId) {
    return this.riskEvaluations[patientId] || this.createFallbackRisk(patientId);
  }

  getCardSamples() {
    return this.cardSamples;
  }

  getDenialCategories() {
    return this.denialCategories;
  }

  getPayerStats() {
    return this.payerStats;
  }

  getRules() {
    return this.rules;
  }

  getActivePatientId() {
    return this.activePatientId;
  }

  setActivePatientId(id) {
    this.activePatientId = id;
  }

  toggleRule(ruleId) {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = !rule.enabled;
      return rule.enabled;
    }
    return false;
  }

  // Live Interactive Action: Approve Prior Auth for Patient
  approvePriorAuth(patientId, authNumber = 'AUTH-PA-2026-X99') {
    const queueItem = this.queue.find(q => q.patient_id === patientId);
    if (queueItem) {
      queueItem.authorization_status = 'APPROVED';
      queueItem.auth_number = authNumber;
      queueItem.clearance_status = 'CLEARED';
      queueItem.risk_score = 15;
      queueItem.risk_level = 'LOW';
      queueItem.primary_blocker = undefined;
      queueItem.recommended_actions = ['Prior Auth approved and recorded. Encounter is financially cleared.'];
    }

    const dossier = this.dossiers[patientId];
    if (dossier) {
      dossier.prior_auth.status = 'APPROVED';
      dossier.prior_auth.auth_number = authNumber;
      dossier.clearance.status = 'CLEARED';
      dossier.clearance.risk_score = 15;
      dossier.clearance.risk_level = 'LOW';
      dossier.clearance.flags = [];
      dossier.clearance.recommended_actions = ['Encounters are cleared for CPT ' + dossier.appointment.cpt_code];
    }

    const risk = this.riskEvaluations[patientId];
    if (risk) {
      risk.composite_score = 15;
      risk.risk_level = 'LOW';
      risk.top_denial_probability = 0.05;
      risk.explanation = 'Prior authorization confirmed active. Low financial risk.';
      risk.factors = risk.factors.map(f => {
        if (f.category === 'AUTHORIZATION') {
          return { ...f, scoreContribution: 0, status: 'PASS', description: `Approved auth #${authNumber}` };
        }
        return f;
      });
    }
  }

  // Live Interactive Action: Sync OCR Card Data to Hospital Master
  syncCardOcr(sampleId) {
    const card = this.cardSamples.find(c => c.id === sampleId);
    if (card) {
      card.fields = card.fields.map(f => ({
        ...f,
        hospitalValue: f.ocrValue,
        status: 'MATCH'
      }));

      if (sampleId === 'sample-uhc-mismatch') {
        const item = this.queue.find(q => q.patient_id === 'PAT-3301');
        if (item) {
          item.member_id = 'UHC-7712399-01';
          item.data_validation_status = 'MATCH';
          item.clearance_status = 'CLEARED';
          item.risk_score = 14;
          item.risk_level = 'LOW';
          item.primary_blocker = undefined;
          item.recommended_actions = ['Member ID synchronized with OCR verification.'];
        }
      }
    }
  }

  createFallbackDossier(patientId) {
    const item = this.queue.find(q => q.patient_id === patientId);
    return {
      patient_id: patientId,
      first_name: item?.patient_name.split(' ')[0] || 'Patient',
      last_name: item?.patient_name.split(' ').slice(1).join(' ') || 'Record',
      dob: item?.dob || '1985-01-01',
      phone: '(555) 000-1122',
      email: `${patientId.toLowerCase()}@hospital.org`,
      address: '100 Medical Center Way, Suite 400',
      insurance: {
        payer_id: 'PAYER-01',
        payer_name: item?.payer_name || 'Commercial Payer',
        plan_name: 'Standard Comprehensive Plan',
        member_id: item?.member_id || 'MEM-000',
        group_number: item?.group_number || 'GRP-000',
        policy_status: item?.eligibility_status || 'ACTIVE',
        effective_date: '2026-01-01',
        expiration_date: '2026-12-31',
        in_network: true
      },
      appointment: {
        appointment_id: item?.appointment_id || 'APT-000',
        datetime: item?.appointment_datetime || '2026-09-04 10:00 AM',
        department: 'Specialty Outpatient Clinic',
        provider_name: 'Attending Physician, MD',
        cpt_code: item?.procedure_code || '99213',
        service_description: item?.procedure_name || 'Clinical Encounter'
      },
      financials: {
        total_estimated_cost: 350.00,
        deductible_total: 1000.00,
        deductible_remaining: 150.00,
        copay_amount: 25.00,
        coinsurance_percentage: 10,
        coinsurance_amount: 20.00,
        estimated_patient_responsibility: item?.estimated_patient_responsibility || 45.00,
        estimated_payer_responsibility: 305.00
      },
      prior_auth: {
        required: item?.authorization_status !== 'NOT_REQUIRED',
        status: item?.authorization_status || 'NOT_REQUIRED',
        auth_number: item?.auth_number
      },
      clearance: {
        status: item?.clearance_status || 'CLEARED',
        risk_score: item?.risk_score || 20,
        risk_level: item?.risk_level || 'LOW',
        data_validation_status: item?.data_validation_status || 'MATCH',
        flags: item?.primary_blocker ? [item.primary_blocker] : [],
        recommended_actions: item?.recommended_actions || ['Proceed with standard check-in']
      }
    };
  }

  createFallbackRisk(patientId) {
    const item = this.queue.find(q => q.patient_id === patientId);
    return {
      patient_id: patientId,
      composite_score: item?.risk_score || 25,
      risk_level: item?.risk_level || 'LOW',
      top_denial_probability: ((item?.risk_score || 25) / 100) * 0.85,
      explanation: item?.primary_blocker || 'Baseline eligibility and insurance parameters validated.',
      factors: [
        {
          id: 'rf-fallback-1',
          name: 'Policy Status Active',
          category: 'ELIGIBILITY',
          weight: 0.35,
          scoreContribution: item?.eligibility_status === 'ACTIVE' ? 5 : 45,
          description: 'Payer 270/271 real-time inquiry response.',
          status: item?.eligibility_status === 'ACTIVE' ? 'PASS' : 'FAIL'
        },
        {
          id: 'rf-fallback-2',
          name: 'Prior Authorization Status',
          category: 'AUTHORIZATION',
          weight: 0.35,
          scoreContribution: item?.authorization_status === 'REQUIRED' ? 40 : 5,
          description: `Authorization is ${item?.authorization_status || 'NOT_REQUIRED'}.`,
          status: item?.authorization_status === 'REQUIRED' ? 'FAIL' : 'PASS'
        }
      ]
    };
  }
}

export const clearanceStore = new ClearanceStore();
