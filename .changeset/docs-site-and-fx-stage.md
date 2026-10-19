---
"@onysnow/fx": minor
"@onysnow/ui": minor
---

`fx`: add `FxStage` (the standard effect layers, mounted after the page is idle so they cannot starve hydration), `configureFx({ previews, photoUrl, assetBase })`, `fxCssVars()`, and `Img`/`ParallaxScene`/`PhotoSection`/`Reveal`/`ScrambleText`; all bundled assets now resolve through the asset base. The effect stylesheet defaults `--amber` and `--teal`. `ui`: add `layout` (`Section`, `Container`, `Grid`, `FlexCard`).
