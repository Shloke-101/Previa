# Previa Backend & Database (Person 1 / Agent 1)

## 📌 Ownership
- **Owner**: Person 1 / Agent 1 (Backend & Database)
- **Tech Stack**: Python 3.11+, FastAPI, PostgreSQL, SQLAlchemy ORM, Alembic, Pydantic v2

## 🎯 Scope & Responsibilities
- REST API layer implementation conforming to `contracts/api_spec.json`.
- Database schema modeling and Alembic migration scripts.
- Core business logic:
  - Real-time Eligibility Verification (`/api/eligibility/verify`)
  - Procedure Coverage & In-Network Engine (`/api/coverage/check`)
  - Prior Authorization Engine (`/api/workflows/authorization`)
  - Deterministic Clearance Engine (`/api/clearance/evaluate`)
  - Financial Responsibility Calculation (`/api/financial/estimate`)
  - Dashboard KPI aggregation APIs (`/api/dashboard/summary`, `/api/dashboard/priority`)

## 🔗 Connected Contracts
- Governed by `contracts/*.schema.json` and OpenAPI spec in `contracts/api_spec.json`.
