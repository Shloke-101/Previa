import { showToast } from './toast';

export function renderTopbar(
  currentTab: string,
  onQuickAction?: (action: string) => void
): HTMLElement {
  const topbar = document.createElement('header');
  topbar.className = 'app-topbar';

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Executive AI Command Center',
      subtitle: 'Systemic pre-visit clearance, risk interception radar & pipeline analytics'
    },
    queue: {
      title: 'Priority Financial Clearance Queue',
      subtitle: 'Pre-encounter worklist, real-time EDI 270 verification & 1-click clearance'
    },
    'root-cause': {
      title: 'Root Cause Denial Analysis (RCA)',
      subtitle: 'AI pattern detection: Transforming recurring claim denials into upstream workflow prevention'
    },
    workflow: {
      title: 'Upstream Workflow Optimization',
      subtitle: 'Before vs After process architecture & autonomous scheduling guard rails'
    },
    ocr: {
      title: 'Insurance Card OCR & Optical Validation',
      subtitle: 'Tesseract/OpenCV extraction, bounding box verification & 1-click EHR synchronization'
    },
    dossier: {
      title: 'Patient Clearance Dossier & Risk Breakdown',
      subtitle: 'Explainable deterministic risk scoring, benefits calculus & prior auth resolution'
    },
    analytics: {
      title: 'Denial Analytics & Payer Intelligence',
      subtitle: 'CARC code distribution, payer vulnerability metrics & revenue at risk'
    },
    rules: {
      title: 'Preventive Clearance Rules Engine',
      subtitle: 'Autonomous deterministic triggers and pre-service scheduling interceptors'
    }
  };

  const currentMeta = tabTitles[currentTab] || tabTitles.dashboard;

  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  topbar.innerHTML = `
    <div class="topbar-left">
      <div class="topbar-title-area">
        <h2>${currentMeta.title}</h2>
        <span>${currentMeta.subtitle}</span>
      </div>
    </div>

    <div class="topbar-right">
      <!-- Quick Omnisearch Input -->
      <div style="position: relative; display: flex; align-items: center;">
        <input
          type="text"
          id="global-omnisearch"
          class="glass-input"
          placeholder="Quick search MRN, CPT, Payer... (Press /)"
          style="padding-left: 2rem; width: 260px; font-size: 0.8rem;"
        />
        <svg style="position: absolute; left: 0.65rem; color: var(--text-muted);" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </div>

      <!-- Live Date Pill -->
      <div class="glass-badge badge-neutral" style="padding: 0.4rem 0.8rem; gap: 0.5rem; font-size: 0.75rem;">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: #22c55e; display: inline-block;"></span>
        <span>${dateString}</span>
      </div>

      <!-- Quick Action: Re-Verify 270 -->
      <button id="btn-topbar-reverify" class="glass-btn glass-btn-primary glass-btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
        <span>Live 270 Sync</span>
      </button>

      <!-- Notification Bell -->
      <button id="btn-topbar-notif" class="glass-btn glass-btn-secondary glass-btn-sm" style="position: relative; padding: 0.4rem 0.6rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        <span style="position: absolute; top: -3px; right: -3px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 2px solid #060b14;"></span>
      </button>
    </div>
  `;

  // Attach Topbar listeners
  const reverifyBtn = topbar.querySelector('#btn-topbar-reverify');
  if (reverifyBtn) {
    reverifyBtn.addEventListener('click', () => {
      showToast('Initiated live 270/271 batch re-verification query with all connected payer gateways.', 'success');
      if (onQuickAction) onQuickAction('reverify');
    });
  }

  const notifBtn = topbar.querySelector('#btn-topbar-notif');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      showToast('3 High-Risk clearance blockers detected for tomorrow\'s appointments.', 'warning');
    });
  }

  const omnisearch = topbar.querySelector('#global-omnisearch') as HTMLInputElement;
  if (omnisearch) {
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== omnisearch) {
        e.preventDefault();
        omnisearch.focus();
      }
    });
  }

  return topbar;
}
