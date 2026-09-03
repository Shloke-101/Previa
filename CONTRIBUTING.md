# Previa (PVFC) - Development & Contribution Guidelines

Welcome to the **Pre-Visit Financial Clearance (PVFC)** monorepo. This project is developed collaboratively across three distinct domain teams and three AI coding agents. Adherence to these contribution rules is mandatory to prevent architectural divergence.

---

## 1. Golden Rules of Development

1. **Contracts First**: Never write client or server code for a new endpoint or payload without first updating and validating `contracts/*.schema.json`.
2. **Never Commit Directly to `main`**: All code must enter `main` via feature branches and pull requests.
3. **Keep `main` Green and Runnable**: Broken code or failing contract tests must never be merged.
4. **Strict Monorepo Boundaries**: Respect domain folder ownership (`frontend/`, `backend/`, `ai/`, `data/`).
5. **No Real Patient Data**: Use only synthetic test datasets.

---

## 2. Git & Branching Workflow

### 2.1 Branch Naming Convention
Branches must start with a recognized category and clearly indicate the feature and domain:

| Prefix | Usage | Example |
| :--- | :--- | :--- |
| `feature/` | New functionality or API endpoint | `feature/backend-eligibility-verification` |
| `fix/` | Bug fixes or contract corrections | `fix/clearance-auth-check` |
| `chore/` | Tooling, dependencies, or configuration | `chore/docker-compose-postgres-init` |
| `docs/` | Documentation and architecture updates | `docs/update-risk-engine-weights` |

### 2.2 Standard Workflow
```bash
# 1. Synchronize main branch
git checkout main
git pull origin main

# 2. Create your feature branch
git checkout -b feature/<team>-<feature-name>

# 3. Perform contract updates first (if modifying API surface)
# 4. Implement code within your owned directory
# 5. Run local validation tests
python scripts/validate_contracts.py
pytest tests/

# 6. Commit using Conventional Commits format
git add <files>
git commit -m "feat(domain): descriptive commit message"

# 7. Push branch and open Pull Request
git push origin feature/<team>-<feature-name>
```

---

## 3. Commit Message Standards

Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>(<scope>): <short summary in imperative mood>

[optional body explaining context and affected contracts]
```

### Approved Types
- `feat`: A new feature or endpoint.
- `fix`: A bug fix.
- `docs`: Documentation updates.
- `style`: Formatting or whitespace changes.
- `refactor`: Code refactoring without behavioral change.
- `test`: Adding or modifying tests.
- `chore`: Build scripts, dependencies, CI configuration.

### Approved Scopes
- `contracts`, `backend`, `frontend`, `ai`, `data`, `ocr`, `risk`, `clearance`, `rca`, `workflow`, `docker`

### Examples
- ✅ `feat(contracts): add financial estimate request schema`
- ✅ `feat(backend): implement /api/coverage/check endpoint`
- ✅ `feat(frontend): add patient clearance status badge component`
- ✅ `feat(ai): integrate OpenCV card pre-processing pipeline`
- ✅ `fix(clearance): prevent CLEARED status when prior auth is missing`
- ❌ `update stuff`
- ❌ `final fix`
- ❌ `wip`

---

## 4. Database Migration Policy

1. **PostgreSQL + Alembic**: PostgreSQL is the single source of truth for persistent data.
2. **Never alter schema manually**: All table modifications, column additions, or index changes must have an Alembic migration script in `backend/alembic/versions/`.
3. **Migration Command**:
   ```bash
   cd backend
   alembic revision --autogenerate -m "add_clearance_record_table"
   alembic upgrade head
   ```
4. **Synthetic Seed Data**: Seed scripts in `scripts/seed_database.py` should be updated whenever new required columns are introduced.

---

## 5. Pull Request Standards

Every Pull Request must fill out the repository PR template (`.github/pull_request_template.md`), detailing:
- Summary of changes
- Owning team and affected directories
- Affected contracts (`contracts/*.schema.json`)
- Verification steps and automated test results
- Confirmation that no real PHI is included.
