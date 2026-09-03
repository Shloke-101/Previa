'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '../../../components/layout/Header';
import { ClearanceBadge } from '../../../components/common/ClearanceBadge';
import { RiskMeter } from '../../../components/common/RiskMeter';
import { InsuranceCardOcr } from '../../../components/common/InsuranceCardOcr';
import { PreviaAPI } from '../../../services/api';
import {
  Patient,
  Appointment,
  InsurancePolicy,
  ClearanceEvaluation,
  RiskAssessment,
  RecommendedAction
} from '../../../types';
import {
  User,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowLeft,
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';

export default function PatientDetailsPage() {
  const params = useParams();
  const patientId = (params.id as string) || 'pat-001-carter';

  const [patient, setPatient] = useState<Patient | null>(null);
  const [insurance, setInsurance] = useState<InsurancePolicy | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [clearance, setClearance] = useState<ClearanceEvaluation | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [actions, setActions] = useState<RecommendedAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [reverifying, setReverifying] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatientDossier() {
      setLoading(true);
      try {
        const detail = await PreviaAPI.getPatientById(patientId);
        if (detail) {
          setPatient(detail.patient);
          setInsurance(detail.insurance);
          setAppointment(detail.appointment);

          const apptId = detail.appointment?.appointment_id || 'apt-001';
          const [clr, rsk, actList] = await Promise.all([
            PreviaAPI.getClearanceEvaluation(patientId, apptId),
            PreviaAPI.getRiskAssessment(patientId, apptId),
            PreviaAPI.getRecommendedActions(patientId),
          ]);

          setClearance(clr);
          setRisk(rsk);
          setActions(actList);
        }
      } catch (err) {
        console.error('Failed to load dossier', err);
      } finally {
        setLoading(false);
      }
    }
    loadPatientDossier();
  }, [patientId]);

  const handleReverify = async () => {
    if (!appointment) return;
    setReverifying(true);
    try {
      const updatedClr = await PreviaAPI.evaluateClearance(patientId, appointment.appointment_id);
      setClearance(updatedClr);
      // Refresh risk assessment & actions
      const rsk = await PreviaAPI.getRiskAssessment(patientId, appointment.appointment_id);
      const actList = await PreviaAPI.getRecommendedActions(patientId);
      setRisk(rsk);
      setActions(actList);
    } catch (err) {
      console.error('Re-verification failed', err);
    } finally {
      setReverifying(false);
    }
  };

  const handleResolveAction = async (actionId: string) => {
    setResolvingId(actionId);
    try {
      await PreviaAPI.resolveAction(actionId, 'Resolved by registrar in dossier view');
      setActions(prev => prev.map(a => a.action_id === actionId ? { ...a, status: 'RESOLVED' } : a));
    } catch (err) {
      console.error('Failed to resolve action', err);
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
        <Header title="Patient Clearance Dossier" />
        <div className="p-12 text-center text-slate-400 font-semibold">
          Loading patient dossier & clearance evaluation...
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
        <Header title="Patient Clearance Dossier" />
        <div className="p-12 text-center text-slate-500 font-semibold space-y-4">
          <p>Patient record not found.</p>
          <Link href="/patients" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold inline-block">
            Return to Patients List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        title={`${patient.first_name} ${patient.last_name}`}
        subtitle={`MRN: ${patient.mrn} • Pre-Visit Financial Clearance Dossier`}
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Navigation & Operational Clearance Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/patients" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to Patient List
          </Link>

          <div className="flex items-center gap-4 bg-white p-3 px-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase">Operational Status:</span>
            <ClearanceBadge status={clearance?.clearance_status} size="lg" />
            <button
              onClick={handleReverify}
              disabled={reverifying}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reverifying ? 'animate-spin' : ''}`} />
              {reverifying ? 'Re-evaluating...' : 'Re-verify Clearance'}
            </button>
          </div>
        </div>

        {/* 3-Column Info Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Patient Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Patient Demographics</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-bold text-slate-900">{patient.first_name} {patient.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date of Birth:</span>
                <span className="font-mono font-semibold text-slate-800">{patient.date_of_birth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient ID / MRN:</span>
                <span className="font-mono font-bold text-brand-700">{patient.mrn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="text-slate-800">{patient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="text-slate-800 text-right">{patient.address?.street}, {patient.address?.city}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Appointment Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar className="w-5 h-5 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Encounter Appointment</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Appointment ID:</span>
                <span className="font-mono text-slate-800">{appointment?.appointment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Procedure Code:</span>
                <span className="font-mono font-bold text-brand-700">{appointment?.procedure_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Description:</span>
                <span className="font-semibold text-slate-900 text-right">{appointment?.procedure_description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Attending Provider:</span>
                <span className="text-slate-800">{appointment?.provider_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-semibold text-slate-900">{appointment?.appointment_time ? new Date(appointment.appointment_time).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Insurance Policy Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Payer & Policy Details</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Insurance Provider:</span>
                <span className="font-bold text-slate-900">{insurance?.payer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Member ID:</span>
                <span className="font-mono font-bold text-brand-700">{insurance?.member_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Policy Number:</span>
                <span className="font-mono text-slate-800">{insurance?.policy_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Network Tier:</span>
                <span className="font-semibold text-slate-800">{insurance?.network_tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Effective Cycle:</span>
                <span className="font-mono text-slate-800">{insurance?.start_date} to {insurance?.end_date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Checkpoints & Financial Estimates Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Multi-Point Verification Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Multi-Point Clearance Verification</h3>
              <span className="text-[11px] font-semibold text-slate-400">Automated Rules Check</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Eligibility */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-800">1. Real-Time Eligibility Verification</span>
                {clearance?.eligibility_verified ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE & ELIGIBLE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3.5 h-3.5" /> INACTIVE / UNVERIFIED
                  </span>
                )}
              </div>

              {/* Coverage */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-800">2. Procedure Code Coverage (CPT {appointment?.procedure_code})</span>
                {clearance?.coverage_verified ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" /> BENEFIT COVERED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3.5 h-3.5" /> RESTRICTED / NON-COVERED
                  </span>
                )}
              </div>

              {/* Authorization */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-800">3. Prior Authorization Requirement</span>
                {clearance?.authorization_satisfied ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" /> AUTH APPROVED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3.5 h-3.5" /> MISSING PRIOR AUTH
                  </span>
                )}
              </div>

              {/* Validation */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-800">4. Insurance Card OCR Validation</span>
                {clearance?.validation_passed ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" /> FIELDS MATCH EHR
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3.5 h-3.5" /> FIELD DISCREPANCY
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Financial Responsibility Estimates */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Financial Responsibility Estimate</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Pre-Visit Calculation</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Total Billed Procedure Cost:</span>
                <span className="font-mono font-bold text-slate-900">${appointment?.estimated_cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Deductible Remaining:</span>
                <span className="font-mono text-slate-800">$250.00</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Standard Encounter Copay:</span>
                <span className="font-mono text-slate-800">$50.00</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Coinsurance (20%):</span>
                <span className="font-mono text-slate-800">$150.00</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 uppercase text-xs">Estimated Out-of-Pocket:</span>
                <span className="text-xl font-black text-brand-700 font-mono">
                  ${clearance?.estimated_patient_responsibility.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Meter Component */}
        <RiskMeter assessment={risk || undefined} />

        {/* Recommended Actions Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Prescriptive Staff Recommended Actions
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Staff Remediation Guidance
            </span>
          </div>

          {actions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              No pending corrective actions required. All clearance checks satisfied.
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((act) => (
                <div
                  key={act.action_id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    act.status === 'RESOLVED' ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 font-bold rounded text-[10px] ${
                        act.priority === 'URGENT' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {act.priority}
                      </span>
                      <span className="font-mono font-bold text-slate-800">{act.problem_code}</span>
                      <span className="text-slate-400">• Role: {act.assigned_role}</span>
                    </div>
                    <p className="font-medium text-slate-900 text-xs leading-relaxed">{act.recommended_step}</p>
                    {act.resolution_note && (
                      <p className="text-[11px] text-emerald-700 font-medium">✓ {act.resolution_note}</p>
                    )}
                  </div>

                  {act.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => handleResolveAction(act.action_id)}
                      disabled={resolvingId === act.action_id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      {resolvingId === act.action_id ? 'Resolving...' : 'Mark Resolved'}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
                      ✓ RESOLVED
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insurance Card Upload Modal Component embedded */}
        <InsuranceCardOcr patientId={patient.patient_id} />
      </div>
    </div>
  );
}
