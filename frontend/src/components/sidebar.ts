export function renderSidebar(
  activeTab: string,
  onTabChange: (tab: string) => void,
  counts: { highRisk: number; needsAction: number; total: number }
): HTMLElement {
  const sidebar = document.createElement('aside');
  sidebar.className = 'app-sidebar';

  sidebar.innerHTML = `
    <div>
      <!-- Brand Header -->
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <div class="sidebar-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <div class="sidebar-brand-text">
            <h1>PREVIA</h1>
            <p>Healthcare AI Intelligence</p>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav">
        <div class="nav-section-title">Core Command</div>

        <button class="sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          <span>Executive Dashboard</span>
        </button>

        <button class="sidebar-nav-item ${activeTab === 'queue' ? 'active' : ''}" data-tab="queue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="m9 14 2 2 4-4"/></svg>
          <span>Clearance Queue</span>
          ${counts.highRisk > 0 ? `<span class="sidebar-nav-badge badge-high-risk">${counts.highRisk} High</span>` : ''}
        </button>

        <button class="sidebar-nav-item ${activeTab === 'dossier' ? 'active' : ''}" data-tab="dossier">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
          <span>Patient Dossier & Risk</span>
        </button>

        <div class="nav-section-title">Upstream Prevention</div>

        <button class="sidebar-nav-item ${activeTab === 'root-cause' ? 'active' : ''}" data-tab="root-cause">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
          <span>Root Cause Analysis</span>
          <span class="sidebar-nav-badge badge-ai">AI Core</span>
        </button>

        <button class="sidebar-nav-item ${activeTab === 'workflow' ? 'active' : ''}" data-tab="workflow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <span>Workflow Optimization</span>
        </button>

        <button class="sidebar-nav-item ${activeTab === 'rules' ? 'active' : ''}" data-tab="rules">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Preventive Rules</span>
        </button>

        <div class="nav-section-title">Data & Intake</div>

        <button class="sidebar-nav-item ${activeTab === 'ocr' ? 'active' : ''}" data-tab="ocr">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          <span>Insurance Card OCR</span>
        </button>

        <button class="sidebar-nav-item ${activeTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          <span>Denial Analytics & Intel</span>
        </button>
      </nav>
    </div>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer">
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: var(--radius-md);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
          <span style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">EDI Payer Gateway</span>
          <span style="width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px #22c55e;"></span>
        </div>
        <div style="font-size: 0.75rem; font-weight: 600; color: #fff;">Real-Time 270/271 Active</div>
        <div class="code-font" style="font-size: 0.65rem; color: #38bdf8; margin-top: 2px;">Latency: 18ms • 99.8% Sync</div>
      </div>

      <div class="user-profile-widget">
        <div class="user-avatar">DV</div>
        <div style="overflow: hidden;">
          <div style="font-size: 0.82rem; font-weight: 700; color: #fff;" class="truncate">Dr. Eleanor Vance</div>
          <div style="font-size: 0.68rem; color: var(--text-muted);" class="truncate">RCM Operations Director</div>
        </div>
      </div>
    </div>
  `;

  sidebar.querySelectorAll('.sidebar-nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = (e.currentTarget as HTMLElement).dataset.tab;
      if (target) {
        onTabChange(target);
      }
    });
  });

  return sidebar;
}
