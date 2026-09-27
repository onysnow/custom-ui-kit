# EXP-001 dead-root cleanup — 2026-09-27 06:43 EDT

## Mode
REFACTOR

## Repository state inspected
Read CURRENT_STATE.md, ROADMAP.md, OPEN_QUESTIONS.md, EXPERIMENTS.md, TECHNOLOGY_LEDGER.md, the current dev tree, and the root/UI/Storybook manifests before modification.

## Finding
The current dev tree still contained a superseded TanStack/Lovable application under root src/, public/, .lovable/, root vite.config.ts, and root tsconfig.json. The canonical root package.json no longer declares that application's dependencies or scripts, while pnpm-workspace.yaml defines apps/* and packages/* as the executable workspaces. This made the old root application dead migration residue rather than part of the executable Component Library baseline.

## Change
Removed the superseded root application source/configuration while preserving the canonical pnpm workspace, packages/ui, apps/storybook, tsconfig.base.json, project docs, and research records.

## Execution
A fresh dev clone was attempted before modification and failed with `Could not resolve host: github.com`. Therefore dependency installation and Gate-0 validation still could not execute.

## Result
Repository structure is cleaner and now matches the declared workspace architecture, but EXP-001 remains BLOCKED / NOT VERIFIED.

## Next action
Retry executable checkout, run pnpm install, establish pnpm-lock.yaml, then execute typecheck, tests, library build, and Storybook build. Repair failures and rerun the complete gate before promoting EXP-001.
