import { clearanceStore } from '../services/clearanceEngine';
import { showToast } from './toast';

export function renderAnalyticsView(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'analytics-view-container';

  function render(): void {
    const categories = clearanceStore.getDenialCategories();
    const payerStats = clearanceStore.getPayerStats();
    const rules = clearanceStore.getRules();
    const maxDenialCount = Math.max(...categories.map(c => c.count));

    container.innerHTML = `
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 800;">Root Cause Denial Analytics & Workflow Automation</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Identify systemic denial patterns upstream and configure autonomous preventive clearance guards.</p>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-export-rca" class="glass-btn glass-btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export RCA Report (CSV)
          </button>
        </div>
      </div>

      <!-- 2-Column Analytics Grids -->
      <div class="analytics-grid">
        
        <!-- Left: Top CARC Denial Categories Breakdown -->
        <div class="glass-panel analytics-card">
          <div class="analytics-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
            <span>Top Denial Reasons by CARC Code</span>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-dim); margin-bottom: 1.25rem;">Historical denial volume and estimated pre-service preventability rate.</p>

          <div style="display: flex; flex-direction: column;">
            ${categories.map(cat => {
              const widthPct = Math.round((cat.count / maxDenialCount) * 100);
              return `
                <div style="margin-bottom: 1.1rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; margin-bottom: 0.35rem;">
                    <div>
                      <span class="code-font" style="font-weight: 700; color: #fff;">${cat.code}</span>
                      <span style="color: var(--text-muted); margin-left: 6px;">${cat.category}</span>
                    </div>
                    <div>
                      <span style="font-weight: 800; color: #fff;">${cat.count}</span>
                      <span style="font-size: 0.72rem; color: #10b981; font-weight: 600; margin-left: 4px;">(${cat.preventablePercentage}% prev)</span>
                    </div>
                  </div>
                  <div class="bar-chart-track">
                    <div class="bar-chart-fill" style="width: ${widthPct}%; background: ${cat.color};"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right: Payer Denial Risk & Average Latency Table -->
        <div class="glass-panel analytics-card">
          <div class="analytics-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            <span>Payer Vulnerability & Resolution Latency</span>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-dim); margin-bottom: 1.25rem;">Real-time payer denial statistics and primary rejection drivers.</p>

          <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
            <thead>
              <tr style="border-bottom: 1px solid var(--glass-border); text-align: left; color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase;">
                <th style="padding: 0.6rem 0.5rem;">Payer</th>
                <th style="padding: 0.6rem 0.5rem;">Denial Rate</th>
                <th style="padding: 0.6rem 0.5rem;">Top Reason</th>
                <th style="padding: 0.6rem 0.5rem; text-align: right;">Avg Appeal Days</th>
              </tr>
            </thead>
            <tbody>
              ${payerStats.map(p => `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                  <td style="padding: 0.85rem 0.5rem; font-weight: 700; color: #fff;">${p.payerName}</td>
                  <td style="padding: 0.85rem 0.5rem;">
                    <span style="color: ${p.denialRate > 10 ? '#f43f5e' : '#10b981'}; font-weight: 700;">${p.denialRate}%</span>
                  </td>
                  <td style="padding: 0.85rem 0.5rem; color: var(--text-muted); font-size: 0.75rem;">${p.topDenialReason}</td>
                  <td style="padding: 0.85rem 0.5rem; text-align: right; font-weight: 600; color: #38bdf8;">${p.avgResolutionDays} days</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Preventive Automation Rules Engine Section -->
      <div class="glass-panel" style="padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <div class="analytics-title" style="margin-bottom: 0.25rem;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Configurable Preventive Clearance Rules</span>
            </div>
            <p style="font-size: 0.78rem; color: var(--text-dim);">Automated deterministic triggers that continuously scan upcoming schedules to intercept denials.</p>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${rules.map(rule => `
            <div class="rule-card">
              <div style="max-width: 80%;">
                <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.35rem;">
                  <span style="font-weight: 700; font-size: 0.95rem; color: #fff;">${rule.title}</span>
                  <span class="glass-badge badge-neutral" style="font-size: 0.65rem;">${rule.triggerType}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">
                  ${rule.description}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-accent); margin-top: 0.35rem;">
                  <strong>Condition:</strong> <span class="code-font">${rule.triggerCondition}</span> → <strong>Action:</strong> ${rule.action}
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 1.5rem;">
                <div style="text-align: right;">
                  <div style="font-size: 1.1rem; font-weight: 800; color: #10b981;">${rule.preventedCountThisMonth}</div>
                  <div style="font-size: 0.7rem; color: var(--text-dim);">Prevented MTD</div>
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

    // Attach event listeners
    const exportBtn = container.querySelector('#btn-export-rca');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        showToast('Exported Previa Root-Cause Analysis summary report to CSV.', 'success');
      });
    }

    container.querySelectorAll('.rule-toggle-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const input = e.target as HTMLInputElement;
        const ruleId = input.dataset.ruleId;
        if (ruleId) {
          const state = clearanceStore.toggleRule(ruleId);
          showToast(`Rule '${ruleId}' ${state ? 'ENABLED' : 'DISABLED'}.`, state ? 'success' : 'warning');
        }
      });
    });
  }

  render();
  return container;
}
