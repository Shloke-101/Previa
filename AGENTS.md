# Multi-Agent Coordination Protocol: Previa (PVFC)

## Overview & Mission

**Previa: Pre-Visit Financial Clearance System (PVFC)** is developed collaboratively by a team of three engineers and three AI coding agents in a single monorepository.

**Core Philosophy**:
> "Do not wait for an eligibility problem to become a claim denial. Detect, resolve, and prevent the problem before the patient visit."

---

## 1. Hierarchy: Source of Truth

When making architectural, technical, or domain decisions, the following precedence order is strictly binding:

1. **Existing project specification** (`pre_visit_financial_clearance_project_context.json`)
2. **Existing repository code**
3. **`contracts/`** (JSON Schemas & OpenAPI definitions)
4. **`ARCHITECTURE.md`**
5. **`AGENTS.md`** (This document)
6. **`PROJECT_STATUS.md`**
7. **Individual agent implementation assumptions**

> [!CAUTION]
> If any conflict is detected between two sources, **STOP** and document the conflict in `PROJECT_STATUS.md` and an Architectural Decision Record (`docs/ADR-*.md`). Never silently overwrite an established project standard.

---

## 2. Team Ownership Matrix

Each agent and developer pair owns a dedicated subsystem. Modifying files outside your primary domain requires explicit coordination and contract updates.

| Agent / Role | Primary Ownership | Core Tech Stack | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **Agent 1**<br>Backend & DB | `backend/` | FastAPI, Python 3.11+, PostgreSQL, SQLAlchemy, Alembic | REST API layer, database models & migrations, eligibility logic, coverage verification, prior authorization engine, clearance engine, financial calculations, dashboard backend APIs. |
| **Agent 2**<br>Frontend | `frontend/` | Next.js 14+ (App Router), React, Tailwind CSS, Recharts, Lucide | Responsive web UI, patient intake/detail views, insurance card upload & OCR preview, verification breakdown, explainable risk visualization, clearance badges, priority queues, denial analytics views. |
| **Agent 3**<br>AI/Data & Automation | `ai/`, `data/` | Python, Tesseract/EasyOCR, OpenCV, Pandas, Scikit-learn, Rule Engine | Synthetic healthcare dataset generation, OCR extraction pipeline, field-level data validation engine, deterministic risk scoring & factor breakdown, root cause analysis (RCA) on denials, preventive workflow automation triggers. |
| **Shared Ownership** | `contracts/`, `tests/`, `docs/`, `scripts/`, `.github/` | JSON Schema, Pytest, Docker Compose | All agents contribute to schemas, contract testing, end-to-end integration tests, and shared operational scripts. |

---

## 3. Directory & File Ownership Boundaries

```
Previa (PVFC)/
├── frontend/             --> Agent 2 (Frontend)
├── backend/              --> Agent 1 (Backend & DB)
├── ai/                   --> Agent 3 (AI/Data & Automation)
├── data/                 --> Agent 3 (AI/Data & Automation)
├── contracts/            --> SHARED (Contract changes require coordination)
├── tests/                --> SHARED (Integration & Contract test suites)
├── scripts/              --> SHARED (Development & build utilities)
├── docs/                 --> SHARED (Architecture Decision Records & specs)
├── .github/              --> SHARED (CI/CD workflows and PR templates)
├── AGENTS.md             --> SHARED
├── ARCHITECTURE.md       --> SHARED
├── CONTRIBUTING.md       --> SHARED
├── PROJECT_STATUS.md     --> SHARED
├── README.md             --> SHARED
├── docker-compose.yml    --> SHARED
└── .env.example          --> SHARED
```

### File Modification Rules
1. **Never edit outside your owned directory** without prior agreement via an approved change to `contracts/`.
2. **If Agent 2 needs a new backend field**: Agent 2 must request a schema update in `contracts/`. Agent 1 updates `contracts/` and implements the backend response. Agent 2 consumes the agreed contract.
3. **If Agent 1 needs AI validation results**: Agent 1 invokes the `ai/` validation interface based on `contracts/validation.schema.json`.

