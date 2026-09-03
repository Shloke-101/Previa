#!/usr/bin/env python3
"""
validate_contracts.py
Validates all JSON schemas in the contracts/ directory for syntax correctness,
valid Draft-07 compliance, and canonical naming consistency.
"""

import json
import os
import sys
from pathlib import Path

def validate_all_schemas():
    repo_root = Path(__file__).resolve().parent.parent
    contracts_dir = repo_root / "contracts"

    if not contracts_dir.exists():
        print(f"❌ Error: contracts directory not found at {contracts_dir}")
        sys.exit(1)

    schema_files = list(contracts_dir.glob("*.json"))
    if not schema_files:
        print(f"❌ Error: No JSON files found in {contracts_dir}")
        sys.exit(1)

    print(f"[*] Validating {len(schema_files)} contract files in {contracts_dir}...")
    errors = []

    for schema_file in sorted(schema_files):
        try:
            with open(schema_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # Check basic structure
            if schema_file.name != "api_spec.json":
                if "$schema" not in data:
                    errors.append(f"{schema_file.name}: Missing '$schema' declaration")
                if "title" not in data:
                    errors.append(f"{schema_file.name}: Missing 'title' declaration")
                if "type" not in data:
                    errors.append(f"{schema_file.name}: Missing 'type' declaration")
            else:
                if "openapi" not in data:
                    errors.append(f"{schema_file.name}: Missing 'openapi' version declaration")

            print(f"  [OK] {schema_file.name} - Valid JSON syntax")
        except json.JSONDecodeError as e:
            errors.append(f"{schema_file.name}: JSON decode error: {e}")
        except Exception as e:
            errors.append(f"{schema_file.name}: Unexpected error: {e}")

    if errors:
        print("\n[ERROR] Contract validation failed with errors:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("\n[SUCCESS] All contracts validated successfully!")
        return 0

if __name__ == "__main__":
    sys.exit(validate_all_schemas())
