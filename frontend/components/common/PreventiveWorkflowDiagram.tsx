import React from 'react';
import { ArrowDown, CheckCircle, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export const PreventiveWorkflowDiagram: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">
            Systemic Preventive Workflow Logic
          </h3>
        </div>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Proactive Denial Prevention
        </span>
      </div>

      <div className="flex flex-col items-center max-w-xl mx-auto space-y-3 text-xs">
        {/* Step 1 */}
        <div className="w-full p-3 bg-slate-900 text-white rounded-xl text-center font-bold shadow-sm flex items-center justify-center gap-2">
          <span>NEW APPOINTMENT CREATED (e.g. MRI Brain CPT 70551)</span>
        </div>

        <ArrowDown className="w-4 h-4 text-slate-400" />

        {/* Step 2 */}
        <div className="w-full p-3 bg-brand-50 border border-brand-200 rounded-xl text-center font-bold text-brand-900">
          <span>Rule Check: Does Procedure Require Prior Authorization?</span>
        </div>

        <ArrowDown className="w-4 h-4 text-slate-400" />

        {/* Step 3 */}
        <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-center font-bold text-amber-900">
          <span>Eligibility Check: Is Prior Auth Approved & On File?</span>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full pt-2">
          {/* Branch YES */}
          <div className="flex flex-col items-center space-y-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="font-bold text-emerald-800">YES (Auth Present)</span>
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <span className="font-extrabold text-emerald-700 bg-white px-2 py-1 rounded border border-emerald-200">
              CLEARED FOR VISIT
            </span>
          </div>

          {/* Branch NO */}
          <div className="flex flex-col items-center space-y-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
            <span className="font-bold text-rose-800">NO (Auth Missing)</span>
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span className="font-semibold text-rose-700 text-[11px] text-center">
              Auto-Create Urgent Remediation Task & Alert Staff
            </span>
          </div>
        </div>

        <div className="w-full flex justify-end pr-12">
          <ArrowDown className="w-4 h-4 text-rose-400" />
        </div>

        {/* Resolution Step */}
        <div className="w-[48%] ml-auto p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center font-bold text-indigo-900">
          Staff Resolves Auth Number 5 Days Pre-Visit
        </div>

        <div className="w-full flex justify-end pr-12">
          <ArrowDown className="w-4 h-4 text-indigo-400" />
        </div>

        {/* Re-verify Step */}
        <div className="w-[48%] ml-auto p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-center font-bold text-emerald-900 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Re-verify & Assign CLEARED</span>
        </div>
      </div>
    </div>
  );
};
