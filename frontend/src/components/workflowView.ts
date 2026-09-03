import { showToast } from './toast';

export function renderWorkflowView(onNavigate?: (tab: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'workflow-view-container';

  let simulationActive = false;

  function render(): void {
    container.innerHTML = `
      <!-- Header Area -->
      <div style="margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="glass-badge badge-cyan">Upstream Process Architecture</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Reactive vs Preventive Operations</span>
          </div>
          <h2 style="font-size: 1.45rem; font-weight: 800; color: #fff;">
            Upstream Workflow Shift & Process Automation
          </h2>
          <p style="color: var(--text-secondary); font-size: 0.85rem; max-width: 850px; margin-top: 2px;">
            By moving eligibility verification, optical card synchronization, and prior authorization checks to the pre-service scheduling window, Previa permanently stops denial cycles before patient encounters begin.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-run-simulation" class="glass-btn glass-btn-primary glass-btn-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>${simulationActive ? 'Reset Simulation' : 'Run Pre-Service Simulation'}</span>
          </button>
        </div>
      </div>

      <!-- Impact Metrics Ribbon -->
      <div class="kpi-grid" style="margin-bottom: 2rem;">
        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Denial Reduction</div>
              <div class="kpi-value" style="color: #4ade80;">-88.4%</div>
            </div>
            <div class="kpi-icon" style="background: rgba(34, 197, 94, 0.15); color: #4ade80;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span>Down from 18.2% to 2.1% across all CPTs</span>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Processing Time Reduction</div>
              <div class="kpi-value" style="color: #38bdf8;">-92.0%</div>
            </div>
            <div class="kpi-icon" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span>From 4.2 days manual appeal to 1.8 min</span>
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
            <span>Zero post-service write-off losses</span>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Autonomous Clearance Rate</div>
              <div class="kpi-value" style="color: #fbbf24;">78.5%</div>
            </div>
            <div class="kpi-icon" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span>Cleared with 0 staff touches required</span>
          </div>
        </div>
      </div>

      <!-- Before vs After Interactive Comparison Architecture -->
      <div class="workflow-comparison-container">
        <!-- Left: Current Legacy Reactive Process -->
        <div class="workflow-box legacy">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="glass-badge badge-danger">LEGACY WORKFLOW</span>
              <h3 style="font-size: 1.1rem; font-weight: 800; color: #f87171;">Reactive Claims Processing</h3>
            </div>
            <span class="code-font" style="font-size: 0.75rem; color: #fca5a5;">Latency: 45 Days</span>
          </div>

          <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
            Traditional hospital revenue cycle: errors and missing authorizations are only discovered weeks after the service is rendered, resulting in costly manual appeal queues and high write-off rates.
          </p>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div class="step-card" style="border-left: 3px solid #64748b;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="code-font" style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700;">01</span>
                <div>
                  <div style="font-weight: 700; color: #fff; font-size: 0.85rem;">Patient Appointment Scheduled</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">No pre-authorization requirement verified at booking</div>
                </div>
              </div>
              <span class="glass-badge badge-neutral" style="font-size: 0.65rem;">Unchecked</span>
            </div>

            <div class="down-arrow-indicator">↓</div>

            <div class="step-card" style="border-left: 3px solid #64748b;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="code-font" style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700;">02</span>
                <div>
                  <div style="font-weight: 700; color: #fff; font-size: 0.85rem;">Procedure Rendered & EDI Claim Submitted</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">EDI 837 claim batch sent to payer without valid auth number</div>
                </div>
              </div>
              <span class="glass-badge badge-neutral" style="font-size: 0.65rem;">EDI 837</span>
            </div>

            <div class="down-arrow-indicator">↓</div>

            <div class="step-card" style="border-left: 3px solid #ef4444; background: rgba(239, 68, 68, 0.1);">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="code-font" style="color: #f87171; font-size: 0.8rem; font-weight: 700;">03</span>
                <div>
                  <div style="font-weight: 700; color: #f87171; font-size: 0.85rem;">Claim Denied by Payer (CARC CO-197)</div>
                  <div style="font-size: 0.72rem; color: #fca5a5;">Payer sends 835 Remittance Advice with 100% rejection</div>
                </div>
              </div>
              <span class="glass-badge badge-danger" style="font-size: 0.65rem;">DENIED (100%)</span>
            </div>

            <div class="down-arrow-indicator">↓</div>

            <div class="step-card" style="border-left: 3px solid #f59e0b;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="code-font" style="color: #fbbf24; font-size: 0.8rem; font-weight: 700;">04</span>
                <div>
                  <div style="font-weight: 700; color: #fff; font-size: 0.85rem;">45-Day Manual Staff Appeal & High Write-Off</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">$184K lost yearly due to retrospective appeal rejection limits</div>
                </div>
              </div>
              <span class="glass-badge badge-warning" style="font-size: 0.65rem;">Cost: $45/Claim</span>
            </div>
          </div>
        </div>

        <!-- Right: AI-Optimized Upstream Process -->
        <div class="workflow-box optimized">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="glass-badge badge-cleared">PREVIA AI WORKFLOW</span>
              <h3 style="font-size: 1.1rem; font-weight: 800; color: #38bdf8;">Autonomous Upstream Prevention</h3>
            </div>
            <span class="code-font" style="font-size: 0.75rem; color: #4ade80;">Latency: 1.8 Minutes</span>
          </div>

          <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
            Previa shifts the entire validation lifecycle upstream: 72 hours before the visit, real-time eligibility, prior auth rules, and optical card reconciliation clear the encounter before check-in.
          </p>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div class="step-card" style="border-left: 3px solid #38bdf8; background: ${simulationActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)'};">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="code-font" style="color: #38bdf8; font-size: 0.8rem; font-weight: 700;">01</span>
                <div>
                  <div style="font-weight: 700; color: #fff; font-size: 0.85rem;">Patient Appointment Scheduled</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">Encounter ingested into Previa Pre-Service Scheduling Watcher</div>
                </div>
              </div>
              <span class="glass-badge badge-cyan" style="font-size: 0.65rem;">Ingested</span>
            </div>

            <div class="down-arrow-indicator" style="color: #38bdf8;">↓</div>

            <div class="step-card" style="border-left: 3px solid #8b5cf6; background: ${simulationActive ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)'};">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="code-font" style="color: #c084fc; font-size: 0.8rem; font-weight: 700;">02</span>
                <div>
                  <div style="font-weight: 700; color: #fff; font-size: 0.85rem;">72h Automated Pre-Auth & 270 Eligibility Guard</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">Payer mandate verified deterministically; auth initiated or verified active</div>
                </div>
              </div>
              <span class="glass-badge badge-ai" style="font-size: 0.65rem;">Auth Intercepted</span>
            </div>

            <div class="down-arrow-indicator" style="color: #38bdf8;">↓</div>

            <div class="step-card" style="border-left: 3px solid #22c55e; background: ${simulationActive ? 'rgba(34, 197, 94, 0.18)' : 'rgba(34, 197, 94, 0.08)'};">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="code-font" style="color: #4ade80; font-size: 0.8rem; font-weight: 700;">03</span>
                <div>
                  <div style="font-weight: 700; color: #4ade80; font-size: 0.85rem;">Encounter Financially CLEARED Before Visit</div>
                  <div style="font-size: 0.72rem; color: #86efac;">Patient responsibility estimated ($450.00) & verified prior auth attached</div>
                </div>
              </div>
              <span class="glass-badge badge-cleared" style="font-size: 0.65rem;">CLEARED (100%)</span>
            </div>

            <div class="down-arrow-indicator" style="color: #38bdf8;">↓</div>

            <div class="step-card" style="border-left: 3px solid #22c55e;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="code-font" style="color: #4ade80; font-size: 0.8rem; font-weight: 700;">04</span>
                <div>
                  <div style="font-weight: 700; color: #fff; font-size: 0.85rem;">Clean Claim Submission & Zero Denials</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">Clean claim rate increases to 98.4%, eliminating appeal labor</div>
                </div>
              </div>
              <span class="glass-badge badge-cleared" style="font-size: 0.65rem;">Paid 1st Pass</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Action Callout -->
      <div class="glass-panel" style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="font-weight: 800; font-size: 1rem; color: #fff;">Ready to activate full autonomous clearance rules?</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
            Configure deterministic triggers, notification targets, and pre-service escalation workflows.
          </div>
        </div>
        <button id="btn-goto-rules" class="glass-btn glass-btn-primary glass-btn-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Configure Preventive Rules</span>
        </button>
      </div>
    `;

    // Listeners
    const simBtn = container.querySelector('#btn-run-simulation');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        simulationActive = !simulationActive;
        if (simulationActive) {
          showToast('Running live upstream simulation on 14 scheduled encounters... 12 cleared automatically, 2 flagged for staff action.', 'success');
        } else {
          showToast('Simulation reset.', 'info');
        }
        render();
      });
    }

    const rulesBtn = container.querySelector('#btn-goto-rules');
    if (rulesBtn) {
      rulesBtn.addEventListener('click', () => {
        if (onNavigate) onNavigate('rules');
      });
    }
  }

  render();
  return container;
}
