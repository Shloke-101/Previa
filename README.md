# Previa: Pre-Visit Financial Clearance System (PVFC)

> **"Do not wait for an eligibility problem to become a claim denial. Detect, resolve, and prevent the problem before the patient visit."**

[![CI Status](https://img.shields.io/badge/Contracts-Validated-brightgreen.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI%20%7C%20PostgreSQL%20%7C%20OpenCV-blue.svg)](#)
[![Phase](https://img.shields.io/badge/Phase-0%3A%20Foundation%20%26%20Contracts-orange.svg)](PROJECT_STATUS.md)

---

## 🌟 What is Previa?

**Previa** is an intelligent healthcare pre-encounter financial clearance platform. Traditional healthcare revenue cycles react to claim denials weeks after services are rendered. Previa moves the prevention upstream into the pre-registration window by:

1. **Automating Real-Time Eligibility**: Verifying insurance active status and benefit coverage before patient arrival.
2. **Insurance Card OCR & Validation**: Extracting patient and policy data from card images and cross-referencing against hospital records.
3. **Prior Authorization Detection**: Identifying procedural auth requirements and creating automated resolution tasks.
4. **Transparent Out-of-Pocket Estimator**: Calculating copay, deductible, and coinsurance responsibilities deterministically.
5. **Explainable 0–100 Risk Engine**: Flagging high-risk encounters with transparent, weighted contributing factors.
6. **Operational Clearance Engine**: Categorizing encounters into actionable states: `CLEARED`, `NEEDS_ACTION`, or `HIGH_RISK`.
7. **Systemic Root Cause Prevention**: Clustering historical denial trends and deploying proactive workflow rules to eliminate repetitive denials at the source.

---

## 📁 Repository Structure

```
Previa (PVFC)/
├── frontend/             # Next.js 14+ (App Router), React, Tailwind CSS, Recharts
├── backend/              # FastAPI, Python 3.11+, SQLAlchemy ORM, Alembic
├── ai/                   # OCR (Tesseract/OpenCV), Validation Engine, Explainable Risk
├── contracts/            # Canonical JSON Schemas & OpenAPI definitions
│   ├── patient.schema.json
│   ├── insurance.schema.json
│   ├── appointment.schema.json
│   ├── eligibility.schema.json
│   ├── coverage.schema.json
│   ├── authorization.schema.json
│   ├── financial.schema.json
│   ├── risk.schema.json
│   ├── clearance.schema.json
│   ├── recommendation.schema.json
│   ├── denial.schema.json
│   └── workflow.schema.json
├── data/                 # Synthetic healthcare datasets & seed generators
├── tests/                # Contract schemas validation & integration tests
├── scripts/              # Validation, linting, and database seeding scripts
├── docs/                 # Architecture Decision Records (ADRs) & specs
├── .github/              # CI workflows and PR templates
├── AGENTS.md             # Multi-Agent Coordination Protocol & Boundaries
├── ARCHITECTURE.md       # Logical Architecture & Deep Technical Specifications
├── CONTRIBUTING.md       # Git rules, commit guidelines, and DB policies
├── PROJECT_STATUS.md     # Feature roadmap & delivery progress
├── docker-compose.yml    # Monorepo containerization orchestration
└── .env.example          # Environment variables template
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Docker** & **Docker Compose**
- **Python 3.11+**
- **Node.js 18+** & **npm**

### 1. Clone & Configure Environment
```bash
git clone https://github.com/Shloke-101/Previa.git
cd Previa
cp .env.example .env
```

### 2. Validate Shared Contracts
All components depend on validated JSON schemas in `contracts/`:
```bash
python scripts/validate_contracts.py
```

### 3. Run with Docker Compose
```bash
docker compose up --build
```
- **Frontend Dashboard**: `http://localhost:3000`
- **FastAPI Backend Swagger**: `http://localhost:8000/docs`
- **PostgreSQL Database**: `localhost:5432`

---

## 👥 Multi-Agent Team Ownership

| Subsystem | Owner | Primary Scope |
| :--- | :--- | :--- |
| **Backend & DB** | Agent 1 | `backend/`, FastAPI, PostgreSQL, SQLAlchemy, Core Verification APIs |
| **Frontend UI** | Agent 2 | `frontend/`, Next.js, Tailwind CSS, Priority Queue, Patient Dossier |
| **AI/Data & Automation** | Agent 3 | `ai/`, `data/`, OCR pipeline, Risk Engine, Root Cause Analytics |
| **Shared Core** | Team Shared | `contracts/`, `tests/`, `docs/`, `scripts/`, `AGENTS.md` |

For full development rules, please read [AGENTS.md](AGENTS.md) and [CONTRIBUTING.md](CONTRIBUTING.md).
