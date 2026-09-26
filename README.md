# Component Library

A pnpm workspace for the Component Library engineering program.

## Canonical development branch

Development occurs on `dev`. Do not use `main` as the active engineering branch.

## Requirements

- Node.js 22 or newer
- pnpm 10.17.1

## Workspace

- `packages/ui` — semantic, accessible React production UI library
- `apps/storybook` — Storybook development and validation workspace
- `docs/project` — canonical project state, roadmap, and open questions
- `research` — experiments, technology ledger, and run records

Experimental rendering is optional. Production UI must function without GPU rendering.

## Development

```sh
git clone --branch dev --single-branch https://github.com/onysnow/custom-ui-kit.git
cd custom-ui-kit
corepack enable
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
```

EXP-001 is not verified until the complete gate executes successfully against `dev`. See `docs/project/CURRENT_STATE.md` for current verified state.
