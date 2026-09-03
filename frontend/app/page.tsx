'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '../components/layout/Header';
import { ClearanceBadge } from '../components/common/ClearanceBadge';
import { InsuranceCardOcr } from '../components/common/InsuranceCardOcr';
import { PreviaAPI } from '../services/api';
import { DashboardSummary, PriorityQueueItem } from '../types';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  FileCheck2
} from 'lucide-react';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [priorityQueue, setPriorityQueue] = useState<PriorityQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOcrModal, setShowOcrModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sumRes, queueRes] = await Promise.all([
          PreviaAPI.getDashboardSummary(),
          PreviaAPI.getPriorityQueue(),
        ]);
        setSummary(sumRes);
        setPriorityQueue(queueRes);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Operational Dashboard"
        subtitle="Real-time pre-visit financial clearance status across upcoming patient encounters"
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top Banner & Quick Action */}
        <div className="bg-gradient-to-r from-slate-900 via-navy-800 to-brand-950 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-400/30 rounded-full text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> PREVIA Active Denial Prevention Engine
            </div>
            <h2 className="text-2xl font-black tracking-tight">Shift Revenue Operations to Proactive Clearance</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Verifying insurance policies, procedure coverage, and prior authorization requirements before patient visits eliminating downstream claim rejections.
            </p>
          </div>
          <button
            onClick={() => setShowOcrModal(true)}
            className="px-5 py-3 bg-brand-500 hover:bg-brand-400 text-white font-bold text-sm rounded-2xl shadow-md shadow-brand-500/30 transition-all flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            Scan Insurance Card OCR
          </button>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Upcoming */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Upcoming Patients
              </span>
              <span className="text-3xl font-black text-slate-900">{summary?.total_upcoming_patients || 142}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Scheduled next 7 days</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Cleared */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Cleared Status
              </span>
              <span className="text-3xl font-black text-emerald-600">{summary?.cleared_count || 98}</span>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">✓ Ready for encounter</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Needs Action */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Needs Action
              </span>
              <span className="text-3xl font-black text-amber-600">{summary?.needs_action_count || 28}</span>
              <span className="text-[11px] text-amber-600 font-semibold block mt-1">! Resolvable staff tasks</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: High Risk */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                High Risk
              </span>
              <span className="text-3xl font-black text-rose-600">{summary?.high_risk_count || 16}</span>
              <span className="text-[11px] text-rose-600 font-semibold block mt-1">⚠ Critical denial blockers</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Secondary Financial KPI bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Potential Financial Exposure at Risk</span>
              <div className="text-xl font-black text-slate-900">${summary?.potential_financial_exposure.toLocaleString() || '184,500'}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Prevented Denial Revenue (YTD)</span>
              <div className="text-xl font-black text-emerald-700">${summary?.prevented_denial_dollars.toLocaleString() || '428,000'}</div>
            </div>
          </div>
        </div>

        {/* Priority Work Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Priority Work Queue</h3>
              <p className="text-xs text-slate-500">Upcoming visits ranked by financial risk & clearance urgency</p>
            </div>
            <Link
              href="/priority-queue"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View Full Work Queue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Patient</th>
                  <th className="px-6 py-3.5">Appointment</th>
                  <th className="px-6 py-3.5">Insurance</th>
                  <th className="px-6 py-3.5 text-center">Risk Score</th>
                  <th className="px-6 py-3.5 text-center">Clearance Status</th>
                  <th className="px-6 py-3.5">Primary Issue</th>
                  <th className="px-6 py-3.5">Recommended Action</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      Loading pre-visit priority queue...
                    </td>
                  </tr>
                ) : priorityQueue.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      No patients requiring clearance action.
                    </td>
                  </tr>
                ) : (
                  priorityQueue.map((item) => {
                    const topAction = item.recommended_actions[0];
                    return (
                      <tr key={item.patient.patient_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <Link href={`/patients/${item.patient.patient_id}`} className="hover:underline text-brand-700 font-extrabold block">
                            {item.patient.first_name} {item.patient.last_name}
                          </Link>
                          <span className="text-[11px] text-slate-400 font-normal block font-mono">{item.patient.mrn}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800 block">{item.appointment.procedure_description}</span>
                          <span className="text-[11px] text-slate-500 block">{item.appointment.department}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800 block">{item.insurance?.payer_name}</span>
                          <span className="text-[11px] text-slate-400 font-mono block">{item.insurance?.member_id}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold">
                          <span className={`px-2 py-1 rounded-md ${
                            item.risk.risk_score >= 70 ? 'bg-rose-100 text-rose-800' : item.risk.risk_score >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.risk.risk_score}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <ClearanceBadge status={item.clearance?.clearance_status} size="sm" />
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 max-w-xs truncate">
                          {item.primary_issue}
                        </td>
                        <td className="px-6 py-4">
                          {topAction ? (
                            <span className="px-2.5 py-1 bg-brand-50 text-brand-800 border border-brand-200 rounded-lg font-semibold block text-[11px]">
                              {topAction.recommended_step}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No action required</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/patients/${item.patient.patient_id}`}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors inline-block"
                          >
                            Inspect Dossier
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Insurance Card OCR Modal */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">Intake Insurance Card Scanner</h3>
              <button
                onClick={() => setShowOcrModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>
            <InsuranceCardOcr patientId="pat-001-carter" />
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowOcrModal(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
