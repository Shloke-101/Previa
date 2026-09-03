import { clearanceStore } from '../services/clearanceEngine';
import { showToast } from './toast';

export function renderRulesView(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'rules-view-container';

  function render(): void {
    const rules = clearanceStore.getRules();
    const totalPrevented = rules.reduce((sum, r) => sum + r.preventedCountThisMonth, 0);

    container.innerHTML = `
      <!-- Header Area -->
      <div style="margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="glass-badge badge-cleared">Autonomous Guard Rails</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Deterministic Enforcement Engine</span>
          </div>
          <h2 style="font-size: 1.45rem; font-weight: 800; color: #fff;">
            Configurable Preventive Clearance Rules
          </h2>
          <p style="color: var(--text-secondary); font-size: 0.85rem; max-width: 850px; margin-top: 2px;">
            Deterministic guard triggers that continuously scan upcoming schedules and EHR orders to intercept coverage gaps, expired auths, and data mismatches before the patient visit.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-add-rule" class="glass-btn glass-btn-primary glass-btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Add Preventive Guard Rule</span>
          </button>
        </div>
      </div>

      <!-- Quick Stats Grid -->
      <div class="kpi-grid" style="margin-bottom: 2rem;">
        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Active Guard Rules</div>
              <div class="kpi-value" style="color: #38bdf8;">${rules.filter(r => r.enabled).length} / ${rules.length}</div>
            </div>
            <div class="kpi-icon" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span>Deterministic pre-service triggers</span>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Denials Intercepted MTD</div>
              <div class="kpi-value" style="color: #4ade80;">${totalPrevented}</div>
            </div>
            <div class="kpi-icon" style="background: rgba(34, 197, 94, 0.15); color: #4ade80;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span class="kpi-trend-up">↑ 18.2%</span>
            <span>intercepted before patient check-in</span>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Autonomous Enforcement</div>
              <div class="kpi-value" style="color: #a78bfa;">100%</div>
            </div>
            <div class="kpi-icon" style="background: rgba(139, 92, 246, 0.15); color: #c084fc;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span>Deterministic rule precedence</span>
          </div>
        </div>
      </div>

      <!-- Rules List Panel -->
      <div class="glass-panel" style="padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h3 style="font-size: 1.1rem; font-weight: 800; color: #fff;">
            Active Pre-Service Interceptor Rules
          </h3>
          <span class="glass-badge badge-neutral code-font" style="font-size: 0.72rem;">Engine: Deterministic Rule Matrix</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${rules.map(rule => `
            <div class="rule-card">
              <div style="max-width: 78%;">
                <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.35rem;">
                  <span style="font-weight: 800; font-size: 0.98rem; color: #fff;">${rule.title}</span>
                  <span class="glass-badge badge-${rule.triggerType === 'TIME_BASED' ? 'cyan' : 'indigo'}" style="font-size: 0.65rem;">
                    ${rule.triggerType}
                  </span>
                  ${rule.enabled ? `
                    <span class="glass-badge badge-cleared" style="font-size: 0.65rem;">ACTIVE</span>
                  ` : `
                    <span class="glass-badge badge-neutral" style="font-size: 0.65rem;">PAUSED</span>
                  `}
                </div>
                <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
                  ${rule.description}
                </div>
                <div style="font-size: 0.75rem; margin-top: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                  <span style="color: var(--text-muted); font-weight: 700;">Condition:</span>
                  <span class="code-font" style="color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 2px 6px; border-radius: 4px;">
                    ${rule.triggerCondition}
                  </span>
                  <span style="color: var(--text-muted); font-weight: 700;">→ Action:</span>
                  <span class="code-font" style="color: #4ade80; background: rgba(34, 197, 94, 0.1); padding: 2px 6px; border-radius: 4px;">
                    ${rule.action}
                  </span>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 1.75rem; flex-shrink: 0;">
                <div style="text-align: right;">
                  <div style="font-size: 1.25rem; font-weight: 800; color: #4ade80;">${rule.preventedCountThisMonth}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">Prevented MTD</div>
                </div>

                <label class="toggle-switch">
                  <input type="checkbox" class="rule-toggle-checkbox" data-rule-id="${rule.id}" ${rule.enabled ? 'checked' : ''} />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Listeners
    const addRuleBtn = container.querySelector('#btn-add-rule');
    if (addRuleBtn) {
      addRuleBtn.addEventListener('click', () => {
        showToast('Rule Builder: Pre-populating new prior auth threshold trigger for cardiology CPT series.', 'info');
      });
    }

    container.querySelectorAll('.rule-toggle-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const input = e.target as HTMLInputElement;
        const ruleId = input.dataset.ruleId;
        if (ruleId) {
          const state = clearanceStore.toggleRule(ruleId);
          showToast(`Rule '${ruleId}' ${state ? 'ENABLED' : 'DISABLED'}.`, state ? 'success' : 'warning');
          render();
        }
      });
    });
  }

  render();
  return container;
}
