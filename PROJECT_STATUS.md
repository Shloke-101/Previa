# Previa (PVFC) - Project Status & Roadmap

## Current Status: Phase 0 (Shared Foundation & Architecture) 🚀

---

## 1. Project Phase Roadmap

| Phase | Description | Status | Target Deliverables |
| :--- | :--- | :---: | :--- |
| **Phase 0** | **Shared Foundation & Contracts** | 🟢 **In Progress** | Single monorepo layout, 12 JSON schemas in `contracts/`, `AGENTS.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `docker-compose.yml`, contract test runner. |
| **Phase 1** | **Core Backend & Data Layer** | ⚪ Queued | FastAPI application skeleton, PostgreSQL models, Alembic migrations, synthetic healthcare data generators (patients, encounters, policies). |
| **Phase 2** | **AI Engines & Verification Services** | ⚪ Queued | OCR extraction pipeline, field-level validation, deterministic risk engine with explainability, clearance decision engine, financial responsibility estimator. |
| **Phase 3** | **Frontend UI & Priority Workflows** | ⚪ Queued | Next.js App Router, Tailwind clearance dashboard, priority queues, insurance card upload modal, real-time verification breakdown, patient detail dossier. |
| **Phase 4** | **Systemic Prevention & Denial Analytics** | ⚪ Queued | Historical denial clustering (300 denials demo scenario), root cause identification, preventive workflow automation, before/after impact dashboard. |

---

## 2. Feature Matrix & Ownership Tracking

| ID | Feature Name | Priority | Owning Team | Status | Primary Contract |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **F01** | Automated Insurance Eligibility Verification | **MUST_HAVE** | Backend (Agent 1) | ⚪ Planned | `contracts/eligibility.schema.json` |
| **F02** | Insurance Card OCR & Data Extraction | **MUST_HAVE** | AI/Data (Agent 3) | ⚪ Planned | `contracts/insurance.schema.json` |
| **F03** | Intelligent Data Validation | **MUST_HAVE** | AI/Data (Agent 3) | ⚪ Planned | `contracts/insurance.schema.json` |
| **F04** | Real-Time Procedure Coverage Verification | **MUST_HAVE** | Backend (Agent 1) | ⚪ Planned | `contracts/coverage.schema.json` |
| **F05** | Prior Authorization Detection & Status Check | **MUST_HAVE** | Backend (Agent 1) | ⚪ Planned | `contracts/authorization.schema.json` |
| **F06** | Referral & In-Network Verification | **HIGH_VALUE** | Backend (Agent 1) | ⚪ Planned | `contracts/coverage.schema.json` |
| **F07** | Patient Financial Responsibility Estimator | **MUST_HAVE** | Backend (Agent 1) | ⚪ Planned | `contracts/financial.schema.json` |
| **F08** | Eligibility & Claim Risk Score (0-100) | **MUST_HAVE** | AI/Data (Agent 3) | ⚪ Planned | `contracts/risk.schema.json` |
| **F09** | Explainable Risk Factor Breakdown | **MUST_HAVE** | AI/Data (Agent 3) | ⚪ Planned | `contracts/risk.schema.json` |
| **F10** | Automated Clearance Status (`CLEARED`/`NEEDS_ACTION`/`HIGH_RISK`) | **MUST_HAVE** | Backend (Agent 1) | ⚪ Planned | `contracts/clearance.schema.json` |
| **F11** | Recommended Action Engine | **MUST_HAVE** | AI/Data (Agent 3) | ⚪ Planned | `contracts/recommendation.schema.json` |
| **F12** | Pre-Visit Priority Dashboard & Alerts | **MUST_HAVE** | Frontend (Agent 2) | ⚪ Planned | `contracts/clearance.schema.json` |
| **F13** | Root Cause Analysis & Denial Pattern Detection | **HIGH_VALUE** | AI/Data (Agent 3) | ⚪ Planned | `contracts/denial.schema.json` |
| **F14** | Preventive Workflow Automation | **HIGH_VALUE** | AI/Data + Backend | ⚪ Planned | `contracts/workflow.schema.json` |
| **F15** | Continuous Process Improvement Dashboard | **HIGH_VALUE** | Frontend (Agent 2) | ⚪ Planned | `contracts/denial.schema.json` |

---

## 3. Phase 0 Completion Verification Checklist

- [x] Repository structure defined and initialized
- [x] Monorepo guidelines and multi-agent protocol documented in `AGENTS.md`
- [x] System architecture, sequence diagrams, and risk engine specs documented in `ARCHITECTURE.md`
- [x] Development guidelines, Git workflow, commit conventions in `CONTRIBUTING.md`
- [x] Domain entity vocabularies and canonical snake_case identifiers standardized
- [x] Canonical enums (`ClearanceStatus`, `ValidationStatus`, `RiskLevel`, `AuthorizationStatus`) locked
- [x] JSON Schemas for all 12 core domains written in `contracts/*.schema.json`
- [x] OpenAPI / API surface catalog documented
- [x] Team ownership matrix defined across 3 agents
- [x] PostgreSQL migration and synthetic data policies set
- [x] Multi-container `docker-compose.yml` and `.env.example` created
- [x] Contract validation test suite established in `scripts/validate_contracts.py` and `tests/`
- [x] Deterministic AI boundary documented (no LLM override of clearance/risk/financial calculations)
- [x] Feature branch `feature/phase0-shared-architecture-contracts` created and committed
