# ADR 001: Monorepo Structure and Contract-First Architecture

## Status
Accepted

## Context
Three developers and three AI coding agents are collaborating simultaneously on the Pre-Visit Financial Clearance System (PVFC). Without strict architectural guardrails, independent agents are prone to architectural divergence, incompatible payload formats, duplicate implementations, and breaking API changes.

## Decision
1. **Single Monorepository**: All subsystems (`frontend/`, `backend/`, `ai/`, `data/`) will reside in a single monorepository under `https://github.com/Shloke-101/Previa.git`.
2. **Contract-First Development**: All schemas (`contracts/*.schema.json`) and OpenAPI specs (`contracts/api_spec.json`) serve as the single source of truth. Any schema modification requires prior coordination and automated schema validation.
3. **Deterministic Core Engines**: Risk scoring (0–100), financial estimations, and operational clearance states (`CLEARED`, `NEEDS_ACTION`, `HIGH_RISK`) are computed deterministically. LLMs provide explainability and assistance without overriding deterministic safety rules.

## Consequences
- **Positive**: Seamless integration across frontend, backend, and AI agents.
- **Positive**: Elimination of contract drift and breaking payload assumptions.
- **Requirement**: All agents must run `python scripts/validate_contracts.py` before opening pull requests.
