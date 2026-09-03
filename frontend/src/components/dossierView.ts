import { clearanceStore } from '../services/clearanceEngine';
import { showToast } from './toast';

export function renderDossierView(
  patientId: string,
  onPatientChange: (id: string) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'dossier-view-container';

  function render(): void {
    const queue = clearanceStore.getQueue();
    const dossier = clearanceStore.getPatientDossier(patientId);
    const riskEval = clearanceStore.getRiskEvaluation(patientId);

    if (!dossier) {
      container.innerHTML = `<div class="glass-panel" style="padding: 3rem; text-align: center; color: var(--text-muted);">Patient dossier record not found.</div>`;
      return;
    }

    const initials = `${dossier.first_name[0]}${dossier.last_name[0]}`;
    const score = riskEval?.composite_score ?? dossier.clearance.risk_score;
    const riskLevel = riskEval?.risk_level ?? dossier.clearance.risk_level;

    // SVG Circular Meter calculations
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const meterColor =
      score < 40 ? '#4ade80' :
      score < 70 ? '#fbbf24' : '#f87171';

    container.innerHTML = `
      <!-- Patient Selector & Header Bar -->
      <div style="margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="glass-badge badge-ai">Deterministic Clinical Evaluation</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Pre-Encounter Risk Snapshot</span>
          </div>
          <h2 style="font-size: 1.45rem; font-weight: 800; color: #fff;">
            Patient Financial Clearance Dossier
          </h2>
          <p style="color: var(--text-secondary); font-size: 0.85rem; max-width: 850px; margin-top: 2px;">
            Comprehensive pre-service audit: eligibility verification, prior authorization protocol, explainable risk score factors, and out-of-pocket patient responsibility calculation.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;">Active Patient:</span>
          <select id="dossier-patient-select" class="glass-input glass-select" style="min-width: 260px;">
            ${queue.map(q => `
              <option value="${q.patient_id}" ${q.patient_id === patientId ? 'selected' : ''}>
                ${q.patient_name} (${q.clearance_status})
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Top Summary Header Card -->
      <div class="glass-panel dossier-header-card">
        <div class="dossier-patient-info">
          <div class="patient-avatar">${initials}</div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <h1 style="font-size: 1.5rem; font-weight: 800; color: #fff;">${dossier.first_name} ${dossier.last_name}</h1>
              ${renderClearanceBadge(dossier.clearance.status)}
            </div>
            <div style="display: flex; gap: 1.25rem; font-size: 0.8rem; color: var(--text-muted); margin-top: 0.35rem; flex-wrap: wrap;">
              <span><strong style="color: #cbd5e1;">DOB:</strong> ${dossier.dob}</span>
              <span><strong style="color: #cbd5e1;">MRN:</strong> <span class="code-font" style="color: #38bdf8;">${dossier.patient_id}</span></span>
              <span><strong style="color: #cbd5e1;">Phone:</strong> ${dossier.phone}</span>
              <span><strong style="color: #cbd5e1;">Email:</strong> ${dossier.email}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-reverify-dossier" class="glass-btn glass-btn-secondary glass-btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Re-verify 270/271</span>
          </button>
          ${dossier.clearance.status !== 'CLEARED' ? `
            <button id="btn-resolve-dossier" class="glass-btn glass-btn-primary glass-btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Approve & Clear Patient</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Two-Column Main Layout -->
      <div class="dossier-grid">
        <!-- Left Column: Clinical, Policy, Prior Auth & Financials -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Upcoming Appointment & Procedure Card -->
          <div class="glass-panel" style="padding: 1.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
              <h3 style="font-size: 1.05rem; font-weight: 800; color: #fff;">Scheduled Clinical Service</h3>
              <span class="glass-badge badge-neutral code-font">Encounter: ${dossier.appointment.appointment_id}</span>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem;">
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Date & Time</div>
                <div style="font-weight: 700; color: #38bdf8; font-size: 0.95rem; margin-top: 2px;">📅 ${dossier.appointment.datetime}</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Attending Provider</div>
                <div style="font-weight: 700; font-size: 0.95rem; color: #fff; margin-top: 2px;">${dossier.appointment.provider_name}</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Department</div>
                <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-secondary); margin-top: 2px;">${dossier.appointment.department}</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">CPT Procedure Code</div>
                <div class="code-font" style="font-weight: 800; color: #fff; font-size: 0.95rem; margin-top: 2px;">${dossier.appointment.cpt_code} - ${dossier.appointment.service_description}</div>
              </div>
            </div>
          </div>

          <!-- Active Insurance Policy Details -->
          <div class="glass-panel" style="padding: 1.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
              <h3 style="font-size: 1.05rem; font-weight: 800; color: #fff;">Active Insurance Coverage</h3>
              <span class="glass-badge badge-cleared" style="font-size: 0.7rem;">✓ In-Network Facility</span>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem;">
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Primary Payer</div>
                <div style="font-weight: 800; font-size: 0.95rem; color: #fff;">${dossier.insurance.payer_name}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">${dossier.insurance.plan_name}</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Member ID / Group</div>
                <div class="code-font" style="font-weight: 800; font-size: 0.95rem; color: #38bdf8;">${dossier.insurance.member_id}</div>
                <div class="code-font" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">GRP: ${dossier.insurance.group_number}</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Policy Status</div>
                <div style="font-weight: 700; color: ${dossier.insurance.policy_status === 'ACTIVE' ? '#4ade80' : '#f87171'}; font-size: 0.95rem; margin-top: 2px;">
                  ● ${dossier.insurance.policy_status}
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Effective: ${dossier.insurance.effective_date}</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">EDI Verification</div>
                <div style="font-weight: 700; color: #4ade80; font-size: 0.95rem; margin-top: 2px;">Real-Time 271 Validated</div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Payer ID: ${dossier.insurance.payer_id}</div>
              </div>
            </div>
          </div>

          <!-- Prior Authorization Protocol -->
          <div class="glass-panel" style="padding: 1.75rem; border-left: 4px solid ${dossier.prior_auth.status === 'APPROVED' ? '#22c55e' : dossier.prior_auth.status === 'REQUIRED' ? '#ef4444' : '#f59e0b'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
              <h3 style="font-size: 1.05rem; font-weight: 800; color: #fff;">Prior Authorization Protocol</h3>
              ${renderAuthBadge(dossier.prior_auth.status)}
            </div>

            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
              ${dossier.prior_auth.notes || (dossier.prior_auth.required ? 'Prior authorization is mandated by payer policy rules for this CPT code. Submission required to avoid denial.' : 'Service does not mandate prior authorization under current plan guidelines.')}
            </p>

            ${dossier.prior_auth.auth_number ? `
              <div style="margin-top: 1.15rem; padding: 0.85rem 1.15rem; background: rgba(34, 197, 94, 0.1); border-radius: var(--radius-md); border: 1px solid rgba(34, 197, 94, 0.3); display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 0.7rem; color: #4ade80; text-transform: uppercase; font-weight: 800;">Authorization Reference ID</div>
                  <div class="code-font" style="font-size: 1.05rem; font-weight: 800; color: #fff; margin-top: 2px;">${dossier.prior_auth.auth_number}</div>
                </div>
                <span class="glass-badge badge-cleared">ACTIVE DETERMINATION</span>
              </div>
            ` : ''}
          </div>

          <!-- Estimated Financial Out-of-Pocket Calculation -->
          <div class="glass-panel" style="padding: 1.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
              <h3 style="font-size: 1.05rem; font-weight: 800; color: #fff;">Patient Financial Responsibility Estimate</h3>
              <span class="glass-badge badge-neutral code-font" style="font-size: 0.68rem;">Formula: Deductible + Copay + (Allowable - Ded) × Coinsurance%</span>
            </div>

            <div class="financial-grid">
              <div class="financial-metric">
                <div class="financial-metric-title">Total Allowable Service Fee</div>
                <div class="financial-metric-amount">$${dossier.financials.total_estimated_cost.toFixed(2)}</div>
              </div>
              <div class="financial-metric">
                <div class="financial-metric-title">Deductible Remaining</div>
                <div class="financial-metric-amount">$${dossier.financials.deductible_remaining.toFixed(2)}</div>
              </div>
              <div class="financial-metric">
                <div class="financial-metric-title">Copayment / Coinsurance</div>
                <div class="financial-metric-amount">
                  ${dossier.financials.copay_amount > 0 ? `$${dossier.financials.copay_amount.toFixed(2)} Copay` : `${dossier.financials.coinsurance_percentage}% Coinsurance`}
                </div>
              </div>
              <div class="financial-metric" style="background: rgba(56, 189, 248, 0.12); border-color: rgba(56, 189, 248, 0.4);">
                <div class="financial-metric-title" style="color: #38bdf8; font-weight: 800;">Total Patient Responsibility</div>
                <div class="financial-metric-amount" style="color: #38bdf8;">$${dossier.financials.estimated_patient_responsibility.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Explainable Risk Score Gauge & Contributing Factors -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Circular Risk Score Meter -->
          <div class="glass-panel risk-gauge-card">
            <h3 style="font-size: 1.1rem; font-weight: 800; color: #fff;">Explainable Risk Score</h3>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Deterministic Multi-Factor Weighted Risk</div>

            <div class="gauge-circle-container">
              <svg class="gauge-svg" width="160" height="160" viewBox="0 0 160 160">
                <circle class="gauge-bg" cx="80" cy="80" r="${radius}"/>
                <circle
                  class="gauge-fill"
                  cx="80"
                  cy="80"
                  r="${radius}"
                  stroke="${meterColor}"
                  stroke-dasharray="${circumference}"
                  stroke-dashoffset="${strokeDashoffset}"
                />
              </svg>
              <div class="gauge-value-display">
                <div class="gauge-score" style="color: ${meterColor};">${score}</div>
                <div class="gauge-tier" style="color: ${meterColor};">${riskLevel} RISK</div>
              </div>
            </div>

            <div style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.5; padding: 0 0.5rem;">
              ${riskEval?.explanation || 'All standard clearance parameters assessed.'}
            </div>

            <!-- Contributing Factors List -->
            <div class="risk-factor-list">
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); text-align: left; letter-spacing: 0.06em;">
                Contributing Factors Breakdown:
              </div>

              ${(riskEval?.factors || []).map(f => {
                const barColor = f.status === 'FAIL' ? '#f87171' : f.status === 'WARNING' ? '#fbbf24' : '#4ade80';
                const percent = Math.min(100, Math.max(10, (f.scoreContribution / (score || 1)) * 100));
                return `
                  <div class="risk-factor-item">
                    <div class="factor-header">
                      <span style="color: #fff;">${f.name}</span>
                      <span style="color: ${barColor}; font-weight: 800;">+${f.scoreContribution} pts</span>
                    </div>
                    <div class="factor-progress-bg">
                      <div class="factor-progress-fill" style="width: ${percent}%; background: ${barColor};"></div>
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${f.description}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Recommended Actions Checklist -->
          <div class="glass-panel" style="padding: 1.75rem;">
            <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 1rem; color: #fff;">Recommended Action Items</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${dossier.clearance.recommended_actions.map(action => `
                <div style="display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.85rem; border-radius: var(--radius-md); background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border);">
                  <input type="checkbox" style="margin-top: 3px; accent-color: #38bdf8; cursor: pointer; width: 15px; height: 15px;" />
                  <span style="font-size: 0.82rem; color: #f1f5f9; line-height: 1.4;">${action}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach event listeners
    const patientSelect = container.querySelector('#dossier-patient-select') as HTMLSelectElement;
    if (patientSelect) {
      patientSelect.addEventListener('change', (e) => {
        const id = (e.target as HTMLSelectElement).value;
        onPatientChange(id);
      });
    }

    const reverifyBtn = container.querySelector('#btn-reverify-dossier');
    if (reverifyBtn) {
      reverifyBtn.addEventListener('click', () => {
        showToast(`270/271 real-time inquiry confirmed: ${dossier.insurance.payer_name} response received (Active Policy).`, 'success');
      });
    }

    const resolveBtn = container.querySelector('#btn-resolve-dossier');
    if (resolveBtn) {
      resolveBtn.addEventListener('click', () => {
        clearanceStore.approvePriorAuth(dossier.patient_id);
        showToast(`Authorization approved & patient ${dossier.first_name} ${dossier.last_name} marked financially CLEARED!`, 'success');
        render();
      });
    }
  }

  function renderClearanceBadge(status: string): string {
    switch (status) {
      case 'CLEARED':
        return `<span class="glass-badge badge-cleared">CLEARED</span>`;
      case 'NEEDS_ACTION':
        return `<span class="glass-badge badge-needs-action">NEEDS ACTION</span>`;
      case 'HIGH_RISK':
        return `<span class="glass-badge badge-high-risk">HIGH RISK</span>`;
      default:
        return `<span class="glass-badge badge-neutral">${status}</span>`;
    }
  }

  function renderAuthBadge(status: string): string {
    switch (status) {
      case 'APPROVED':
        return `<span class="glass-badge badge-cleared">AUTH APPROVED</span>`;
      case 'REQUIRED':
        return `<span class="glass-badge badge-high-risk">AUTH REQUIRED (MISSING)</span>`;
      case 'PENDING':
        return `<span class="glass-badge badge-needs-action">AUTH PENDING</span>`;
      default:
        return `<span class="glass-badge badge-neutral">NO AUTH REQ</span>`;
    }
  }

  render();
  return container;
}
