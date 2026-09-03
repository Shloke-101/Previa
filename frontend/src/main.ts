import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/views.css';

import { renderNavbar } from './components/navbar';
import { renderQueueView } from './components/queueView';
import { renderOcrView } from './components/ocrView';
import { renderDossierView } from './components/dossierView';
import { renderAnalyticsView } from './components/analyticsView';
import { clearanceStore } from './services/clearanceEngine';

class App {
  private root: HTMLElement;
  private currentTab: string = 'queue';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Render Global Navbar
    const navbar = renderNavbar(this.currentTab, (tab) => this.setTab(tab));
    this.root.appendChild(navbar);

    // Main Content View Container
    const main = document.createElement('main');
    main.className = 'main-content';

    switch (this.currentTab) {
      case 'queue':
        main.appendChild(
          renderQueueView(
            (patientId) => this.selectPatient(patientId),
            (patientId) => this.openOcrIntake(patientId)
          )
        );
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

      default:
        main.appendChild(
          renderQueueView(
            (patientId) => this.selectPatient(patientId),
            (patientId) => this.openOcrIntake(patientId)
          )
        );
    }

    this.root.appendChild(main);

    // Ensure Toast Container exists
    if (!document.getElementById('toast-container')) {
      const toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      this.root.appendChild(toastContainer);
    }
  }
}

// Instantiate application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
