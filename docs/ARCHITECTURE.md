# Architecture

This repository is a monorepo of versioned packages plus a gallery app. The structure follows MUI's layering
(`system` / `material` / `utils`) with Radix and Base UI's separation of behaviour from styling.

```
packages/
  tokens/   themes, semantic mapping, motion tokens, contrast checker, theme runtime   (@onysnow/tokens)
  utils/    cn, hooks and other framework-free helpers                                  (@onysnow/utils)
  ui/       accessible components: Radix + Tailwind v4, themed by tokens               (@onysnow/ui)
src/        the gallery/demo app (TanStack Start). Lovable-connected; it consumes the packages from source.
tooling/    shared build and test configuration for every package
```

Planned packages (see the extraction plan in the pull request): `shell`, `dataviz`, `fx-core`, `fx-optics`,
`fx-light`, `fx-water`, `fx-react`.

## Conventions

- **One folder per component**: `packages/ui/src/<name>/{<name>.tsx, index.ts, <name>.test.tsx}`. A package's public
  surface is `src/index.ts`; each folder is also a subpath entry (`@onysnow/ui/button`).
- **Extension points**: compound parts, `className`, and `asChild` (Radix `Slot`), as in Radix/shadcn.
- **Dependencies**: a package lists what it uses in `dependencies`; what the consumer must provide once (React,
  Tailwind, react-hook-form) goes in `peerDependencies`. Packages never bundle each other or their dependencies.
- **Theming**: components use semantic Tailwind utilities (`bg-primary`, `text-muted-foreground`). The active theme
  is `data-theme` on `<html>`; role tokens (`--ground`, `--surface-1`, `--accent-1`, ...) are aliased onto the
  semantic variables in `base.css`, so one palette drives everything. Every built-in theme passes WCAG contrast
  (`checkPalette`), and user-made themes are refused if they do not.
- **Tests live beside the code** and run against source, with no build step (`bun run test`).

## Consuming

Packages are published to GitHub Packages under the `@onysnow` scope, versioned with Changesets (semver).
Consumers pin a range and a lockfile; there are no git dependencies and no vendored copies.

`.npmrc` in the consumer:

```
@onysnow:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

CSS (Tailwind v4):

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@onysnow/tokens/index.css";
@import "@onysnow/tokens/tailwind.css";
@source "../node_modules/@onysnow/ui/dist";
```

Set `<html data-theme="rain-noir">` (or use `themeStore` from `@onysnow/tokens`, whose `bootScript` goes inline in
`<head>` so a saved theme never flashes the default).

## Releasing

`bun run changeset` for every user-facing change. Merging to `main` opens a "Version Packages" PR; merging that
publishes. Do not rewrite pushed history: the repository is connected to Lovable.
