#  UI Kit

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

## Using the library

`@onysnow/custom-ui-kit` is a React + TypeScript component library (Radix UI, Tailwind CSS v4).

```sh
# from GitHub (until it is published to npm)
npm i github:onysnow/custom-ui-kit#main
# peers
npm i react react-dom tailwindcss tw-animate-css
```

In your global CSS (Tailwind v4):

```css
@import "tailwindcss";
@import "@onysnow/custom-ui-kit/theme.css";
@source "../node_modules/@onysnow/custom-ui-kit/dist";
```

```tsx
import { Button, Card, CardTitle } from "@onysnow/custom-ui-kit";
```

Add `dark` to `<html>` to switch to the dark theme.

### Building the library

```sh
npm run build:lib   # -> dist/index.js, dist/*.d.ts, dist/theme.css
npm run dev         # demo / gallery app
```

`dist/` is gitignored; installing from GitHub builds it automatically via the `prepare` script.
