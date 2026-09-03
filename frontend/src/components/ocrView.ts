import { clearanceStore } from '../services/clearanceEngine';
import { showToast } from './toast';

export function renderOcrView(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'ocr-view-container';

  const samples = clearanceStore.getCardSamples();
  let activeSampleId = samples[0]?.id || '';
  let activeHoverField: string | null = null;

  function render(): void {
    const currentSample = samples.find(s => s.id === activeSampleId) || samples[0];
    if (!currentSample) return;

    container.innerHTML = `
      <div style="margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="glass-badge badge-ai">Optical Mesh Intelligence</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Tesseract + OpenCV Neural Parser</span>
          </div>
          <h2 style="font-size: 1.45rem; font-weight: 800; color: #fff;">
            Insurance Card OCR & Field Reconciliation Matrix
          </h2>
          <p style="color: var(--text-secondary); font-size: 0.85rem; max-width: 850px; margin-top: 2px;">
            Extract physical member cards in real time, detect person-code suffix discrepancies, and synchronize with EHR records before 837 EDI claim generation.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;">Sample Card Preset:</span>
          <select id="ocr-preset-select" class="glass-input glass-select" style="min-width: 240px;">
            ${samples.map(s => `
              <option value="${s.id}" ${s.id === activeSampleId ? 'selected' : ''}>${s.payerName} (${s.fields.some(f => f.status === 'MISMATCH') ? '⚠️ Suffix Mismatch' : '✓ Verified Clean'})</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="ocr-container">
        <!-- Left: Insurance Card Visual Preview with OCR Bounding Boxes -->
        <div class="glass-panel card-preview-wrapper">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.95rem; color: #fff;">Physical Card OCR Optical Mesh</span>
            <span class="glass-badge badge-cyan" style="font-size: 0.7rem;">Mesh Active</span>
          </div>

          <div class="insurance-card-mockup" style="background: ${currentSample.cardImageColor};">
            <!-- Simulated Card Header & Chip -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-size: 1.15rem; font-weight: 800; letter-spacing: 0.05em; color: #fff;">${currentSample.payerName}</div>
                <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.75);">${currentSample.planType}</div>
              </div>
              <div class="card-chip"></div>
            </div>

            <!-- Card Bounding Boxes -->
            ${currentSample.fields.map(f => {
              if (!f.box) return '';
              const isActive = activeHoverField === f.fieldName;
              return `
                <div
                  class="ocr-bounding-box ${isActive ? 'active' : ''}"
                  style="left: ${f.box.x}%; top: ${f.box.y}%; width: ${f.box.width}%; height: ${f.box.height}%;"
                  data-field="${f.fieldName}"
                  title="${f.label}: ${f.ocrValue} (${Math.round(f.confidence * 100)}% Conf)"
                >
                  <span style="position: absolute; top: -18px; left: 0; font-size: 0.65rem; background: rgba(6, 11, 20, 0.9); color: #38bdf8; padding: 1px 5px; border-radius: 3px; font-weight: 700; white-space: nowrap; border: 1px solid rgba(56, 189, 248, 0.4);">
                    ${f.box.label} (${Math.round(f.confidence * 100)}%)
                  </span>
                </div>
              `;
            }).join('')}

            <!-- Card Visual Details -->
            <div style="position: absolute; bottom: 1.5rem; left: 1.5rem; right: 1.5rem; display: flex; justify-content: space-between; font-size: 0.75rem; color: rgba(255, 255, 255, 0.85);">
              <div>
                <div style="font-size: 0.65rem; text-transform: uppercase; color: rgba(255, 255, 255, 0.6); font-weight: 700;">RxBIN / RxPCN</div>
                <div class="code-font" style="color: #fff; font-weight: 600;">${currentSample.rxBin} / ${currentSample.rxPcn}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.65rem; text-transform: uppercase; color: rgba(255, 255, 255, 0.6); font-weight: 700;">Member DOB</div>
                <div class="code-font" style="color: #fff; font-weight: 600;">${currentSample.dob}</div>
              </div>
            </div>
          </div>

          <!-- Drag and Drop Simulator -->
          <div style="border: 2px dashed var(--glass-border); border-radius: var(--radius-md); padding: 1.25rem; text-align: center; background: rgba(255, 255, 255, 0.02); cursor: pointer; transition: all var(--transition-fast);" id="dropzone-upload">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" style="margin-bottom: 0.45rem;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <div style="font-size: 0.85rem; font-weight: 700; color: #fff;">Upload or Drop Insurance Card Image</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Accepts JPG, PNG, DICOM or PDF scans • Auto-detects card angle</div>
          </div>
        </div>

        <!-- Right: Field Comparison & Validation Matrix -->
        <div class="glass-panel comparison-table-wrapper">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 800; color: #fff;">Field Validation & Reconciliation</h3>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Comparing optical card extraction with Hospital Master EHR</div>
            </div>
            <button id="btn-sync-all-fields" class="glass-btn glass-btn-primary glass-btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.5 2-19 19"/><path d="M21.5 2H16"/><path d="M21.5 2v5.5"/></svg>
              <span>1-Click Sync Mismatches</span>
            </button>
          </div>

          <div style="display: flex; flex-direction: column;">
            <div class="comparison-row" style="font-weight: 700; color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase; background: rgba(11, 17, 32, 0.4);">
              <div>Field</div>
              <div>OCR Card Extraction</div>
              <div>EHR Master Record</div>
              <div style="text-align: right;">Match Status</div>
            </div>

            ${currentSample.fields.map(f => `
              <div class="comparison-row field-row" data-field="${f.fieldName}">
                <div class="field-label">${f.label}</div>
                <div>
                  <div class="field-val code-font" style="color: #fff; font-weight: 700;">${f.ocrValue}</div>
                  <div style="font-size: 0.7rem; color: #38bdf8;">Confidence: ${(f.confidence * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div class="field-val code-font" style="color: ${f.status === 'MISMATCH' ? '#f87171' : 'var(--text-secondary)'}; font-weight: 600;">${f.hospitalValue}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">EHR Master</div>
                </div>
                <div style="text-align: right;">
                  ${renderFieldStatusBadge(f.status)}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Smart Warning Box if Mismatch -->
          ${currentSample.fields.some(f => f.status === 'MISMATCH') ? `
            <div style="margin-top: 1.5rem; padding: 1.15rem; border-radius: var(--radius-md); background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.35); display: flex; gap: 0.85rem; align-items: flex-start;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                <div style="font-weight: 800; font-size: 0.9rem; color: #f87171;">Discrepancy Detected: EDI 837 Rejection Hazard</div>
                <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 3px; line-height: 1.5;">
                  The physical card contains person-code suffix '-01' while the hospital index contains the un-suffixed base ID. Claims submitted under the un-suffixed ID will fail automated payer 837 EDI processing. Click '1-Click Sync Mismatches' to update the master record.
                </div>
              </div>
            </div>
          ` : `
            <div style="margin-top: 1.5rem; padding: 1.15rem; border-radius: var(--radius-md); background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.35); display: flex; gap: 0.85rem; align-items: center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <div>
                <div style="font-size: 0.88rem; color: #4ade80; font-weight: 800;">
                  All Optical Card Fields 100% Verified
                </div>
                <div style="font-size: 0.75rem; color: #86efac; margin-top: 2px;">
                  Card identity matches hospital master index. No EDI discrepancy risks identified.
                </div>
              </div>
            </div>
          `}
        </div>
      </div>
    `;

    // Event listeners
    const presetSelect = container.querySelector('#ocr-preset-select') as HTMLSelectElement;
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        activeSampleId = (e.target as HTMLSelectElement).value;
        render();
      });
    }

    const syncBtn = container.querySelector('#btn-sync-all-fields');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => {
        clearanceStore.syncCardOcr(activeSampleId);
        showToast('Extracted OCR card fields synchronized into hospital EHR master record!', 'success');
        render();
      });
    }

    const dropzone = container.querySelector('#dropzone-upload');
    if (dropzone) {
      dropzone.addEventListener('click', () => {
        showToast('Simulating optical card scan: Processing Tesseract OCR mesh...', 'info');
        setTimeout(() => {
          showToast('OCR scan completed with 98.4% optical confidence rating!', 'success');
        }, 800);
      });
    }

    // Hover interactive highlights
    container.querySelectorAll('.field-row').forEach(row => {
      row.addEventListener('mouseenter', (e) => {
        activeHoverField = (e.currentTarget as HTMLElement).dataset.field || null;
        updateBoundingBoxHighlights();
      });
      row.addEventListener('mouseleave', () => {
        activeHoverField = null;
        updateBoundingBoxHighlights();
      });
    });

    container.querySelectorAll('.ocr-bounding-box').forEach(box => {
      box.addEventListener('mouseenter', (e) => {
        activeHoverField = (e.currentTarget as HTMLElement).dataset.field || null;
        updateBoundingBoxHighlights();
      });
      box.addEventListener('mouseleave', () => {
        activeHoverField = null;
        updateBoundingBoxHighlights();
      });
    });
  }

  function updateBoundingBoxHighlights(): void {
    container.querySelectorAll('.ocr-bounding-box').forEach(box => {
      const field = (box as HTMLElement).dataset.field;
      if (field === activeHoverField) {
        box.classList.add('active');
      } else {
        box.classList.remove('active');
      }
    });
  }

  function renderFieldStatusBadge(status: string): string {
    switch (status) {
      case 'MATCH':
        return `<span class="glass-badge badge-match">MATCH</span>`;
      case 'PARTIAL_MATCH':
        return `<span class="glass-badge badge-partial">PARTIAL</span>`;
      case 'MISMATCH':
        return `<span class="glass-badge badge-mismatch">MISMATCH</span>`;
      default:
        return `<span class="glass-badge badge-neutral">${status}</span>`;
    }
  }

  render();
  return container;
}
