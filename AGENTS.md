# Component Library Engineering Agent Guide

## Canonical source of truth
- Develop only against the `dev` branch unless explicitly instructed otherwise.
- Treat the latest repository state on `dev` as authoritative over prior chat, archives, generated snapshots, or historical Lovable application state.
- Read `docs/project/CURRENT_STATE.md` before planning work, followed by the roadmap, open questions, experiment ledger, technology ledger, relevant canonical documents, recent run logs, and the source/configuration involved in the task.

## Gate discipline
EXP-001 is the executable baseline gate. Do not mark it verified until all of the following have actually succeeded against canonical `dev`:
1. `pnpm install`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`
5. `pnpm build-storybook`

Fix failures and rerun the complete gate. Do not expand production components or introduce speculative runtime code while Gate 0 is unresolved unless an independently executable research task is clearly higher value because execution is externally blocked.

## Architecture boundaries
- Preserve semantic, accessible React DOM as the production UI foundation.
- Production UI must work without GPU rendering.
- Browser-native CSS/SVG/DOM is preferred when it is sufficient.
- Optional visual rendering, Material IR, GPU rendering, motion/physics, and developer tooling must remain separable from semantic production UI.
- Prefer the cheapest mechanism capable of a subproblem.
- Custom compilers, runtimes, shaders, plugins, profilers, editors, and benchmark systems require evidence of a real gap.

## Maturity and evidence
Use: IDEA → RESEARCHED → PROTOTYPE → VALIDATED → INTEGRATED → STABLE.
Do not promote experimental work directly to production.
Classify consequential research findings as VERIFIED, PROMISING, EXPERIMENTAL, SPECULATIVE, or REJECTED.
When documentation cannot resolve an important question, define the smallest measurable experiment with hypothesis, question, implementation, measurements, pass criteria, fail criteria, and decision unlocked.

## Change discipline
- Check existing ledgers, catalogs, decisions, and docs before adding research, architecture, experiments, or new documentation.
- Keep canonical docs synchronized with verified repository state.
- Record meaningful runs under `research/runs/`.
- Commit coherent completed changes directly to `dev`; never autonomously push development to `main`.
- Never claim a command, build, test, benchmark, write, commit, or push succeeded unless it actually executed successfully.
