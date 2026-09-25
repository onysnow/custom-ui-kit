# Current State

Last updated: 2026-09-25 (EXP-001 integration reconciliation)

## Canonical branch
Development occurs on dev. The repository and canonical documents on that branch are the source of truth.

## What exists
- pnpm workspace root using Node >=22 and pnpm 10.17.1.
- @library/ui Vite library package with React 19 peer dependencies, Vitest/RTL setup, Button and IconButton implementations/tests, shared styles and tokens.
- @testing-library/user-event is present in the actual dev UI package manifest.
- Storybook workspace is @library/storybook and depends on @library/ui.
- Button and IconButton have Storybook stories.
- Biome, pnpm workspace configuration, and Changesets configuration exist.

## Verification state
EXP-001 is NOT VERIFIED. A fresh executable checkout was retried on 2026-09-25 and failed before dependency installation because the execution environment could not resolve github.com. Typecheck, tests, library build, and Storybook build therefore did not execute.

## Known repository issues
- Neither pnpm-lock.yaml nor package-lock.json exists on dev. Generate and commit the pnpm lockfile from the first successful canonical install.
- The migration still needs an executable audit for obsolete files after dependencies can be installed.
- apps/playground is not currently established on dev; it is not required for EXP-001.
- Canonical ARCHITECTURE and DECISIONS documents remain subordinate to EXP-001.

## Current blocker
External DNS/network access in the executable environment prevents cloning/installing dev. GitHub connector reads/writes remain available.

## Next highest-value action
Retry executable checkout/install first. When networking is available, run pnpm install, commit the canonical lockfile, then run typecheck, tests, library build, and Storybook build. Fix every failure and rerun the complete gate before EXP-006.
