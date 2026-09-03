'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { ClearanceBadge } from '../../components/common/ClearanceBadge';
import { PreviaAPI } from '../../services/api';
import { ClearanceEvaluation, Patient } from '../../types';
import { ShieldCheck, RefreshCw, AlertOctagon, CheckCircle2, ArrowRight, Shield } from 'lucide-react';

export default function ClearancePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-001-carter');
  const [clearance, setClearance] = useState<ClearanceEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const pList = await PreviaAPI.getPatients();
        setPatients(pList);
        if (pList.length > 0) {
          const clr = await PreviaAPI.getClearanceEvaluation(pList[0].patient_id, 'apt-001');
          setClearance(clr);
        }
      } catch (err) {
        console.error('Failed clearance init', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleSelectPatient = async (pid: string) => {
    setSelectedPatientId(pid);
    setLoading(true);
    try {
      const clr = await PreviaAPI.getClearanceEvaluation(pid, 'apt-001');
      setClearance(clr);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const updatedClr = await PreviaAPI.evaluateClearance(selectedPatientId, 'apt-001');
      setClearance(updatedClr);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Pre-Visit Clearance Engine"
        subtitle="Deterministic rules-based multi-point pre-encounter evaluation simulator"
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top Control Selector Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Select Patient Encounter for Live Evaluation</span>
            <select
              value={selectedPatientId}
              onChange={(e) => handleSelectPatient(e.target.value)}
              className="bg-slate-50 border border-slate-300 font-bold text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {patients.map(p => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.first_name} {p.last_name} ({p.mrn})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRunEvaluation}
              disabled={evaluating}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-brand-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
              {evaluating ? 'Executing Clearance Pipeline...' : 'Run Operational Clearance Engine'}
            </button>
          </div>
        </div>

        {/* Clearance Determination Banner */}
        {clearance && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Evaluation Determination Result</span>
                  <div className="flex items-center gap-3 mt-1">
                    <ClearanceBadge status={clearance.clearance_status} size="lg" />
                    <span className="text-sm font-semibold text-slate-500">Risk Score: {clearance.risk_score}/100</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">Evaluated At: {new Date(clearance.evaluated_at).toLocaleString()}</span>
                <span className="text-xs font-bold text-brand-700 block font-mono">{clearance.evaluated_by}</span>
              </div>
            </div>

            {/* Checkpoints Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border ${clearance.eligibility_verified ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <span className="text-xs font-bold block text-slate-700">1. Eligibility</span>
                <span className={`text-sm font-black mt-1 block ${clearance.eligibility_verified ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {clearance.eligibility_verified ? 'PASSED (ACTIVE)' : 'FAILED'}
                </span>
              </div>

              <div className={`p-4 rounded-xl border ${clearance.coverage_verified ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <span className="text-xs font-bold block text-slate-700">2. Procedure Coverage</span>
                <span className={`text-sm font-black mt-1 block ${clearance.coverage_verified ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {clearance.coverage_verified ? 'PASSED (COVERED)' : 'FAILED'}
                </span>
              </div>

              <div className={`p-4 rounded-xl border ${clearance.authorization_satisfied ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <span className="text-xs font-bold block text-slate-700">3. Prior Auth Mandate</span>
                <span className={`text-sm font-black mt-1 block ${clearance.authorization_satisfied ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {clearance.authorization_satisfied ? 'PASSED (APPROVED)' : 'MISSING / PENDING'}
                </span>
              </div>

              <div className={`p-4 rounded-xl border ${clearance.validation_passed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <span className="text-xs font-bold block text-slate-700">4. Card OCR Match</span>
                <span className={`text-sm font-black mt-1 block ${clearance.validation_passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {clearance.validation_passed ? 'PASSED (MATCH)' : 'MISMATCH DETECTED'}
                </span>
              </div>
            </div>

            {/* Unresolved Blockers List */}
            {clearance.blocking_reasons && clearance.blocking_reasons.length > 0 && (
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  Unresolved Blockers Preventing Clearance Status Assignment
                </div>
                <ul className="list-disc list-inside text-xs text-rose-900 font-medium space-y-1">
                  {clearance.blocking_reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Link
                href={`/patients/${selectedPatientId}`}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
              >
                Inspect Full Patient Dossier <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
