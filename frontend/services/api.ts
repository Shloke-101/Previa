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
  OcrExtractionResult,
  ValidationResult
} from '../types';

import {
  mockPatients,
  mockAppointments,
  mockInsurancePolicies,
  mockRiskAssessments,
  mockClearanceEvaluations,
  mockRecommendedActions,
  mockDashboardSummary,
  mockPriorityQueue,
  mockDenialPatterns,
  mockPendingWorkflows,
  mockOcrSampleResult,
  mockValidationSampleResult
} from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

// Generic helper with automatic fallback to mock data on network error
async function fetchWithFallback<T>(endpoint: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  if (USE_MOCK) {
    // Artificial realistic delay for UI smoothness
    await new Promise(resolve => setTimeout(resolve, 150));
    if (fallbackData !== undefined) return fallbackData;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.warn(`[PREVIA API] Call to ${endpoint} failed or backend unavailable. Falling back to mock adapter.`, error);
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw error;
  }
}

export const PreviaAPI = {
  // Patients
  getPatients: async (search?: string): Promise<Patient[]> => {
    let list = mockPatients;
    if (search && search.trim() !== '') {
      const query = search.toLowerCase();
      list = list.filter(
        p =>
          p.first_name.toLowerCase().includes(query) ||
          p.last_name.toLowerCase().includes(query) ||
          p.patient_id.toLowerCase().includes(query) ||
          p.mrn.toLowerCase().includes(query)
      );
    }
    return fetchWithFallback<Patient[]>(`/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`, { method: 'GET' }, list);
  },

  getPatientById: async (patientId: string): Promise<{ patient: Patient; insurance: InsurancePolicy; appointment: Appointment } | null> => {
    const patient = mockPatients.find(p => p.patient_id === patientId);
    if (!patient) return null;
    const insurance = mockInsurancePolicies[patientId];
    const appointment = mockAppointments[patientId];
    const mockDetail = { patient, insurance, appointment };

    return fetchWithFallback<{ patient: Patient; insurance: InsurancePolicy; appointment: Appointment }>(
      `/patients/${patientId}`,
      { method: 'GET' },
      mockDetail
    );
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    const list = Object.values(mockAppointments);
    return fetchWithFallback<Appointment[]>('/appointments', { method: 'GET' }, list);
  },

  // OCR Upload (Insurance Card)
  uploadInsuranceCardOcr: async (patientId: string, cardImage: File | Blob): Promise<OcrExtractionResult> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate OCR extraction processing delay
      return mockOcrSampleResult;
    }

    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('card_image', cardImage);

    try {
      const res = await fetch(`${API_BASE_URL}/ocr/insurance-card`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('OCR Upload failed');
      return await res.json();
    } catch {
      return mockOcrSampleResult;
    }
  },

  // Validation
  validateInsuranceCard: async (patientId: string, cardData: Record<string, unknown>): Promise<ValidationResult> => {
    return fetchWithFallback<ValidationResult>(
      '/validation/insurance',
      {
        method: 'POST',
        body: JSON.stringify({ patient_id: patientId, card_data: cardData }),
      },
      mockValidationSampleResult
    );
  },

  // Risk Assessment
  getRiskAssessment: async (patientId: string, appointmentId: string): Promise<RiskAssessment> => {
    const mockRisk = mockRiskAssessments[patientId] || {
      assessment_id: `risk-${Date.now()}`,
      patient_id: patientId,
      appointment_id: appointmentId,
      risk_score: 15,
      risk_level: 'LOW',
      factors: [],
      summary_explanation: 'Standard low-risk profile.',
      evaluated_at: new Date().toISOString(),
    };

    return fetchWithFallback<RiskAssessment>(
      '/risk/evaluate',
      {
        method: 'POST',
        body: JSON.stringify({ patient_id: patientId, appointment_id: appointmentId }),
      },
      mockRisk
    );
  },

  // Clearance Evaluation
  getClearanceEvaluation: async (patientId: string, appointmentId: string): Promise<ClearanceEvaluation> => {
    const mockClearance = mockClearanceEvaluations[patientId] || {
      clearance_id: `clr-${Date.now()}`,
      patient_id: patientId,
      appointment_id: appointmentId,
      clearance_status: 'CLEARED',
      risk_score: 15,
      risk_level: 'LOW',
      is_blocked: false,
      blocking_reasons: [],
      eligibility_verified: true,
      coverage_verified: true,
      authorization_satisfied: true,
      validation_passed: true,
      estimated_patient_responsibility: 25.00,
      evaluated_at: new Date().toISOString(),
    };

    return fetchWithFallback<ClearanceEvaluation>(
      `/clearance/${patientId}`,
      { method: 'GET' },
      mockClearance
    );
  },

  // Re-verify Clearance
  evaluateClearance: async (patientId: string, appointmentId: string): Promise<ClearanceEvaluation> => {
    // If mock, we simulate resolving blockers
    const existing = mockClearanceEvaluations[patientId];
    let updated: ClearanceEvaluation;
    if (existing) {
      updated = {
        ...existing,
        clearance_status: 'CLEARED',
        risk_score: 18,
        risk_level: 'LOW',
        is_blocked: false,
        blocking_reasons: [],
        authorization_satisfied: true,
        validation_passed: true,
        evaluated_at: new Date().toISOString(),
      };
      mockClearanceEvaluations[patientId] = updated;
      if (mockAppointments[patientId]) {
        mockAppointments[patientId].clearance_status = 'CLEARED';
        mockAppointments[patientId].risk_score = 18;
      }
    } else {
      updated = {
        clearance_id: `clr-${Date.now()}`,
        patient_id: patientId,
        appointment_id: appointmentId,
        clearance_status: 'CLEARED',
        risk_score: 15,
        risk_level: 'LOW',
        is_blocked: false,
        blocking_reasons: [],
        eligibility_verified: true,
        coverage_verified: true,
        authorization_satisfied: true,
        validation_passed: true,
        estimated_patient_responsibility: 25.00,
        evaluated_at: new Date().toISOString(),
      };
    }

    return fetchWithFallback<ClearanceEvaluation>(
      '/clearance/evaluate',
      {
        method: 'POST',
        body: JSON.stringify({ patient_id: patientId, appointment_id: appointmentId }),
      },
      updated
    );
  },

  // Recommended Actions
  getRecommendedActions: async (patientId: string): Promise<RecommendedAction[]> => {
    const mockActions = mockRecommendedActions[patientId] || [];
    return fetchWithFallback<RecommendedAction[]>(
      `/recommendations?patient_id=${patientId}`,
      { method: 'GET' },
      mockActions
    );
  },

  // Resolve Action
  resolveAction: async (actionId: string, note?: string): Promise<{ success: boolean }> => {
    // Local mock update
    Object.keys(mockRecommendedActions).forEach(key => {
      mockRecommendedActions[key] = mockRecommendedActions[key].map(act => {
        if (act.action_id === actionId) {
          return { ...act, status: 'RESOLVED', resolution_note: note || 'Resolved by registrar', resolved_at: new Date().toISOString() };
        }
        return act;
      });
    });

    return { success: true };
  },

  // Dashboard APIs
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    return fetchWithFallback<DashboardSummary>('/dashboard/summary', { method: 'GET' }, mockDashboardSummary);
  },

  getPriorityQueue: async (): Promise<PriorityQueueItem[]> => {
    return fetchWithFallback<PriorityQueueItem[]>('/dashboard/priority', { method: 'GET' }, mockPriorityQueue);
  },

  // Denial Analytics & Root Causes
  getDenialPatterns: async (): Promise<DenialPattern[]> => {
    return fetchWithFallback<DenialPattern[]>('/analytics/denials', { method: 'GET' }, mockDenialPatterns);
  },

  togglePreventiveRule: async (ruleId: string, enabled: boolean): Promise<DenialPattern[]> => {
    const target = mockDenialPatterns.find(d => d.id === ruleId);
    if (target) {
      target.rule_enabled = enabled;
    }
    return mockDenialPatterns;
  },

  // Pending Workflows
  getPendingWorkflows: async (): Promise<WorkflowTask[]> => {
    return fetchWithFallback<WorkflowTask[]>('/workflows/pending', { method: 'GET' }, mockPendingWorkflows);
  }
};
