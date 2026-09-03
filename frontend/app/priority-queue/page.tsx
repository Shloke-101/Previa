'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { ClearanceBadge } from '../../components/common/ClearanceBadge';
import { PreviaAPI } from '../../services/api';
import { PriorityQueueItem } from '../../types';
import { ListOrdered, CheckCircle, ArrowRight, User } from 'lucide-react';

export default function PriorityQueuePage() {
  const [queue, setQueue] = useState<PriorityQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQueue() {
      setLoading(true);
      try {
        const data = await PreviaAPI.getPriorityQueue();
        setQueue(data);
      } catch (err) {
        console.error('Failed priority queue', err);
      } finally {
        setLoading(false);
      }
    }
    loadQueue();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Priority Work Queue"
        subtitle="Ranked staff work list ordered by financial risk score & encounter urgency"
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-brand-600" />
              <h3 className="text-lg font-extrabold text-slate-900">Urgent Clearance Work Queue</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {queue.length} Active Queue Items
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading priority queue...</div>
            ) : queue.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No items in priority work queue.</div>
            ) : (
              queue.map((item, index) => {
                const topAction = item.recommended_actions[0];
                return (
                  <div key={item.patient.patient_id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                        #{index + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <Link href={`/patients/${item.patient.patient_id}`} className="text-base font-extrabold text-brand-700 hover:underline">
                            {item.patient.first_name} {item.patient.last_name}
                          </Link>
                          <span className="font-mono text-xs font-semibold text-slate-400">MRN: {item.patient.mrn}</span>
                          <ClearanceBadge status={item.clearance?.clearance_status} size="sm" />
                        </div>
                        <p className="text-xs font-medium text-slate-700">
                          <span className="font-bold text-slate-900">{item.appointment.procedure_description}</span> (CPT {item.appointment.procedure_code}) • {item.insurance.payer_name}
                        </p>
                        <p className="text-xs text-rose-700 font-semibold bg-rose-50 border border-rose-100 p-2 rounded-lg inline-block">
                          Primary Blocker: {item.primary_issue}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 lg:self-center">
                      {topAction && (
                        <div className="text-left bg-slate-50 border border-slate-200 p-3 rounded-xl max-w-sm">
                          <span className="text-[10px] font-bold text-amber-700 uppercase block">Recommended Staff Action</span>
                          <span className="text-xs font-medium text-slate-800 line-clamp-2">{topAction.recommended_step}</span>
                        </div>
                      )}

                      <Link
                        href={`/patients/${item.patient.patient_id}`}
                        className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1"
                      >
                        Take Action <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
