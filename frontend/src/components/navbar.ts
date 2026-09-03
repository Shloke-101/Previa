export function renderNavbar(activeTab: string, onTabChange: (tab: string) => void): HTMLElement {
  const nav = document.createElement('header');
  nav.className = 'glass-nav';

  nav.innerHTML = `
    <div class="brand-container">
      <div class="brand-icon-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>
      <div>
        <div class="brand-name">Previa PVFC</div>
        <div class="brand-subtitle">Pre-Visit Financial Clearance System</div>
      </div>
    </div>

    <nav class="nav-tabs" role="tablist">
      <button class="nav-tab-btn ${activeTab === 'queue' ? 'active' : ''}" data-tab="queue">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="m9 14 2 2 4-4"/></svg>
        <span>Priority Queue</span>
      </button>

      <button class="nav-tab-btn ${activeTab === 'ocr' ? 'active' : ''}" data-tab="ocr">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        <span>Insurance OCR Intake</span>
      </button>

      <button class="nav-tab-btn ${activeTab === 'dossier' ? 'active' : ''}" data-tab="dossier">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
        <span>Patient Dossier & Risk</span>
      </button>

      <button class="nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        <span>Denial Analytics & Automation</span>
      </button>
    </nav>

    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <span class="glass-badge badge-cleared" style="padding: 0.4rem 0.8rem;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: pulseBox 1.5s infinite;"></span>
        Live Payer Gateway
      </span>
    </div>
  `;

  nav.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = (e.currentTarget as HTMLElement).dataset.tab;
      if (target) {
        onTabChange(target);
      }
    });
  });

  return nav;
}
