'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { PreviaAPI } from '../../services/api';
import { WorkflowTask } from '../../types';
import { BellAlert, AlertTriangle, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AlertsPage() {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      setLoading(true);
      try {
        const data = await PreviaAPI.getPendingWorkflows();
        setTasks(data);
      } catch (err) {
        console.error('Failed alerts', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Staff Alerts & Automated Task Feeds"
        subtitle="Real-time notifications for critical pre-visit financial clearance blockers"
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-extrabold text-slate-900">Active High-Priority Alerts</h3>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              {tasks.length} Critical Alerts
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading alerts feed...</div>
            ) : tasks.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No active critical alerts.</div>
            ) : (
              tasks.map((task) => (
                <div key={task.workflow_id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl shrink-0">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded uppercase">
                          {task.priority}
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm">{task.title}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{task.description}</p>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        Task Type: {task.task_type} • Created: {new Date(task.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/patients/${task.patient_id}`}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 inline-flex items-center gap-1.5 self-start md:self-center"
                  >
                    Open Patient Dossier <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
