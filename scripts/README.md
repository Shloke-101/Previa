# Scripts & Shared Automation Utilities

This directory contains shared operational, validation, and maintenance scripts for the Previa PVFC monorepo.

## 🛠 Available Scripts

- **`validate_contracts.py`**:
  Validates that all JSON schemas in `contracts/` conform to valid JSON format and Draft-07 conventions.
  ```bash
  python scripts/validate_contracts.py
  ```
- **`seed_database.py`** *(Phase 1)*:
  Populates PostgreSQL with synthetic patient, policy, appointment, and historical denial records.
