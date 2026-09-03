# Contracts & Shared JSON Schemas

This directory is the **single shared source of truth** for all data structures and API request/response payloads across the Previa (PVFC) monorepo.

---

## 📋 Catalog of Shared Schemas

| Schema File | Domain | Primary Consumer | Description |
| :--- | :--- | :--- | :--- |
| [`patient.schema.json`](patient.schema.json) | Patient Demographics | Backend / Frontend | Patient demographics, contact, address, and MRN identifiers. |
| [`insurance.schema.json`](insurance.schema.json) | Policy & OCR Card | Backend / AI / Frontend | Policy parameters, OCR extraction outputs, and field-level validation results. |
| [`appointment.schema.json`](appointment.schema.json) | Encounters | Backend / Frontend | Scheduled encounters, procedure codes (CPT), provider, and facility. |
| [`eligibility.schema.json`](eligibility.schema.json) | Eligibility Verification | Backend / Frontend | Real-time payer eligibility response, effective dates, subscriber status (F01). |
| [`coverage.schema.json`](coverage.schema.json) | Procedure Coverage | Backend / Frontend | Procedure CPT coverage, percentage, network status, limitations (F04, F06). |
| [`authorization.schema.json`](authorization.schema.json) | Prior Authorization | Backend / AI / Frontend | Prior auth requirement detection, status, and auth numbers (F05). |
| [`financial.schema.json`](financial.schema.json) | Financial Estimator | Backend / Frontend | Estimated out-of-pocket, copay, deductible remaining, coinsurance (F07). |
| [`risk.schema.json`](risk.schema.json) | Risk Assessment | AI / Backend / Frontend | Deterministic 0–100 risk score, risk level, explainable factors (F08, F09). |
| [`clearance.schema.json`](clearance.schema.json) | Clearance Evaluation | Backend / Frontend | Operational clearance determination (`CLEARED`, `NEEDS_ACTION`, `HIGH_RISK`) (F10, F12). |
| [`recommendation.schema.json`](recommendation.schema.json) | Action Engine | AI / Frontend | Prescriptive corrective guidance for staff remediation (F11). |
| [`denial.schema.json`](denial.schema.json) | Denial RCA | AI / Backend / Frontend | Historical denial records, clustering, CARC/RARC codes, root causes (F13, F15). |
| [`workflow.schema.json`](workflow.schema.json) | Workflow Automation | AI / Backend / Frontend | Preventive workflow automation rules and background task queues (F14). |
| [`api_spec.json`](api_spec.json) | OpenAPI Contract | All Agents | Canonical OpenAPI 3.0 specification covering all REST endpoints. |

---

## 🔍 Validation Script

To validate all JSON schemas and cross-references:
```bash
python scripts/validate_contracts.py
```
