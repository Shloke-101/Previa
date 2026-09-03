import { clearanceStore } from '../services/clearanceEngine';
import { ClearanceStatus } from '../types/clearance';
import { showToast } from './toast';

export function renderQueueView(
  onSelectPatient: (patientId: string) => void,
  onOpenOcr: (patientId: string) => void
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
        item.payer_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    container.innerHTML = `
      <!-- Stats Overview Cards -->
      <div class="stats-grid">
        <div class="glass-panel stat-card">
          <div class="stat-icon" style="background: rgba(99, 102, 241, 0.2); color: #818cf8;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div class="stat-value">${totalCount}</div>
            <div class="stat-label">Total Pre-Visit Encounters</div>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon" style="background: var(--status-cleared-bg); color: var(--status-cleared);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <div class="stat-value">${clearedCount} <span style="font-size: 0.9rem; color: var(--status-cleared); font-weight: 600;">(${Math.round((clearedCount / totalCount) * 100)}%)</span></div>
            <div class="stat-label">Cleared for Visit</div>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon" style="background: var(--status-action-bg); color: var(--status-action);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <div class="stat-value">${actionCount}</div>
            <div class="stat-label">Needs Action (Resolvable)</div>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon" style="background: var(--status-risk-bg); color: var(--status-risk);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <div class="stat-value">${highRiskCount}</div>
            <div class="stat-label">High-Risk Denial Blockers</div>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon" style="background: rgba(6, 182, 212, 0.2); color: #06b6d4;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <div class="stat-value">$${atRiskRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="stat-label">Uncleared Patient Copay/Ded</div>
          </div>
        </div>
      </div>

      <!-- Queue Controls Filter Bar -->
      <div class="glass-panel queue-controls-bar">
        <div class="search-filter-group">
          <div style="position: relative; flex: 1;">
            <input
              type="text"
              id="queue-search"
              class="glass-input"
              placeholder="Search patient, Member ID, CPT or Payer..."
              value="${searchQuery}"
              style="width: 100%; padding-left: 2.25rem;"
            />
            <svg style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-dim);" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>

          <select id="queue-status-filter" class="glass-input glass-select" style="min-width: 160px;">
            <option value="ALL" ${currentFilter === 'ALL' ? 'selected' : ''}>All Clearance States</option>
            <option value="HIGH_RISK" ${currentFilter === 'HIGH_RISK' ? 'selected' : ''}>High Risk</option>
            <option value="NEEDS_ACTION" ${currentFilter === 'NEEDS_ACTION' ? 'selected' : ''}>Needs Action</option>
            <option value="CLEARED" ${currentFilter === 'CLEARED' ? 'selected' : ''}>Cleared</option>
          </select>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-batch-reverify" class="glass-btn glass-btn-primary glass-btn-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Run 270 Re-Verification</span>
          </button>
        </div>
      </div>

      <!-- Priority Worklist Table -->
      <div class="glass-panel queue-table-container">
        <table class="queue-table">
          <thead>
            <tr>
              <th>Patient & Appointment</th>
              <th>Payer & Policy</th>
              <th>Service / Procedure</th>
              <th>Clearance Status</th>
              <th>Risk Score</th>
              <th>Prior Auth</th>
              <th>Est. Patient Resp.</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${
              filteredItems.length === 0
                ? `<tr><td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-muted);">No encounters found matching current criteria.</td></tr>`
                : filteredItems.map(item => `
                  <tr data-patient-id="${item.patient_id}">
                    <td>
                      <div class="patient-cell">
                        <span class="patient-name">${item.patient_name}</span>
                        <span class="patient-meta code-font">${item.patient_id} • DOB: ${item.dob}</span>
                        <span class="patient-meta" style="color: var(--text-accent); margin-top: 2px;">
                          📅 ${item.appointment_datetime}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style="font-weight: 600;">${item.payer_name}</div>
                      <div class="code-font" style="font-size: 0.75rem; color: var(--text-muted);">ID: ${item.member_id}</div>
                      <div style="font-size: 0.75rem; color: ${item.eligibility_status === 'ACTIVE' ? '#10b981' : '#f43f5e'};">
                        ● ${item.eligibility_status}
                      </div>
                    </td>
                    <td>
                      <div style="font-weight: 600;">${item.procedure_name}</div>
                      <div class="code-font" style="font-size: 0.75rem; color: var(--text-muted);">CPT: ${item.procedure_code}</div>
                    </td>
                    <td>
                      ${getStatusBadge(item.clearance_status)}
                      ${item.primary_blocker ? `<div style="font-size: 0.7rem; color: var(--text-dim); max-width: 200px; margin-top: 4px;" class="truncate" title="${item.primary_blocker}">${item.primary_blocker}</div>` : ''}
                    </td>
                    <td>
                      <div class="risk-pill ${item.risk_level.toLowerCase()}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                        <span>${item.risk_score} / 100</span>
                      </div>
                    </td>
                    <td>
                      ${getAuthBadge(item.authorization_status, item.auth_number)}
                    </td>
                    <td>
                      <div style="font-weight: 700; font-size: 0.95rem;">$${item.estimated_patient_responsibility.toFixed(2)}</div>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 0.5rem;">
                        <button class="glass-btn glass-btn-sm btn-open-dossier" data-id="${item.patient_id}" title="View Patient Dossier & Risk Breakdown">
                          Dossier
                        </button>
                        ${item.clearance_status !== 'CLEARED' ? `
                          <button class="glass-btn glass-btn-sm glass-btn-primary btn-quick-resolve" data-id="${item.patient_id}">
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
        // Restore focus
        const nextInput = container.querySelector('#queue-search') as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
        }
      });
    }

    const filterSelect = container.querySelector('#queue-status-filter') as HTMLSelectElement;
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        currentFilter = (e.target as HTMLSelectElement).value;
        render();
      });
    }

    const batchBtn = container.querySelector('#btn-batch-reverify');
    if (batchBtn) {
      batchBtn.addEventListener('click', () => {
        showToast('Initiated batch 270/271 real-time eligibility re-verification for 6 encounters.', 'success');
      });
    }

    container.querySelectorAll('.btn-open-dossier').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pId = (e.currentTarget as HTMLElement).dataset.id;
        if (pId) onSelectPatient(pId);
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