---

## 4. Anti-Drift Policy & Contract-First Rule

Before making any change, every agent must evaluate:
> *"Will this change modify an API, payload, database structure, or enum used by another agent?"*

- **If YES**:
  1. Do **NOT** write code immediately.
  2. Update the corresponding schema in `contracts/*.schema.json`.
  3. Validate schemas using `python scripts/validate_contracts.py`.
  4. Record the update in `PROJECT_STATUS.md`.
  5. Only then implement the changes in your subsystem.

---

## 5. Canonical Domain Identifiers & Enums

### Canonical Identifiers (Snake Case Only)
- `patient_id` (UUID / String)
- `insurance_policy_id` (UUID / String)
- `appointment_id` (UUID / String)
- `claim_id` (UUID / String)
- `denial_id` (UUID / String)
- `workflow_id` (UUID / String)

### Canonical Enums (Strictly Fixed)

#### Clearance Status (`ClearanceStatus`)
- `CLEARED`: All eligibility, coverage, authorization, and validation checks pass with no critical unresolved blockers.
- `NEEDS_ACTION`: Patient is potentially eligible, but resolvable action is required by hospital staff before the visit (e.g. missing prior authorization, minor mismatch).
- `HIGH_RISK`: Critical blocker exists (e.g. inactive policy, expired insurance, critical member ID mismatch, non-covered procedure, severe denial likelihood).

#### Validation Status (`ValidationStatus`)
- `MATCH`: Field in OCR card exactly matches hospital record.
- `PARTIAL_MATCH`: Minor non-critical variance (e.g. "Johnathan Doe" vs "John Doe").
- `MISMATCH`: Field differs significantly or violates critical validation checks.

#### Risk Level (`RiskLevel`)
- `LOW`: Score 0–39
- `MEDIUM`: Score 40–69
- `HIGH`: Score 70–100

#### Prior Authorization Status (`AuthorizationStatus`)
- `NOT_REQUIRED`: Service/procedure does not mandate prior auth for this payer.
- `REQUIRED`: Prior auth is required and pending creation or submission.
- `PENDING`: Prior auth has been submitted to payer and is awaiting determination.
- `APPROVED`: Payer has authorized the service with an active authorization number.
- `DENIED`: Payer has rejected the prior auth request.

---

## 6. AI & LLM Safety Boundary (Deterministic Precedence)

> [!CRITICAL]
> **LLM Usage Policy**:
> 1. LLMs may be utilized for:
>    - Patient-friendly or staff-friendly summaries of complex risk factors.
>    - Natural language queries over historical denial patterns.
>    - OCR text parsing assistance and corrective suggestions.
> 2. LLMs **MUST NEVER** override deterministic calculations:
>    - Eligibility determinations (`ACTIVE` vs `INACTIVE`) are strictly rule-based.
>    - Prior authorization mandates are derived deterministically from payer rule tables.
>    - Financial estimation formulas are mathematical and deterministic.
>    - Clearance status is assigned strictly by the deterministic Clearance Engine.
>    - If deterministic score is `HIGH_RISK`, an LLM **cannot** mark the encounter `CLEARED`.

---

## 7. Data Privacy & Synthetic Data Mandate

- **Strictly Mock Data**: Use only synthetic patient, payer, encounter, and claim records.
- **Zero Real PHI**: Never upload, process, or store real protected health information (PHI).

---

## 8. Git & Branching Workflow

1. Always branch from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/<agent-or-domain>-<short-description>
   ```
2. Commit message format follows Conventional Commits:
   - `feat(contracts): define eligibility and clearance json schemas`
   - `feat(backend): implement eligibility verification endpoint`
   - `feat(frontend): build clearance status priority queue UI`
   - `feat(ai): implement deterministic weighted risk engine`
   - `fix(clearance): prevent clearance if authorization is missing`
3. Never merge directly to `main` without validating contracts and tests:
   ```bash
   python scripts/validate_contracts.py
   pytest tests/
   ```
