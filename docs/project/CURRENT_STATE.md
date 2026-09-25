# Current State

Last updated: 2026-09-25 (EXP-001 static reconciliation)

## Canonical branch
Development occurs on `dev`. The repository and canonical documents on that branch are the source of truth.

## What exists
- pnpm workspace root using Node >=22 and pnpm 10.17.1.
- `@library/ui` Vite library package with React 19 peer dependencies, Vitest/RTL setup, Button and IconButton implementations/tests, shared styles and tokens.
- `@testing-library/user-event` is present in the actual `dev` UI package manifest.
- Storybook workspace is `@library/storybook`, depends on `@library/ui`, and has TypeScript configuration.
- Button and IconButton both have Storybook stories on the actual branch.
- Biome and pnpm workspace configuration exist.

## Verification state
EXP-001 is NOT VERIFIED. A fresh executable checkout was retried on 2026-09-25 and failed before dependency installation because the execution environment could not resolve github.com. Typecheck, tests, library build, and Storybook build therefore did not execute.

## Known repository issues
- `.changeset/config.json` is absent even though Changesets is declared in the root toolchain.
- The migration still needs an executable audit for obsolete files and package-lock consistency.
- `apps/playground` is not currently established on `dev`; it is not required to pass EXP-001.
- Canonical ARCHITECTURE and DECISIONS documents still need to be established from verified conclusions; this is subordinate to EXP-001.

## Current blocker
External DNS/network access in the executable environment prevents cloning/installing the `dev` branch. GitHub connector reads/writes remain available.

## Next highest-value action
Retry executable checkout/install first. If networking is available, run dependency installation, typecheck, tests, library build, and Storybook build; fix every failure and rerun the complete gate. If still blocked, reconcile the missing Changesets configuration and other concrete EXP-001 infrastructure without expanding production/runtime scope.
