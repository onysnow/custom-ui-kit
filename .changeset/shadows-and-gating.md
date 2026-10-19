---
"@onysnow/fx": minor
"@onysnow/ui": patch
"@onysnow/tokens": patch
---

`fx`: spider webs and falling glass pieces now cast shadows through the shared shape-caster path; add `FreeSurfaces` (type and plastic buttons over a `[data-photo]` surface catch light and cast shadows), mounted by `FxStage`; effects stand down at the `minimal` quality tier (`effectsEnabled()`), and quality tiers are on by default; `configureFx` warns when `previews` is set too late; `framer-motion` is now a peer dependency. `ui`: `resizable` works with react-resizable-panels v4 (vertical groups). `tokens`: `bootScript` escapes interpolated strings.
