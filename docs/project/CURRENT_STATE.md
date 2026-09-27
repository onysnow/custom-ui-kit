# Current State

Last updated: 2026-09-26 (EXP-001 migration cleanup retry)

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

## Verification state
EXP-001 is BLOCKED / NOT VERIFIED. A fresh executable checkout was retried on 2026-09-26 and failed before dependency installation because the execution environment could not resolve github.com. Typecheck, tests, library build, and Storybook build therefore did not execute.

## Known repository issues
- Neither pnpm-lock.yaml nor package-lock.json exists on dev. Generate and commit the pnpm lockfile from the first successful canonical install.
- Migration residue was re-inspected directly on dev and confirmed obsolete: bun.lock contains the superseded tanstack_start_ts dependency graph; bunfig.toml configures Bun/Lovable packages; eslint.config.js contains TanStack-specific rules; components.json points at superseded root src aliases; .prettierrc and .prettierignore duplicate the Biome formatting baseline.
- Deletion of the confirmed residue was attempted on 2026-09-26 but repository mutation safety rejected delete_file, so the files remain present.
- README.md and AGENTS.md have been superseded with the canonical pnpm/dev workflow and Gate-0 engineering guidance.
- apps/playground is not currently established on dev; it is not required for EXP-001.
- Canonical ARCHITECTURE and DECISIONS documents remain subordinate to EXP-001.

## Current blocker
External DNS/network access in the executable environment prevents cloning/installing dev. GitHub repository reads and ordinary writes are available, but deletion of verified migration residue is currently rejected by repository mutation safety.

## Next highest-value action
Retry executable checkout/install first. When networking is available, remove the verified migration residue in the executable checkout, install with pnpm, commit the canonical lockfile, then run typecheck, tests, library build, and Storybook build. Fix every failure and rerun the complete gate before EXP-006.
