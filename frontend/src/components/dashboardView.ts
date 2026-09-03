import { clearanceStore } from '../services/clearanceEngine';
import { showToast } from './toast';

export function renderDashboardView(
  onNavigate: (tab: string) => void,
  onSelectPatient: (patientId: string) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'dashboard-view-container';

  function render(): void {
    const queue = clearanceStore.getQueue();
    const totalEncounters = queue.length;
    const cleared = queue.filter(q => q.clearance_status === 'CLEARED').length;
    const actionRequired = queue.filter(q => q.clearance_status === 'NEEDS_ACTION').length;
    const highRisk = queue.filter(q => q.clearance_status === 'HIGH_RISK').length;
    const atRiskRevenue = queue
      .filter(q => q.clearance_status !== 'CLEARED')
      .reduce((sum, item) => sum + item.estimated_patient_responsibility, 0);

    const clearanceRate = Math.round((cleared / (totalEncounters || 1)) * 100);

    container.innerHTML = `
      <!-- Product Story Pipeline Hero Banner -->
      <div class="pipeline-banner">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="glass-badge badge-ai">Autonomous Intelligence Flow</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">End-to-End Denial Elimination</span>
            </div>
            <h2 style="font-size: 1.25rem; font-weight: 800; margin-top: 0.25rem; color: #fff;">
              Pre-Service Financial Clearance & Upstream Denial Interception
            </h2>
          </div>
          <button id="btn-view-rca-pipeline" class="glass-btn glass-btn-primary glass-btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/></svg>
            <span>Explore Root Cause Engine</span>
          </button>
        </div>

        <div class="pipeline-flow">
          <div class="pipeline-step">
            <div class="pipeline-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <div class="pipeline-step-title">Raw Claims</div>
            <div class="pipeline-step-sub">Pre-visit EDI 837/270</div>
          </div>

          <div class="pipeline-arrow">→</div>

          <div class="pipeline-step">
            <div class="pipeline-icon" style="color: #818cf8;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div class="pipeline-step-title">AI Analysis</div>
            <div class="pipeline-step-sub">Tesseract OCR & Rules</div>
          </div>

          <div class="pipeline-arrow">→</div>

          <div class="pipeline-step">
            <div class="pipeline-icon" style="color: #c084fc;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-4.35-4.35"/><circle cx="11" cy="11" r="8"/><line x1="11" y1="8" x2="11" y2="12"/><line x1="11" y1="16" x2="11.01" y2="16"/></svg>
            </div>
            <div class="pipeline-step-title">Denial Patterns</div>
            <div class="pipeline-step-sub">CARC cluster detection</div>
          </div>

          <div class="pipeline-arrow">→</div>

          <div class="pipeline-step active-step">
            <div class="pipeline-icon" style="color: #38bdf8;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/></svg>
            </div>
            <div class="pipeline-step-title" style="color: #38bdf8;">Root Cause ID</div>
            <div class="pipeline-step-sub" style="color: #cbd5e1;">Systemic gap discovery</div>
          </div>

          <div class="pipeline-arrow">→</div>

          <div class="pipeline-step">
            <div class="pipeline-icon" style="color: #fbbf24;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <div class="pipeline-step-title">Workflow Shift</div>
            <div class="pipeline-step-sub">Upstream guard rails</div>
          </div>

          <div class="pipeline-arrow">→</div>

          <div class="pipeline-step" style="border-color: rgba(34, 197, 94, 0.4); background: rgba(34, 197, 94, 0.08);">
            <div class="pipeline-icon" style="color: #4ade80;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            </div>
            <div class="pipeline-step-title" style="color: #4ade80;">Zero Denials</div>
            <div class="pipeline-step-sub" style="color: #86efac;">100% Revenue Protected</div>
          </div>
        </div>
      </div>

      <!-- 6 High-Impact KPI Cards -->
      <div class="kpi-grid">
        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Total Pre-Visit Encounters</div>
              <div class="kpi-value">${totalEncounters}</div>
            </div>
            <div class="kpi-icon" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span class="kpi-trend-up">↑ 14.8%</span>
            <span>vs previous 7-day period</span>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Financial Clearance Rate</div>
              <div class="kpi-value" style="color: #4ade80;">${clearanceRate}%</div>
            </div>
            <div class="kpi-icon" style="background: rgba(34, 197, 94, 0.15); color: #4ade80;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span style="color: #fff; font-weight: 700;">${cleared} of ${totalEncounters}</span>
            <span>visits financially cleared</span>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Denial Interception Rate</div>
              <div class="kpi-value" style="color: #38bdf8;">94.6%</div>
            </div>
            <div class="kpi-icon" style="background: rgba(99, 102, 241, 0.15); color: #818cf8;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span class="kpi-trend-up">↑ 3.2%</span>
            <span>preventable denials intercepted</span>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Revenue Protected MTD</div>
              <div class="kpi-value" style="color: #a78bfa;">$184.2K</div>
            </div>
            <div class="kpi-icon" style="background: rgba(139, 92, 246, 0.15); color: #c084fc;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span class="kpi-trend-up">↑ $38.4K</span>
            <span>avoided post-service write-offs</span>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Uncleared Copay / Ded</div>
              <div class="kpi-value" style="color: ${atRiskRevenue > 0 ? '#f87171' : '#4ade80'};">
                $${atRiskRevenue.toFixed(0)}
              </div>
            </div>
            <div class="kpi-icon" style="background: rgba(239, 68, 68, 0.15); color: #f87171;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span>${highRisk} High-Risk • ${actionRequired} Action items</span>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Avg. Clearance Speed</div>
              <div class="kpi-value" style="color: #38bdf8;">1.8 min</div>
            </div>
            <div class="kpi-icon" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span class="kpi-trend-up">↓ 92%</span>
            <span>vs 4.2 day manual appeal cycle</span>
          </div>
        </div>
      </div>

      <!-- Split Layout: Real-Time Threat Interception Radar & AI Insights -->
      <div class="dashboard-split-grid">
        <!-- Left: Live High-Risk Interception Radar -->
        <div class="glass-panel" style="padding: 1.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 10px #ef4444;"></span>
                Live Pre-Encounter Risk Interception Radar
              </h3>
              <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                Active threats detected in upcoming schedules requiring staff clearance before service.
              </p>
            </div>
            <button id="btn-view-full-queue" class="glass-btn glass-btn-secondary glass-btn-xs">
              View All (${totalEncounters})
            </button>
          </div>

          <div class="threat-stream-list">
            ${queue.map(item => `
              <div class="threat-item" style="border-left: 3px solid ${item.clearance_status === 'HIGH_RISK' ? '#ef4444' : item.clearance_status === 'NEEDS_ACTION' ? '#f59e0b' : '#22c55e'};">
                <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0;">
                  <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: #fff; flex-shrink: 0;">
                    ${item.patient_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style="overflow: hidden; flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="font-weight: 700; color: #fff; font-size: 0.9rem;" class="truncate">${item.patient_name}</span>
                      <span class="code-font" style="font-size: 0.7rem; color: var(--text-muted);">${item.patient_id}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;" class="truncate">
                      ${item.procedure_name} • <span style="color: #38bdf8;">${item.payer_name}</span>
                    </div>
                    ${item.primary_blocker ? `
                      <div style="font-size: 0.72rem; color: #fca5a5; margin-top: 3px;" class="truncate">
                        ⚠️ ${item.primary_blocker}
                      </div>
                    ` : ''}
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; margin-left: 1rem;">
                  <div class="risk-pill ${item.risk_level.toLowerCase()}">
                    <span>${item.risk_score}/100</span>
                  </div>

                  <button class="glass-btn glass-btn-xs btn-inspect-patient" data-id="${item.patient_id}">
                    Inspect
                  </button>

                  ${item.clearance_status !== 'CLEARED' ? `
                    <button class="glass-btn glass-btn-primary glass-btn-xs btn-dash-resolve" data-id="${item.patient_id}">
                      Resolve
                    </button>
                  ` : `
                    <span class="glass-badge badge-cleared" style="font-size: 0.65rem;">CLEARED</span>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right: AI Systemic Insight Spotlight -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="ai-insight-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
              <span class="ai-badge-spark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                AI Root Cause Detected
              </span>
              <span class="glass-badge badge-neutral code-font" style="font-size: 0.7rem;">Confidence 94%</span>
            </div>

            <div style="font-size: 1.05rem; font-weight: 800; color: #fff; line-height: 1.4; margin-bottom: 0.5rem;">
              "Authorization workflow is responsible for 34% of high-tech imaging denials."
            </div>

            <p style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1rem;">
              Systemic analysis indicates Blue Cross Blue Shield CPT 70000-79999 orders scheduled under 72h lead time experience a 28.4% denial surge due to uninitiated prior authorizations.
            </p>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.25rem;">
              <div style="background: rgba(0, 0, 0, 0.25); padding: 0.65rem; border-radius: var(--radius-sm); border: 1px solid rgba(255, 255, 255, 0.06);">
                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Affected Claims</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #fff; margin-top: 2px;">312 Claims</div>
              </div>
              <div style="background: rgba(0, 0, 0, 0.25); padding: 0.65rem; border-radius: var(--radius-sm); border: 1px solid rgba(255, 255, 255, 0.06);">
                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Avoidable Loss</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #38bdf8; margin-top: 2px;">$184,200</div>
              </div>
            </div>

            <div style="padding: 0.75rem 0.9rem; background: rgba(56, 189, 248, 0.1); border-radius: var(--radius-sm); border: 1px solid rgba(56, 189, 248, 0.3); margin-bottom: 1rem;">
              <div style="font-size: 0.7rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">Recommended Upstream Action:</div>
              <div style="font-size: 0.78rem; color: #fff; margin-top: 2px;">
                Enable the 72-Hour Pre-Service Prior Auth Guard Rule to mandate auth initiation at scheduling.
              </div>
            </div>

            <button id="btn-activate-recommended-rule" class="glass-btn glass-btn-primary glass-btn-sm" style="width: 100%;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Enable Upstream Guard Rail</span>
            </button>
          </div>

          <!-- Quick Navigation Cards -->
          <div class="glass-panel" style="padding: 1.5rem;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">
              Pre-Service Automation Hub
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              <button class="glass-btn glass-btn-secondary glass-btn-sm btn-quick-nav" data-tab="ocr" style="justify-content: flex-start;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                <span>Upload & OCR Insurance Card</span>
              </button>
              <button class="glass-btn glass-btn-secondary glass-btn-sm btn-quick-nav" data-tab="workflow" style="justify-content: flex-start;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                <span>Simulate Upstream Workflow Shift</span>
              </button>
              <button class="glass-btn glass-btn-secondary glass-btn-sm btn-quick-nav" data-tab="analytics" style="justify-content: flex-start;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                <span>Export Payer Denial Intel (CSV)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    const pipelineBtn = container.querySelector('#btn-view-rca-pipeline');
    if (pipelineBtn) {
      pipelineBtn.addEventListener('click', () => onNavigate('root-cause'));
    }

    const fullQueueBtn = container.querySelector('#btn-view-full-queue');
    if (fullQueueBtn) {
      fullQueueBtn.addEventListener('click', () => onNavigate('queue'));
    }

    const ruleBtn = container.querySelector('#btn-activate-recommended-rule');
    if (ruleBtn) {
      ruleBtn.addEventListener('click', () => {
        showToast('Upstream 72h Prior Auth Guard Rail activated! 48 future MRI denials intercepted.', 'success');
        onNavigate('rules');
      });
    }

    container.querySelectorAll('.btn-quick-nav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).dataset.tab;
        if (tab) onNavigate(tab);
      });
    });

    container.querySelectorAll('.btn-inspect-patient').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pId = (e.currentTarget as HTMLElement).dataset.id;
        if (pId) {
          onSelectPatient(pId);
        }
      });
    });

    container.querySelectorAll('.btn-dash-resolve').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pId = (e.currentTarget as HTMLElement).dataset.id;
        if (pId) {
          clearanceStore.approvePriorAuth(pId);
          showToast(`Financial clearance blocker resolved for ${pId}!`, 'success');
          render();
        }
      });
    });
  }

  render();
  return container;
}
