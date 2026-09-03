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
      container.innerHTML = `<div class="glass-panel" style="padding: 3rem; text-align: center;">Patient dossier not found.</div>`;
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
      score < 40 ? '#10b981' :
      score < 70 ? '#f59e0b' : '#f43f5e';

    container.innerHTML = `
      <!-- Patient Selector & Header Bar -->
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 800;">Patient Financial Clearance Dossier</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Pre-encounter verification snapshot, procedural benefits, prior authorization, and risk score.</p>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <span style="font-size: 0.8rem; color: var(--text-muted);">Active Patient:</span>
          <select id="dossier-patient-select" class="glass-input glass-select" style="min-width: 240px;">
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
            <div style="display: flex; gap: 1.25rem; font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
              <span><strong style="color: #cbd5e1;">DOB:</strong> ${dossier.dob}</span>
              <span><strong style="color: #cbd5e1;">MRN:</strong> ${dossier.patient_id}</span>
              <span><strong style="color: #cbd5e1;">Phone:</strong> ${dossier.phone}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-reverify-dossier" class="glass-btn glass-btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Re-verify 270/271
          </button>
          ${dossier.clearance.status !== 'CLEARED' ? `
            <button id="btn-resolve-dossier" class="glass-btn glass-btn-primary glass-btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Resolve & Clear Patient
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Two-Column Main Layout -->
      <div class="dossier-grid">
        <!-- Left Column: Clinical, Policy, Prior Auth & Financials -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Upcoming Appointment & Procedure Card -->
          <div class="glass-panel" style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3 style="font-size: 1.05rem; font-weight: 700;">Scheduled Encounter & Service</h3>
              <span class="glass-badge badge-neutral code-font">ID: ${dossier.appointment.appointment_id}</span>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-dim);">Date & Time</div>
                <div style="font-weight: 700; color: var(--text-accent); font-size: 0.95rem; margin-top: 2px;">📅 ${dossier.appointment.datetime}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-dim);">Attending Provider</div>
                <div style="font-weight: 600; font-size: 0.95rem; margin-top: 2px;">${dossier.appointment.provider_name}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-dim);">Clinical Department</div>
                <div style="font-weight: 600; font-size: 0.95rem; margin-top: 2px;">${dossier.appointment.department}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-dim);">CPT Procedure Code</div>
                <div class="code-font" style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-top: 2px;">${dossier.appointment.cpt_code} - ${dossier.appointment.service_description}</div>
              </div>
            </div>
          </div>

          <!-- Active Insurance Policy Details -->
          <div class="glass-panel" style="padding: 1.5rem;">
            <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 1rem;">Active Insurance Coverage</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-dim);">Primary Payer</div>
                <div style="font-weight: 700; font-size: 0.95rem; color: #fff;">${dossier.insurance.payer_name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${dossier.insurance.plan_name}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-dim);">Member ID / Group</div>
                <div class="code-font" style="font-weight: 700; font-size: 0.95rem; color: #38bdf8;">${dossier.insurance.member_id}</div>
                <div class="code-font" style="font-size: 0.75rem; color: var(--text-dim);">GRP: ${dossier.insurance.group_number}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-dim);">Policy Status</div>
                <div style="font-weight: 700; color: ${dossier.insurance.policy_status === 'ACTIVE' ? '#10b981' : '#f43f5e'};">
                  ● ${dossier.insurance.policy_status}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-dim);">Effective: ${dossier.insurance.effective_date}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-dim);">Network Status</div>
                <div style="font-weight: 700; color: #10b981;">✓ In-Network Facility</div>
              </div>
            </div>
          </div>

          <!-- Prior Authorization Protocol -->
          <div class="glass-panel" style="padding: 1.5rem; border-left: 4px solid ${dossier.prior_auth.status === 'APPROVED' ? '#10b981' : dossier.prior_auth.status === 'REQUIRED' ? '#f43f5e' : '#f59e0b'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h3 style="font-size: 1.05rem; font-weight: 700;">Prior Authorization Requirement</h3>
              ${renderAuthBadge(dossier.prior_auth.status)}
            </div>

            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
              ${dossier.prior_auth.notes || (dossier.prior_auth.required ? 'Prior authorization is mandated by payer policy rules for this CPT code.' : 'Service does not require prior authorization under current plan.')}
            </p>

            ${dossier.prior_auth.auth_number ? `
              <div style="margin-top: 1rem; padding: 0.75rem 1rem; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 0.7rem; color: #34d399; text-transform: uppercase; font-weight: 700;">Authorization Number</div>
                  <div class="code-font" style="font-size: 1rem; font-weight: 800; color: #fff;">${dossier.prior_auth.auth_number}</div>
                </div>
                <span class="glass-badge badge-cleared">ACTIVE AUTH</span>
              </div>
            ` : ''}
          </div>

          <!-- Estimated Financial Out-of-Pocket Calculation -->
          <div class="glass-panel" style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-size: 1.05rem; font-weight: 700;">Patient Financial Responsibility Estimate</h3>
              <span class="glass-badge badge-neutral">Formula: Ded. Remaining + Copay + (Allowable - Ded) × Coinsurance%</span>
            </div>

            <div class="financial-grid">
              <div class="financial-metric">
                <div class="financial-metric-title">Estimated Total Cost</div>
                <div class="financial-metric-amount">$${dossier.financials.total_estimated_cost.toFixed(2)}</div>
              </div>
              <div class="financial-metric">
                <div class="financial-metric-title">Deductible Remaining</div>
                <div class="financial-metric-amount">$${dossier.financials.deductible_remaining.toFixed(2)}</div>
              </div>
              <div class="financial-metric">
                <div class="financial-metric-title">Copay / Coinsurance</div>
                <div class="financial-metric-amount">
                  ${dossier.financials.copay_amount > 0 ? `$${dossier.financials.copay_amount.toFixed(2)} Copay` : `${dossier.financials.coinsurance_percentage}% Coinsurance`}
                </div>
              </div>
              <div class="financial-metric" style="background: rgba(99, 102, 241, 0.15); border-color: rgba(99, 102, 241, 0.4);">
                <div class="financial-metric-title" style="color: #818cf8; font-weight: 700;">Total Patient Responsibility</div>
                <div class="financial-metric-amount" style="color: #38bdf8;">$${dossier.financials.estimated_patient_responsibility.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Explainable Risk Score Gauge & Factors -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Circular Risk Score Meter -->
          <div class="glass-panel risk-gauge-card">
            <h3 style="font-size: 1.05rem; font-weight: 700;">Explainable Risk Score</h3>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Deterministic Weighted Claim Risk</div>

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

            <div style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.4; padding: 0 0.5rem;">
              ${riskEval?.explanation || 'All standard clearance parameters assessed.'}
            </div>

            <!-- Contributing Factors List -->
            <div class="risk-factor-list">
              <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); text-align: left;">
                Contributing Risk Factors Breakdown:
              </div>

              ${(riskEval?.factors || []).map(f => {
                const barColor = f.status === 'FAIL' ? '#f43f5e' : f.status === 'WARNING' ? '#f59e0b' : '#10b981';
                const percent = Math.min(100, Math.max(10, (f.scoreContribution / (score || 1)) * 100));
                return `
                  <div class="risk-factor-item">
                    <div class="factor-header">
                      <span>${f.name}</span>
                      <span style="color: ${barColor}; font-weight: 700;">+${f.scoreContribution} pts</span>
                    </div>
                    <div class="factor-progress-bg">
                      <div class="factor-progress-fill" style="width: ${percent}%; background: ${barColor};"></div>
                    </div>
                    <div style="font-size: 0.7rem; color: var(--text-dim);">${f.description}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Recommended Actions Checklist -->
          <div class="glass-panel" style="padding: 1.5rem;">
            <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 1rem;">Recommended Action Items</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${dossier.clearance.recommended_actions.map(action => `
                <div style="display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.75rem; border-radius: var(--radius-sm); background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border);">
                  <input type="checkbox" style="margin-top: 3px; accent-color: #6366f1; cursor: pointer;" />
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
        showToast(`270/271 inquiry confirmed: ${dossier.insurance.payer_name} response received (Active).`, 'success');
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
