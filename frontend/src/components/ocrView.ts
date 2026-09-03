import { clearanceStore } from '../services/clearanceEngine';
import { CardSample, ExtractedField } from '../types/ocr';
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
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 800;">Insurance Card OCR & Intelligent Validation</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Extract card data, detect member ID/spelling discrepancies, and prevent claim denials before check-in.</p>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <span style="font-size: 0.8rem; color: var(--text-muted);">Sample Card Preset:</span>
          <select id="ocr-preset-select" class="glass-input glass-select" style="min-width: 220px;">
            ${samples.map(s => `
              <option value="${s.id}" ${s.id === activeSampleId ? 'selected' : ''}>${s.payerName} (${s.fields.some(f => f.status === 'MISMATCH') ? '⚠️ Mismatch' : '✓ Clean'})</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="ocr-container">
        <!-- Left: Insurance Card Visual Preview with OCR Bounding Boxes -->
        <div class="glass-panel card-preview-wrapper">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.9rem;">Physical Card OCR Scanner Visualizer</span>
            <span class="glass-badge badge-neutral" style="font-size: 0.7rem;">Tesseract + OpenCV Optical Mesh</span>
          </div>

          <div class="insurance-card-mockup" style="background: ${currentSample.cardImageColor};">
            <!-- Simulated Card Header & Chip -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-size: 1.1rem; font-weight: 800; letter-spacing: 0.05em; color: #fff;">${currentSample.payerName}</div>
                <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.7);">${currentSample.planType}</div>
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
                  <span style="position: absolute; top: -18px; left: 0; font-size: 0.65rem; background: rgba(0, 0, 0, 0.85); color: #38bdf8; padding: 1px 4px; border-radius: 3px; font-weight: 600; white-space: nowrap;">
                    ${f.box.label} (${Math.round(f.confidence * 100)}%)
                  </span>
                </div>
              `;
            }).join('')}

            <!-- Card Visual Details -->
            <div style="position: absolute; bottom: 1.5rem; left: 1.5rem; right: 1.5rem; display: flex; justify-content: space-between; font-size: 0.75rem; color: rgba(255, 255, 255, 0.8);">
              <div>
                <div style="font-size: 0.65rem; text-transform: uppercase; color: rgba(255, 255, 255, 0.6);">RxBIN / RxPCN</div>
                <div class="code-font">${currentSample.rxBin} / ${currentSample.rxPcn}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.65rem; text-transform: uppercase; color: rgba(255, 255, 255, 0.6);">DOB</div>
                <div class="code-font">${currentSample.dob}</div>
              </div>
            </div>
          </div>

          <!-- Drag and Drop Simulator -->
          <div style="border: 2px dashed var(--glass-border); border-radius: var(--radius-md); padding: 1.25rem; text-align: center; background: rgba(255, 255, 255, 0.02); cursor: pointer;" id="dropzone-upload">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" stroke-width="2" style="margin-bottom: 0.5rem;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <div style="font-size: 0.85rem; font-weight: 600;">Upload New Insurance Card Image</div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 2px;">Accepts JPG, PNG, DICOM or PDF scans</div>
          </div>
        </div>

        <!-- Right: Field Comparison & Validation Matrix -->
        <div class="glass-panel comparison-table-wrapper">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="font-size: 1.05rem; font-weight: 700;">Field Validation & Reconciliation</h3>
            <button id="btn-sync-all-fields" class="glass-btn glass-btn-primary glass-btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.5 2-19 19"/><path d="M21.5 2H16"/><path d="M21.5 2v5.5"/></svg>
              <span>1-Click Sync All Mismatches</span>
            </button>
          </div>

          <div style="display: flex; flex-direction: column;">
            <div class="comparison-row" style="font-weight: 700; color: var(--text-dim); font-size: 0.7rem; text-transform: uppercase;">
              <div>Field</div>
              <div>OCR Card Extraction</div>
              <div>EHR Hospital Record</div>
              <div style="text-align: right;">Status & Sync</div>
            </div>

            ${currentSample.fields.map(f => `
              <div class="comparison-row field-row" data-field="${f.fieldName}">
                <div class="field-label">${f.label}</div>
                <div>
                  <div class="field-val code-font" style="color: #fff;">${f.ocrValue}</div>
                  <div style="font-size: 0.7rem; color: var(--text-dim);">Conf: ${(f.confidence * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div class="field-val code-font" style="color: ${f.status === 'MISMATCH' ? '#fb7185' : 'var(--text-muted)'};">${f.hospitalValue}</div>
                  <div style="font-size: 0.7rem; color: var(--text-dim);">Master Index</div>
                </div>
                <div style="text-align: right;">
                  ${renderFieldStatusBadge(f.status)}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Smart Warning Box if Mismatch -->
          ${currentSample.fields.some(f => f.status === 'MISMATCH') ? `
            <div style="margin-top: 1.5rem; padding: 1rem; border-radius: var(--radius-md); background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); display: flex; gap: 0.75rem; align-items: flex-start;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                <div style="font-weight: 700; font-size: 0.85rem; color: #fb7185;">Mismatch Detected: Payer Claim Risk</div>
                <div style="font-size: 0.75rem; color: #f1f5f9; margin-top: 2px;">
                  Member ID has suffix variance. Claims submitted without the matching payer card ID will fail electronic 837 EDI claim submission. Click '1-Click Sync All Mismatches' to synchronize.
                </div>
              </div>
            </div>
          ` : `
            <div style="margin-top: 1.5rem; padding: 1rem; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); display: flex; gap: 0.75rem; align-items: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <div style="font-size: 0.85rem; color: #34d399; font-weight: 600;">
                All extracted card fields 100% verified against hospital EHR database.
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
        showToast('Extracted OCR fields synchronized into hospital EHR master record!', 'success');
        render();
      });
    }

    const dropzone = container.querySelector('#dropzone-upload');
    if (dropzone) {
      dropzone.addEventListener('click', () => {
        showToast('Simulating OCR card scan: Processing image via optical pipeline...', 'info');
        setTimeout(() => {
          showToast('OCR scan completed with 98.4% confidence rating!', 'success');
        }, 1000);
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
