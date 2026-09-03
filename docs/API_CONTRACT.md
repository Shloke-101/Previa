# Previa (PVFC) — REST API Contract & Specification

## Base URL
- **Development**: `http://localhost:8001/api/v1`
- **Interactive Documentation**: `http://localhost:8001/api/v1/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8001/api/v1/redoc` (ReDoc)
- **OpenAPI JSON**: `http://localhost:8001/api/v1/openapi.json`

---

## 1. System Health & Gateway
| Method | Endpoint | Description | Response Model |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Live backend health & EDI 270/271 gateway connectivity | `{"status": "healthy", "service": "previa-backend"}` |
| `GET` | `/` | API version & metadata | `{"status": "online", "version": "1.0.0"}` |

---

## 2. Executive Dashboard & Worklists
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/stats` | High-level metrics: total claims, approval rate, denied count, protected revenue. |
| `GET` | `/api/v1/dashboard/priority` | Pre-service encounters prioritized by risk score. |

---

## 3. RCM Self-Healing Engine (`/api/v1/self-heal`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/self-heal/overview` | High-level metrics: problems detected, auto-resolved, awaiting review, revenue protected, recurrence reduction rate. |
| `GET` | `/api/v1/self-heal/problems` | Clustered systemic error patterns sorted by Priority Score (`frequency * financial_impact * recurrence * preventability`). |
| `GET` | `/api/v1/self-heal/events` | Live activity event stream (`AUTO-RESOLVED`, `PREVENTED`, `REQUIRES REVIEW`, `BLOCKED`). |
| `GET` | `/api/v1/self-heal/audit` | Immutable audit trail with original vs corrected values, rule IDs, and rollback availability. |
| `GET` | `/api/v1/self-heal/hotspots` | Stage-by-stage RCM failure heatmap across Registration, Eligibility, Authorization, Coding, Submission. |
| `GET` | `/api/v1/self-heal/dependency-graph` | Full RCM workflow dependency graph with error counts and systemic bottleneck identification. |
| `GET` | `/api/v1/self-heal/rule-drift` | Detected payer adjudication policy shifts and auto-update recommendations. |
| `POST` | `/api/v1/self-heal/identity/resolve` | Multi-factor patient identity resolution & safe claim representation generation. |
| `POST` | `/api/v1/self-heal/guard/validate-claim` | Pre-submission 6-gate claim validation and auto-fix execution. |
| `POST` | `/api/v1/self-heal/simulate-batch` | Demonstration mode: Simulates 1,000 claim errors, grouping, high-confidence auto-healing, and operator review. |
| `POST` | `/api/v1/self-heal/review/{id}` | Submit human operator review decision (`APPROVE`, `REJECT`, `MODIFY`, `DISMISS`). |
| `POST` | `/api/v1/self-heal/approve/{id}` | Operator 1-click approve recommended self-heal transformation. |
| `POST` | `/api/v1/self-heal/reject/{id}` | Operator reject self-heal transformation. |
| `POST` | `/api/v1/self-heal/rollback/{id}` | Transactional rollback of an automated transformation. |

---

## 4. Claims Intelligence & ML Inference
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/claims` | List claims with optional `?query=` search filter. |
| `GET` | `/api/v1/claims/{id}` | Get single claim by ID. |
| `POST` | `/api/v1/claims` | Ingest new claim and trigger ML assessment. |
| `POST` | `/api/v1/claims/predict` | Run AI ML model assessment returning risk score, confidence %, feature importance, and explainable recommendation. |

---

## 5. Patient Master Index & Clearance Dossier
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/patients` | List all registered patients. |
| `GET` | `/api/v1/patients/{id}` | Get single patient demographic record. |
| `GET` | `/api/v1/patients/{id}/dossier` | Complete pre-service financial clearance dossier (Demographics, Insurance, Appointment, Financials, Prior Auth, Clearance Status). |
| `POST` | `/api/v1/patients` | Register new synthetic patient. |

---

## 6. Pre-Service Verification Engines
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/eligibility/verify` | Real-time electronic EDI 270/271 eligibility inquiry. |
| `POST` | `/api/v1/coverage/check` | Procedure (CPT) coverage, benefit tier, and prior auth mandate check. |
| `POST` | `/api/v1/workflows/authorization` | Query prior authorization determination status. |
| `POST` | `/api/v1/workflows/authorization/{patient_id}/approve` | Approve prior authorization determination number, marking encounter `CLEARED`. |
| `POST` | `/api/v1/clearance/evaluate` | Deterministic Pre-Visit Financial Clearance calculation. |
| `GET` | `/api/v1/clearance/priority-queue` | Full clearance worklist summary with at-risk revenue calculus. |
| `POST` | `/api/v1/clearance/resolve/{patient_id}` | 1-Click resolve blockers & assign `CLEARED` status. |
| `POST` | `/api/v1/financial/estimate` | Deterministic out-of-pocket patient responsibility calculation. |

---

## 7. Denial Analytics, RCA & Model Insights
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/analytics` | Denial CARC distribution, time trends, and payer vulnerability matrix. |
| `GET` | `/api/v1/analytics/rca-report` | Export CARC root cause analysis report in CSV format. |
| `GET` | `/api/v1/model/metrics` | Model performance statistics: Accuracy, Precision, Recall, F1, ROC-AUC, confusion matrix. |

---

## 8. Preventive Rules Engine & Insurance Card OCR
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/rules` | List configurable deterministic clearance rules. |
| `POST` | `/api/v1/rules/{id}/toggle` | Toggle autonomous guard rule enabled state. |
| `POST` | `/api/v1/rules` | Create new preventive guard rule. |
| `GET` | `/api/v1/ocr/extract` | Optical field extraction with bounding boxes and confidence levels. |
| `POST` | `/api/v1/ocr/validate` | Field-level validation matrix (MATCH, PARTIAL_MATCH, MISMATCH) against EHR. |
| `POST` | `/api/v1/ocr/sync` | 1-Click sync physical card OCR fields into hospital master index. |
