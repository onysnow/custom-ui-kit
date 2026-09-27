# Current State

Last updated: 2026-09-27 (EXP-001 executable retry)

## Canonical branch
Development occurs on dev. The repository and canonical documents on that branch are the source of truth.

## What exists
- pnpm workspace root using Node >=22 and pnpm 10.17.1.
- @library/ui Vite library package with React 19 peer dependencies, Vitest/RTL setup, Button and IconButton implementations/tests, shared styles and tokens.
- @testing-library/user-event is present in the actual dev UI package manifest.
- Storybook workspace is @library/storybook under apps/storybook and depends on @library/ui.
- Button and IconButton have Storybook stories.
- @library/ui excludes colocated Storybook stories from its TypeScript project; @library/storybook owns story typechecking.
- Biome, pnpm workspace configuration, and Changesets configuration exist.
- README.md and AGENTS.md have been superseded with canonical pnpm/dev workflow and Gate-0 engineering guidance.
- The previously verified Bun/Prettier/ESLint/root-app migration residue is no longer present on dev: bun.lock, bunfig.toml, eslint.config.js, components.json, .prettierrc, and .prettierignore each return 404 when fetched from dev.

## Verification state
EXP-001 is BLOCKED / NOT VERIFIED. A fresh executable checkout was retried on 2026-09-27 and failed before dependency installation because the execution environment could not resolve github.com. Typecheck, tests, library build, and Storybook build therefore did not execute.

## Known repository issues
- Neither pnpm-lock.yaml nor package-lock.json has been established as the canonical install lockfile in the verified state. Generate and commit pnpm-lock.yaml from the first successful canonical install.
- apps/playground is not currently established on dev; it is not required for EXP-001.
- Canonical ARCHITECTURE and DECISIONS documents remain subordinate to EXP-001.

## Current blocker
External DNS/network access in the executable environment prevents cloning/installing dev. GitHub repository reads and ordinary writes are available. The prior migration-residue deletion blocker is resolved.

## Next highest-value action
Retry executable checkout/install first. When networking is available, install with pnpm, commit the canonical pnpm-lock.yaml, then run typecheck, tests, library build, and Storybook build. Fix every failure and rerun the complete gate before EXP-006.
