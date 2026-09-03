'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { PreventiveWorkflowDiagram } from '../../components/common/PreventiveWorkflowDiagram';
import { PreviaAPI } from '../../services/api';
import { DenialPattern } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, ShieldCheck, Zap, ToggleLeft, ToggleRight, CheckCircle2, TrendingDown, ArrowDown } from 'lucide-react';

export default function AnalyticsPage() {
  const [patterns, setPatterns] = useState<DenialPattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const data = await PreviaAPI.getDenialPatterns();
        setPatterns(data);
      } catch (err) {
        console.error('Failed analytics', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const handleToggleRule = async (ruleId: string, currentEnabled: boolean) => {
    try {
      const updated = await PreviaAPI.togglePreventiveRule(ruleId, !currentEnabled);
      setPatterns([...updated]);
    } catch (err) {
      console.error('Failed toggle', err);
    }
  };

  // Recharts chart data prep
  const barChartData = patterns.map(p => ({
    name: p.reason_code,
    claims: p.claims_affected,
    dollars: p.dollar_volume / 1000, // in $K
  }));

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Denial Root-Cause Analytics & Preventive Automation"
        subtitle="Analyze historical claim denial patterns, isolate root causes, and deploy preventive rules"
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Headline Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-navy-800 to-indigo-950 rounded-3xl p-8 text-white shadow-xl border border-slate-800 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> PREVIA Core Differentiator
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">
            "We don't just fix denied claims. We fix why they were denied."
          </h2>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            By analyzing historical claim denials, PREVIA clusters recurring failure points (such as missing prior authorizations or member ID transcript errors) and automatically deploys pre-visit preventive rules so future appointments are flagged before the visit.
          </p>

          {/* Visual Step Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-4 text-xs font-bold text-center">
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
              <span className="text-rose-400 block text-base font-black">300</span>
              <span className="text-slate-300 font-medium">Denied Claims</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
              <span className="text-amber-400 block text-base font-black">Pattern</span>
              <span className="text-slate-300 font-medium">Clustering Engine</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
              <span className="text-blue-400 block text-base font-black">Auth Gap</span>
              <span className="text-slate-300 font-medium">Missing Prior Auth</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
              <span className="text-indigo-400 block text-base font-black">Root Cause</span>
              <span className="text-slate-300 font-medium">Workflow Bypass</span>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/40 text-emerald-300">
              <span className="text-emerald-400 block text-base font-black">Prevented</span>
              <span className="text-emerald-300 font-semibold">Future MRIs Checked</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart: Denial Claims Volume */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Historical Denial Volume by Reason Code</h3>
              <span className="text-xs font-semibold text-slate-400">Claims Affected</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight={600} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="claims" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart / Dollar Exposure Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Financial Exposure Volume ($K)</h3>
              <span className="text-xs font-semibold text-slate-400">Dollar Exposure</span>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={barChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="dollars"
                  >
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any) => [`$${value}K`, 'Financial Exposure']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Preventive Rules Management Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Systemic Root Cause & Active Preventive Rules</h3>
              <p className="text-xs text-slate-500">Toggle automated pre-visit prevention triggers based on identified denial clusters</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {patterns.filter(p => p.rule_enabled).length} Active Rules Deployed
            </span>
          </div>

          <div className="space-y-4">
            {patterns.map((item) => (
              <div key={item.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-100/50 transition-colors">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs rounded">
                      {item.reason_code}
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">{item.description}</span>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      {item.claims_affected} Denials (${(item.dollar_volume / 1000).toFixed(0)}K)
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="text-slate-700 font-medium">
                      <span className="font-bold text-slate-900">Primary Procedure & Payer:</span> {item.primary_procedure} • {item.payer_name}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-900">Identified Systemic Root Cause:</span> {item.root_cause}
                    </p>
                    <p className="text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                      <span className="font-bold text-emerald-900">Preventive Rule:</span> {item.preventive_rule}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                  <span className="text-xs font-bold text-slate-700">
                    {item.rule_enabled ? 'Rule Enabled' : 'Rule Disabled'}
                  </span>
                  <button
                    onClick={() => handleToggleRule(item.id, item.rule_enabled)}
                    className="p-1 text-slate-700 hover:text-brand-600 transition-colors"
                  >
                    {item.rule_enabled ? (
                      <ToggleRight className="w-10 h-10 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preventive Diagram Component */}
        <PreventiveWorkflowDiagram />
      </div>
    </div>
  );
}
