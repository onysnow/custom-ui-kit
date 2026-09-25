# Current State

Last updated: 2026-09-25 (EXP-001 workspace reconciliation)

## Canonical branch
Development occurs on `dev`. The repository and canonical documents on that branch are the source of truth.

## What exists
- pnpm workspace root using Node >=22 and pnpm 10.17.1.
- `@library/ui` Vite library package with React 19 peer dependencies, Vitest/RTL setup, Button and IconButton implementations/tests, shared styles and tokens.
- Storybook workspace configuration; package identity was reconciled to `@library/storybook` and its UI dependency to `@library/ui`.
- Storybook TypeScript project configuration was added.

## Verification state
EXP-001 is NOT VERIFIED. A fresh executable checkout was attempted this run, but the execution environment could not resolve github.com, so dependency installation and the command gate could not run.

## Known repository issues
- The migration from the previous application is not yet fully audited for obsolete files.
- IconButton Storybook coverage still needs to be confirmed in the actual branch.
- Automated CI workflow creation was attempted but repository write policy blocked that specific workflow-file mutation in this run.

## Current blocker
External DNS/network access in the executable environment prevents cloning/installing the dev branch. GitHub connector writes remain available.

## Next highest-value action
On the next run, re-attempt executable checkout/install first. If network is available, run typecheck, tests, library build and Storybook build, fix every failure, and record exact results. If still blocked, continue only concrete EXP-001 repository reconciliation rather than expanding scope.
