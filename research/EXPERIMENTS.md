# Experiments

## EXP-001 — Executable baseline verification
**Status:** BLOCKED / NOT VERIFIED.

The workspace import is established on `dev`, but the executable gate has not completed because the available execution environment cannot currently resolve `github.com` for a fresh checkout/install.

**Pass criteria:** dependency installation, typecheck, tests, library build, and Storybook build all execute successfully against the canonical `dev` branch.

**Fail criteria:** any gate command executes against canonical `dev` and returns a repository/code/configuration failure. Repair the failure and rerun the complete gate.

**Blocked criteria:** an external execution prerequisite prevents a gate command from running. A blocked run is neither PASS nor FAIL and must not promote EXP-001.

## EXP-005 — Backdrop ownership / DOM-GPU alignment
**Status:** DESIGNED.

## EXP-006 — Minimal Material IR + Lowering Context
**Status:** DESIGNED.
