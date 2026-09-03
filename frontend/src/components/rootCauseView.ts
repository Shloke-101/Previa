import { showToast } from './toast';

export function renderRootCauseView(onNavigate?: (tab: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'root-cause-view-container';

  function render(): void {

    container.innerHTML = `
      <!-- Header Area -->
      <div style="margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="glass-badge badge-ai">Core AI Differentiator</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Systemic Root Cause Intelligence</span>
          </div>
          <h2 style="font-size: 1.45rem; font-weight: 800; color: #fff;">
            Root Cause Denial Detection & Upstream Elimination
          </h2>
          <p style="color: var(--text-secondary); font-size: 0.85rem; max-width: 850px; margin-top: 2px;">
            Previa does not merely appeal individual denied claims after the fact. It continuously clusters historical denials, pinpoints systemic upstream process failures, and implements autonomous preventive guard rails.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-rca-recluster" class="glass-btn glass-btn-primary glass-btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Run AI Denial Clustering</span>
          </button>
        </div>
      </div>

      <!-- THE CORE SYSTEMIC FLOW: 300 Denied Claims -> Upstream Prevention -->
      <div class="rca-hero-container">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span class="glass-badge badge-cyan" style="font-size: 0.75rem;">AI Systemic Diagnostic Flow</span>
            <span style="font-size: 0.8rem; color: #cbd5e1; font-weight: 600;">Systemic Bottleneck Remediation Engine</span>
          </div>
          <span class="glass-badge badge-cleared" style="font-size: 0.72rem;">
            ● 94.6% Upstream Preventability Rate
          </span>
        </div>

        <div class="rca-flow-grid">
          <!-- Node 1: Denied Claims Inflow -->
          <div class="rca-node-card" style="border-top: 3px solid #ef4444;">
            <div>
              <div class="rca-node-step" style="color: #f87171;">STEP 01 • INFLOW</div>
              <div class="rca-node-title">300+ Denied Claims</div>
              <div class="rca-node-sub">Historical & live EDI 835 claim denial remits across all specialties</div>
            </div>
            <div class="rca-node-highlight" style="color: #f87171;">$184,200</div>
          </div>

          <!-- Node 2: Denial Pattern Identification -->
          <div class="rca-node-card" style="border-top: 3px solid #f59e0b;">
            <div>
              <div class="rca-node-step" style="color: #fbbf24;">STEP 02 • PATTERN</div>
              <div class="rca-node-title">Same Denial Reason</div>
              <div class="rca-node-sub">CARC CO-197 & CO-16 recurring in 78% of outpatient imaging claims</div>
            </div>
            <div class="rca-node-highlight" style="color: #fbbf24;">CO-197 (PA)</div>
          </div>

          <!-- Node 3: Root Cause Discovery -->
          <div class="rca-node-card" style="border-top: 3px solid #8b5cf6;">
            <div>
              <div class="rca-node-step" style="color: #c084fc;">STEP 03 • ROOT CAUSE</div>
              <div class="rca-node-title">Common Bottleneck</div>
              <div class="rca-node-sub">Physicians order MRI without checking payer pre-authorization mandate</div>
            </div>
            <div class="rca-node-highlight" style="color: #c084fc;">Scheduling Gap</div>
          </div>

          <!-- Node 4: Specific Process Failure -->
          <div class="rca-node-card" style="border-top: 3px solid #6366f1;">
            <div>
              <div class="rca-node-step" style="color: #818cf8;">STEP 04 • WORKFLOW</div>
              <div class="rca-node-title">Auth Protocol Deficit</div>
              <div class="rca-node-sub">No 72h pre-service gateway rule exists in current legacy EHR workflow</div>
            </div>
            <div class="rca-node-highlight" style="color: #818cf8;">34% MRI Loss</div>
          </div>

          <!-- Node 5: Upstream Workflow Shift -->
          <div class="rca-node-card" style="border-top: 3px solid #38bdf8;">
            <div>
              <div class="rca-node-step" style="color: #38bdf8;">STEP 05 • INTERCEPTION</div>
              <div class="rca-node-title">Upstream Guard Rail</div>
              <div class="rca-node-sub">Previa intercepts encounter 72h prior to visit & verifies auth deterministically</div>
            </div>
            <div class="rca-node-highlight" style="color: #38bdf8;">72h Rule Active</div>
          </div>

          <!-- Node 6: Prevented Future Denials -->
          <div class="rca-node-card" style="border-top: 3px solid #22c55e; background: rgba(34, 197, 94, 0.08);">
            <div>
              <div class="rca-node-step" style="color: #4ade80;">STEP 06 • OUTCOME</div>
              <div class="rca-node-title" style="color: #4ade80;">Future Denials Zeroed</div>
              <div class="rca-node-sub">Encounter arrives financially cleared. 0 post-service appeals required</div>
            </div>
            <div class="rca-node-highlight" style="color: #4ade80;">98 Interceptions</div>
          </div>
        </div>
      </div>

      <!-- 2-Column RCA Deep Insights -->
      <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.75rem; margin-bottom: 2rem;">
        
        <!-- Left: AI Root Cause Deep Insight Panel -->
        <div class="ai-insight-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <span class="ai-badge-spark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              AI Root Cause Detected
            </span>
            <div style="display: flex; gap: 0.5rem;">
              <span class="glass-badge badge-ai code-font">Confidence: 94%</span>
              <span class="glass-badge badge-danger code-font">Severity: Critical</span>
            </div>
          </div>

          <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; line-height: 1.35; margin-bottom: 0.6rem;">
            "Authorization workflow is responsible for 34% of MRI-related denials."
          </h3>

          <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 1.25rem;">
            Pattern analysis reveals that 312 historical MRI Lumbar (CPT 72148) and CT Head (CPT 70450) claims were submitted without Prior Authorization determinations because the hospital scheduling department booked appointments without triggering payer authorization workflows.
          </p>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.25rem;">
            <div style="background: rgba(0, 0, 0, 0.35); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Affected Encounters</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: #fff; margin-top: 3px;">312 Claims</div>
              <div style="font-size: 0.7rem; color: #38bdf8; margin-top: 2px;">BCBS & UHC heavy</div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.35); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Avoidable Loss</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: #f87171; margin-top: 3px;">$184,200</div>
              <div style="font-size: 0.7rem; color: #fca5a5; margin-top: 2px;">91% unrecoverable</div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.35); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Staff Hours Saved</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: #4ade80; margin-top: 3px;">420 Hours</div>
              <div style="font-size: 0.7rem; color: #86efac; margin-top: 2px;">No manual appeals</div>
            </div>
          </div>

          <div style="padding: 1rem 1.15rem; background: rgba(56, 189, 248, 0.1); border-radius: var(--radius-md); border: 1px solid rgba(56, 189, 248, 0.3); margin-bottom: 1.25rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Recommended Upstream Operational Shift:</span>
            </div>
            <div style="font-size: 0.85rem; color: #ffffff; margin-top: 4px; line-height: 1.5;">
              "Add mandatory 72-hour Prior Authorization verification trigger before MRI scheduling into the Previa Preventive Rules Engine."
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button id="btn-deploy-rca-solution" class="glass-btn glass-btn-primary" style="flex: 1;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Deploy Preventive Rule to Production</span>
            </button>
            <button id="btn-simulate-workflow" class="glass-btn glass-btn-secondary">
              <span>Simulate Workflow Shift</span>
            </button>
          </div>
        </div>

        <!-- Right: Top 3 Systemic Root Causes Breakdown -->
        <div class="glass-panel" style="padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              Primary Systemic Bottlenecks
            </h3>
            <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              Ranked by total historical dollar impact across hospital enterprise.
            </p>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <!-- Cause 1 -->
              <div style="padding: 1rem; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <span style="font-weight: 700; font-size: 0.85rem; color: #fff;">1. Missing Prior Auth on High-Tech CPTs</span>
                  <span class="glass-badge badge-high-risk" style="font-size: 0.65rem;">$184.2K Impact</span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4;">
                  Root Cause: Schedulers finalize slots < 48h without payer authorization clearance.
                </div>
                <div style="font-size: 0.7rem; color: #38bdf8; margin-top: 4px;">
                  Prevention: 72-Hour Pre-Service Mandatory Guard
                </div>
              </div>

              <!-- Cause 2 -->
              <div style="padding: 1rem; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <span style="font-weight: 700; font-size: 0.85rem; color: #fff;">2. Member ID Suffix Variance</span>
                  <span class="glass-badge badge-needs-action" style="font-size: 0.65rem;">$68.4K Impact</span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4;">
                  Root Cause: EHR card scan fails to capture trailing person code '-01' or '-02'.
                </div>
                <div style="font-size: 0.7rem; color: #38bdf8; margin-top: 4px;">
                  Prevention: Optical Mesh 1-Click Sync
                </div>
              </div>

              <!-- Cause 3 -->
              <div style="padding: 1rem; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <span style="font-weight: 700; font-size: 0.85rem; color: #fff;">3. Month-End Coverage Termination</span>
                  <span class="glass-badge badge-high-risk" style="font-size: 0.65rem;">$52.1K Impact</span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4;">
                  Root Cause: Insurance verified at booking expires before appointment date.
                </div>
                <div style="font-size: 0.7rem; color: #38bdf8; margin-top: 4px;">
                  Prevention: 24h EDI 270 Automated Re-Verification
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.06); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">Autonomous Protection Rate</span>
            <span style="font-size: 0.95rem; font-weight: 800; color: #4ade80;">94.6% Preventable</span>
          </div>
        </div>
      </div>
    `;

    // Listeners
    const reclusterBtn = container.querySelector('#btn-rca-recluster');
    if (reclusterBtn) {
      reclusterBtn.addEventListener('click', () => {
        showToast('Running HDBSCAN denial remit clustering over 1,420 claims... Discovered 3 systemic bottlenecks with 94% confidence.', 'success');
      });
    }

    const deployBtn = container.querySelector('#btn-deploy-rca-solution');
    if (deployBtn) {
      deployBtn.addEventListener('click', () => {
        showToast('Preventive 72h Prior Auth Guard Rule successfully deployed to production!', 'success');
        if (onNavigate) onNavigate('rules');
      });
    }

    const simBtn = container.querySelector('#btn-simulate-workflow');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        if (onNavigate) onNavigate('workflow');
      });
    }
  }

  render();
  return container;
}
