# UI Kit

A component library for web

This project was built with [Lovable](https://lovable.dev).

##

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6c509f71-5eae-45e3-89b8-7e6a2714cc4a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Packages

| Package           | What it is                                                                  |
| ----------------- | --------------------------------------------------------------------------- |
| `@onysnow/tokens` | Themes, Tailwind v4 mapping, motion tokens, contrast checker, theme runtime |
| `@onysnow/utils`  | `cn`, `useIsMobile`                                                         |
| `@onysnow/ui`     | 46 accessible components (Radix + Tailwind v4)                              |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for structure, conventions, consuming and releasing.

## Development

```sh
bun install
bun run dev              # gallery app
bun run test             # all packages
bun run build:packages   # dist/ for every package
bun run changeset        # describe a change for release
```
