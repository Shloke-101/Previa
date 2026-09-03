import { clearanceStore } from '../services/clearanceEngine';
import { showToast } from './toast';

export function renderAnalyticsView(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'analytics-view-container';

  function render(): void {
    const categories = clearanceStore.getDenialCategories();
    const payerStats = clearanceStore.getPayerStats();
    const maxDenialCount = Math.max(...categories.map(c => c.count));

    container.innerHTML = `
      <!-- Header Area -->
      <div style="margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="glass-badge badge-indigo">Remittance Intelligence</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Historical EDI 835 Analytics</span>
          </div>
          <h2 style="font-size: 1.45rem; font-weight: 800; color: #fff;">
            Denial Analytics & Payer Vulnerability Intelligence
          </h2>
          <p style="color: var(--text-secondary); font-size: 0.85rem; max-width: 850px; margin-top: 2px;">
            Aggregate remittance insights, Claim Adjustment Reason Code (CARC) patterns, payer friction indices, and resolution latency analytics.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-export-rca" class="glass-btn glass-btn-primary glass-btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Export Analytics (CSV)</span>
          </button>
        </div>
      </div>

      <!-- 2-Column Analytics Grids -->
      <div class="analytics-grid">
        
        <!-- Left: Top CARC Denial Categories Breakdown -->
        <div class="glass-panel analytics-card">
          <div class="analytics-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
            <span style="color: #fff;">Top Denial Reasons by CARC Code</span>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Historical denial volume and estimated pre-service preventability rate.
          </p>

          <div style="display: flex; flex-direction: column; gap: 1.1rem;">
            ${categories.map(cat => {
              const widthPct = Math.round((cat.count / maxDenialCount) * 100);
              return `
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; margin-bottom: 0.35rem;">
                    <div>
                      <span class="code-font" style="font-weight: 800; color: #fff; background: rgba(255, 255, 255, 0.06); padding: 2px 6px; border-radius: 4px;">${cat.code}</span>
                      <span style="color: var(--text-secondary); margin-left: 8px; font-weight: 600;">${cat.category}</span>
                    </div>
                    <div>
                      <span style="font-weight: 800; color: #fff;">${cat.count}</span>
                      <span style="font-size: 0.72rem; color: #4ade80; font-weight: 700; margin-left: 6px;">(${cat.preventablePercentage}% prev)</span>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            <span style="color: #fff;">Payer Vulnerability & Resolution Latency</span>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Live payer denial statistics and primary rejection drivers.
          </p>

          <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
            <thead>
              <tr style="border-bottom: 1px solid var(--glass-border); text-align: left; color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase;">
                <th style="padding: 0.65rem 0.5rem;">Payer Name</th>
                <th style="padding: 0.65rem 0.5rem;">Denial Rate</th>
                <th style="padding: 0.65rem 0.5rem;">Primary CARC</th>
                <th style="padding: 0.65rem 0.5rem; text-align: right;">Avg Appeal Latency</th>
              </tr>
            </thead>
            <tbody>
              ${payerStats.map(p => `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                  <td style="padding: 0.95rem 0.5rem; font-weight: 700; color: #fff;">${p.payerName}</td>
                  <td style="padding: 0.95rem 0.5rem;">
                    <span style="color: ${p.denialRate > 10 ? '#f87171' : '#4ade80'}; font-weight: 800;">${p.denialRate}%</span>
                  </td>
                  <td style="padding: 0.95rem 0.5rem; color: var(--text-secondary); font-size: 0.75rem;">${p.topDenialReason}</td>
                  <td style="padding: 0.95rem 0.5rem; text-align: right; font-weight: 700; color: #38bdf8;">${p.avgResolutionDays} days</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Financial Loss Heatmap & Recovery Summary -->
      <div class="glass-panel" style="padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 800; color: #fff;">Financial Exposure & Preventable Dollar Recovery</h3>
            <p style="font-size: 0.78rem; color: var(--text-muted);">Cumulative monthly breakdown of avoidable write-offs vs protected revenue.</p>
          </div>
          <span class="glass-badge badge-cleared">$184,200 Recovered MTD</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); padding: 1rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Total Incurred Charges</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #fff; margin-top: 2px;">$1,248,500</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Current billing cycle</div>
          </div>

          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); padding: 1rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Historical Denial Exposure</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #f87171; margin-top: 2px;">$218,400</div>
            <div style="font-size: 0.7rem; color: #fca5a5; margin-top: 2px;">Without Previa interception</div>
          </div>

          <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); padding: 1rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: #4ade80; text-transform: uppercase; font-weight: 700;">Protected by Previa Guard</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #4ade80; margin-top: 2px;">$184,200</div>
            <div style="font-size: 0.7rem; color: #86efac; margin-top: 2px;">84.3% direct protection</div>
          </div>

          <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); padding: 1rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: #38bdf8; text-transform: uppercase; font-weight: 700;">Staff Appeal Labor Saved</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #38bdf8; margin-top: 2px;">420 Hours</div>
            <div style="font-size: 0.7rem; color: #7dd3fc; margin-top: 2px;">$18,900 operational savings</div>
          </div>
        </div>
      </div>
    `;

    // Listeners
    const exportBtn = container.querySelector('#btn-export-rca');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        showToast('Exported Previa Root-Cause Analysis summary report to CSV.', 'success');
      });
    }
  }

  render();
  return container;
}
