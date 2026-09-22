# OnySnowapi Component Library Site

## Goal
Build a friendly, colorful landing + component gallery for the OnySnowapi web component library. The site introduces the library and showcases 12 reusable components with live previews and short usage notes.

## Design
- Friendly & colorful palette (warm cream background, soft orange accents, deep brown text).
- Tokens added to `src/styles.css`; no hardcoded utility colors in components.
- Clean, spacious layout with rounded cards and playful gradients.

## Sections on the home page (`/`, `src/routes/index.tsx`)
1. **Hero** — OnySnowapi name, tagline, primary CTA, soft decorative blobs.
2. **Intro bar** — three value props (open-source, accessible, customizable).
3. **Component gallery** — 12 component cards, each with:
   - Live preview
   - Component name
   - One-line description
   - Usage snippet
4. **Install / get-started** — copyable install command.
5. **Footer** — minimal copyright + links.

## Components to create (12)
1. Button
2. Card
3. Badge
4. Input
5. Alert
6. Avatar
7. Toggle
8. Tooltip
9. Progress
10. Skeleton
11. Tabs
12. Modal

## Files to create / modify
- `src/styles.css` — update semantic tokens to the warm friendly theme.
- `src/routes/index.tsx` — replace placeholder with the full landing/gallery page.
- `src/components/ui/` — add 12 component files.
- `src/routes/__root.tsx` — update default head metadata to OnySnowapi.

## Out of scope
- Backend/auth (component library only needs static marketing + gallery).
- Interactive playground with code editing.
- npm package publishing infrastructure.
