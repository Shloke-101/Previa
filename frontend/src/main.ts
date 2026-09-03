import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/views.css';

import { renderSidebar } from './components/sidebar';
import { renderTopbar } from './components/topbar';
import { renderDashboardView } from './components/dashboardView';
import { renderQueueView } from './components/queueView';
import { renderRootCauseView } from './components/rootCauseView';
import { renderWorkflowView } from './components/workflowView';
import { renderOcrView } from './components/ocrView';
import { renderDossierView } from './components/dossierView';
import { renderAnalyticsView } from './components/analyticsView';
import { renderRulesView } from './components/rulesView';
import { clearanceStore } from './services/clearanceEngine';

class App {
  private root: HTMLElement;
  private currentTab: string = 'dashboard';

  constructor() {
    const appElement = document.getElementById('app');
    if (!appElement) throw new Error('#app container not found');
    this.root = appElement;
    this.init();
  }

  private init(): void {
    this.render();
  }

  public setTab(tab: string): void {
    this.currentTab = tab;
    this.render();
    const stage = document.querySelector('.main-stage');
    if (stage) {
      stage.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  public selectPatient(patientId: string): void {
    clearanceStore.setActivePatientId(patientId);
    this.setTab('dossier');
  }

  public openOcrIntake(_patientId: string): void {
    this.setTab('ocr');
  }

  private render(): void {
    this.root.innerHTML = '';

    const queue = clearanceStore.getQueue();
    const highRisk = queue.filter(q => q.clearance_status === 'HIGH_RISK').length;
    const needsAction = queue.filter(q => q.clearance_status === 'NEEDS_ACTION').length;

    const shell = document.createElement('div');
    shell.className = 'app-shell';

    // 1. Sidebar
    const sidebar = renderSidebar(
      this.currentTab,
      (tab) => this.setTab(tab),
      { highRisk, needsAction, total: queue.length }
    );
    shell.appendChild(sidebar);

    // 2. Main Stage (TopBar + Content View)
    const stage = document.createElement('div');
    stage.className = 'main-stage';

    const topbar = renderTopbar(this.currentTab, (action) => {
      if (action === 'reverify') {
        this.render();
      }
    });
    stage.appendChild(topbar);

    const main = document.createElement('main');
    main.className = 'main-content';

    switch (this.currentTab) {
      case 'dashboard':
        main.appendChild(
          renderDashboardView(
            (tab) => this.setTab(tab),
            (patientId) => this.selectPatient(patientId)
          )
        );
        break;

      case 'queue':
        main.appendChild(
          renderQueueView(
            (patientId) => this.selectPatient(patientId),
            (patientId) => this.openOcrIntake(patientId)
          )
        );
        break;

      case 'root-cause':
        main.appendChild(renderRootCauseView((tab) => this.setTab(tab)));
        break;

      case 'workflow':
        main.appendChild(renderWorkflowView((tab) => this.setTab(tab)));
        break;

      case 'ocr':
        main.appendChild(renderOcrView());
        break;

      case 'dossier': {
        const activePatientId = clearanceStore.getActivePatientId();
        main.appendChild(
          renderDossierView(activePatientId, (id) => {
            clearanceStore.setActivePatientId(id);
            this.render();
          })
        );
        break;
      }

      case 'analytics':
        main.appendChild(renderAnalyticsView());
        break;

      case 'rules':
        main.appendChild(renderRulesView());
        break;

      default:
        main.appendChild(
          renderDashboardView(
            (tab) => this.setTab(tab),
            (patientId) => this.selectPatient(patientId)
          )
        );
    }

    stage.appendChild(main);
    shell.appendChild(stage);
    this.root.appendChild(shell);

    // Ensure Toast Container exists
    if (!document.getElementById('toast-container')) {
      const toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      document.body.appendChild(toastContainer);
    }
  }
}

// Instantiate application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
