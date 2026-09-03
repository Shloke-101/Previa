import { clearanceStore } from '../services/clearanceEngine';
import { ClearanceStatus } from '../types/clearance';
import { showToast } from './toast';

export function renderQueueView(
  onSelectPatient: (patientId: string) => void,
  onOpenOcr?: (patientId: string) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'queue-view-container';

  let currentFilter: string = 'ALL';
  let searchQuery: string = '';

  function render(): void {
    const queue = clearanceStore.getQueue();
    const totalCount = queue.length;
    const clearedCount = queue.filter(q => q.clearance_status === 'CLEARED').length;
    const actionCount = queue.filter(q => q.clearance_status === 'NEEDS_ACTION').length;
    const highRiskCount = queue.filter(q => q.clearance_status === 'HIGH_RISK').length;
    const atRiskRevenue = queue
      .filter(q => q.clearance_status !== 'CLEARED')
      .reduce((sum, item) => sum + item.estimated_patient_responsibility, 0);

    const filteredItems = queue.filter(item => {
      const matchesFilter = currentFilter === 'ALL' || item.clearance_status === currentFilter;
      const matchesSearch =
        item.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.member_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.procedure_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.procedure_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.payer_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    container.innerHTML = `
      <!-- Stats Overview KPI Grid -->
      <div class="kpi-grid" style="margin-bottom: 1.75rem;">
        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Total Worklist Encounters</div>
              <div class="kpi-value">${totalCount}</div>
            </div>
            <div class="kpi-icon" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span>Next 72-hour clinical schedule</span>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Cleared for Visit</div>
              <div class="kpi-value" style="color: #4ade80;">
                ${clearedCount} <span style="font-size: 0.95rem; color: var(--text-muted); font-weight: 600;">(${Math.round((clearedCount / (totalCount || 1)) * 100)}%)</span>
              </div>
            </div>
            <div class="kpi-icon" style="background: rgba(34, 197, 94, 0.15); color: #4ade80;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span class="kpi-trend-up">● Zero Blockers</span>
            <span>Ready for expedited check-in</span>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Needs Action (Resolvable)</div>
              <div class="kpi-value" style="color: #fbbf24;">${actionCount}</div>
            </div>
            <div class="kpi-icon" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span>Minor discrepancies / pending auth</span>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">High-Risk Denial Blockers</div>
              <div class="kpi-value" style="color: #f87171;">${highRiskCount}</div>
            </div>
            <div class="kpi-icon" style="background: rgba(239, 68, 68, 0.15); color: #f87171;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span>Missing mandatory auth / Terminated</span>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-card-header">
            <div>
              <div class="kpi-label">Uncleared Copay / Ded</div>
              <div class="kpi-value" style="color: #38bdf8;">$${atRiskRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="kpi-icon" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>
          <div class="kpi-subtext">
            <span>At-risk patient responsibility</span>
          </div>
        </div>
      </div>

      <!-- Quick Status Filter Segmented Control & Search -->
      <div class="glass-panel queue-controls-bar">
        <div class="search-filter-group">
          <div style="position: relative; flex: 1;">
            <input
              type="text"
              id="queue-search"
              class="glass-input"
              placeholder="Search patient name, MRN, CPT code or Payer..."
              value="${searchQuery}"
              style="width: 100%; padding-left: 2.25rem;"
            />
            <svg style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>

          <!-- Filter Pills -->
          <div style="display: flex; gap: 0.35rem; background: rgba(0, 0, 0, 0.25); padding: 0.25rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
            <button class="filter-pill-btn ${currentFilter === 'ALL' ? 'active' : ''}" data-status="ALL">
              All (${totalCount})
            </button>
            <button class="filter-pill-btn ${currentFilter === 'HIGH_RISK' ? 'active' : ''}" data-status="HIGH_RISK" style="color: ${currentFilter === 'HIGH_RISK' ? '#fff' : '#f87171'};">
              High Risk (${highRiskCount})
            </button>
            <button class="filter-pill-btn ${currentFilter === 'NEEDS_ACTION' ? 'active' : ''}" data-status="NEEDS_ACTION" style="color: ${currentFilter === 'NEEDS_ACTION' ? '#fff' : '#fbbf24'};">
              Needs Action (${actionCount})
            </button>
            <button class="filter-pill-btn ${currentFilter === 'CLEARED' ? 'active' : ''}" data-status="CLEARED" style="color: ${currentFilter === 'CLEARED' ? '#fff' : '#4ade80'};">
              Cleared (${clearedCount})
            </button>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button id="btn-batch-reverify" class="glass-btn glass-btn-primary glass-btn-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Batch 270 Re-Verification</span>
          </button>
        </div>
      </div>

      <!-- Priority Worklist Table -->
      <div class="glass-panel queue-table-container">
        <table class="queue-table">
          <thead>
            <tr>
              <th style="min-width: 220px;">Patient & Appointment</th>
              <th style="min-width: 180px;">Payer & Policy</th>
              <th style="min-width: 200px;">Service / Procedure</th>
              <th style="min-width: 170px;">Clearance Status</th>
              <th style="min-width: 120px;">Risk Score</th>
              <th style="min-width: 140px;">Prior Auth</th>
              <th style="min-width: 110px;">Patient Resp.</th>
              <th style="text-align: right; min-width: 150px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${
              filteredItems.length === 0
                ? `<tr><td colspan="8" style="text-align: center; padding: 3.5rem; color: var(--text-muted);">No encounters found matching current filter criteria.</td></tr>`
                : filteredItems.map(item => `
                  <tr data-patient-id="${item.patient_id}">
                    <td>
                      <div class="patient-cell">
                        <span class="patient-name">${item.patient_name}</span>
                        <span class="patient-meta code-font">${item.patient_id} • DOB: ${item.dob}</span>
                        <span class="patient-meta" style="color: #38bdf8; margin-top: 2px;">
                          📅 ${item.appointment_datetime}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: #fff;">${item.payer_name}</div>
                      <div class="code-font" style="font-size: 0.75rem; color: var(--text-muted);">ID: ${item.member_id}</div>
                      <div style="font-size: 0.72rem; color: ${item.eligibility_status === 'ACTIVE' ? '#4ade80' : '#f87171'}; font-weight: 600; margin-top: 2px;">
                        ● ${item.eligibility_status}
                      </div>
                    </td>
                    <td>
                      <div style="font-weight: 700; color: #fff;">${item.procedure_name}</div>
                      <div class="code-font" style="font-size: 0.75rem; color: var(--text-muted);">CPT: ${item.procedure_code}</div>
                    </td>
                    <td>
                      ${getStatusBadge(item.clearance_status)}
                      ${item.primary_blocker ? `<div style="font-size: 0.72rem; color: #fca5a5; max-width: 220px; margin-top: 4px;" class="truncate" title="${item.primary_blocker}">⚠️ ${item.primary_blocker}</div>` : ''}
                    </td>
                    <td>
                      <div class="risk-pill ${item.risk_level.toLowerCase()}">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                        <span>${item.risk_score} / 100</span>
                      </div>
                    </td>
                    <td>
                      ${getAuthBadge(item.authorization_status, item.auth_number)}
                    </td>
                    <td>
                      <div style="font-weight: 800; font-size: 0.95rem; color: #fff;">$${item.estimated_patient_responsibility.toFixed(2)}</div>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 0.45rem;">
                        <button class="glass-btn glass-btn-xs btn-open-dossier" data-id="${item.patient_id}" title="View Patient Clearance Dossier">
                          Dossier
                        </button>
                        ${item.data_validation_status === 'MISMATCH' && onOpenOcr ? `
                          <button class="glass-btn glass-btn-xs glass-btn-secondary btn-open-ocr-row" data-id="${item.patient_id}" title="Open OCR Scanner">
                            OCR
                          </button>
                        ` : ''}
                        ${item.clearance_status !== 'CLEARED' ? `
                          <button class="glass-btn glass-btn-xs glass-btn-primary btn-quick-resolve" data-id="${item.patient_id}">
                            Clear
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `).join('')
            }
          </tbody>
        </table>
      </div>
    `;

    // Attach Event Listeners
    const searchInput = container.querySelector('#queue-search') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target as HTMLInputElement).value;
        render();
        const nextInput = container.querySelector('#queue-search') as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
        }
      });
    }

    container.querySelectorAll('.filter-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetStatus = (e.currentTarget as HTMLElement).dataset.status;
        if (targetStatus) {
          currentFilter = targetStatus;
          render();
        }
      });
    });

    const batchBtn = container.querySelector('#btn-batch-reverify');
    if (batchBtn) {
      batchBtn.addEventListener('click', () => {
        showToast('Initiated batch 270/271 real-time eligibility re-verification for all scheduled encounters.', 'success');
      });
    }

    container.querySelectorAll('.btn-open-dossier').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pId = (e.currentTarget as HTMLElement).dataset.id;
        if (pId) onSelectPatient(pId);
      });
    });

    container.querySelectorAll('.btn-open-ocr-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pId = (e.currentTarget as HTMLElement).dataset.id;
        if (pId && onOpenOcr) onOpenOcr(pId);
      });
    });

    container.querySelectorAll('.btn-quick-resolve').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pId = (e.currentTarget as HTMLElement).dataset.id;
        if (pId) {
          clearanceStore.approvePriorAuth(pId);
          showToast(`Encounter for ${pId} has been resolved and financially CLEARED!`, 'success');
          render();
        }
      });
    });
  }

  function getStatusBadge(status: ClearanceStatus): string {
    switch (status) {
      case 'CLEARED':
        return `<span class="glass-badge badge-cleared"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> CLEARED</span>`;
      case 'NEEDS_ACTION':
        return `<span class="glass-badge badge-needs-action"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg> NEEDS ACTION</span>`;
      case 'HIGH_RISK':
        return `<span class="glass-badge badge-high-risk"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg> HIGH RISK</span>`;
    }
  }

  function getAuthBadge(status: string, authNum?: string): string {
    switch (status) {
      case 'APPROVED':
        return `<span class="glass-badge badge-cleared" title="${authNum || ''}">APPROVED</span>`;
      case 'REQUIRED':
        return `<span class="glass-badge badge-high-risk">REQUIRED (MISSING)</span>`;
      case 'PENDING':
        return `<span class="glass-badge badge-needs-action">PENDING</span>`;
      case 'NOT_REQUIRED':
      default:
        return `<span class="glass-badge badge-neutral">NOT REQ</span>`;
    }
  }

  render();
  return container;
}
