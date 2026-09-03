import React from 'react';
import { RiskAssessment } from '../../types';
import { ShieldAlert, ShieldCheck, ShieldWarning } from 'lucide-react';

interface RiskMeterProps {
  assessment?: RiskAssessment;
  score?: number;
  level?: 'LOW' | 'MEDIUM' | 'HIGH';
  showFactors?: boolean;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  assessment,
  score: propScore,
  level: propLevel,
  showFactors = true,
}) => {
  const score = assessment ? assessment.risk_score : propScore ?? 0;
  const level = assessment ? assessment.risk_level : propLevel ?? (score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW');

  const getLevelColor = () => {
    if (level === 'HIGH' || score >= 70) return { text: 'text-rose-600', bg: 'bg-rose-500', border: 'border-rose-200', gradient: 'from-rose-500 to-rose-600', lightBg: 'bg-rose-50' };
    if (level === 'MEDIUM' || score >= 40) return { text: 'text-amber-600', bg: 'bg-amber-500', border: 'border-amber-200', gradient: 'from-amber-500 to-amber-600', lightBg: 'bg-amber-50' };
    return { text: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600', lightBg: 'bg-emerald-50' };
  };

  const colors = getLevelColor();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          {level === 'HIGH' ? (
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          ) : level === 'MEDIUM' ? (
            <ShieldWarning className="w-5 h-5 text-amber-600" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          )}
          <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">
            Deterministic Risk Meter
          </h3>
        </div>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
          Rule-Based Score
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Prominent Score Card */}
        <div className={`flex flex-col items-center justify-center p-5 rounded-2xl ${colors.lightBg} border ${colors.border}`}>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            RISK SCORE
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-black ${colors.text}`}>{score}</span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <span className={`mt-2 px-3 py-0.5 text-xs font-extrabold rounded-full bg-white shadow-sm border ${colors.border} ${colors.text}`}>
            {level} RISK
          </span>
        </div>

        {/* Progress Bar & Tier Breakdown */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span>Overall Encounter Risk</span>
              <span>{score}%</span>
            </div>
            <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(score, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs font-medium">
            <div className={`p-2 rounded-lg border ${score < 40 ? 'bg-emerald-100/50 border-emerald-300 font-bold text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              LOW (0–39)
            </div>
            <div className={`p-2 rounded-lg border ${score >= 40 && score < 70 ? 'bg-amber-100/50 border-amber-300 font-bold text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              MEDIUM (40–69)
            </div>
            <div className={`p-2 rounded-lg border ${score >= 70 ? 'bg-rose-100/50 border-rose-300 font-bold text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              HIGH (70–100)
            </div>
          </div>
        </div>
      </div>

      {/* Rationale Explanation */}
      {assessment?.summary_explanation && (
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900 block mb-1">Risk Summary Explanation:</span>
          {assessment.summary_explanation}
        </div>
      )}

      {/* Individual Factor Breakdown Table */}
      {showFactors && assessment?.factors && assessment.factors.length > 0 && (
        <div className="mt-6">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Contributing Factor Breakdown
          </h4>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {assessment.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 text-xs">
                <div className="pr-4 space-y-0.5">
                  <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] mr-2">
                    {factor.factor_code}
                  </span>
                  <span className="text-slate-600 font-medium">{factor.reason}</span>
                </div>
                <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100 shrink-0">
                  +{factor.impact}
                </span>
              </div>
            ))}
            <div className="flex justify-between p-3 bg-slate-50 font-bold text-xs text-slate-900">
              <span>Deterministic Total Calculated Score</span>
              <span className="font-mono text-slate-900">{score} / 100</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
