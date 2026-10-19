# ADR-0001: One scene, an enforced layering

**Status:** Accepted (partly implemented; see "Implementation status")
**Date:** 2026-10-19
**Deciders:** Ony (2026-10-19: "the shadows should be integrated; otherwise do what's best")

## Context

`@onysnow/fx` was extracted from the OnySnow Studios site (commit `489a1cf`) and the vendored copy in Private-ai.
Its design intent, from the original ADR-0003, is that the effects are **not load-bearing**: anything that degrades
should degrade to nothing, and the page underneath must remain a good website. Its integration intent, from the light
catalogue, is **one lamp and one room feeding every surface**, so glass, plastic, photographs and water act on each
other.

This review measures how well the code does that, from the import graph (not from running every effect on a GPU).

### Finding 1: the shared light list is well integrated; shadow casting and quality gating are not

26 modules read the shared light list (`light/lights`) and 19 read the scene graph (`scene/scene`). Across the 44
components in `react/`:

| Effect                                 | Emits light | Reads lights | Casts / registers in scene | Uses shared GL / scheduler | Camera     | Consults quality tier |
| -------------------------------------- | ----------- | ------------ | -------------------------- | -------------------------- | ---------- | --------------------- |
| Glass, GlassLight, GlassSolid          | GlassLight  | yes          | yes                        | yes                        | yes        | GlassLight only       |
| FloorLight, TransmittedLight, Img      | no          | FloorLight   | yes                        | FloorLight                 | FloorLight | FloorLight only       |
| WaterDrops                             | no          | yes          | yes (casters, scene)       | yes                        | yes        | **yes**               |
| PlasticBevel                           | no          | yes          | **no**                     | yes                        | no         | **no**                |
| Balloons                               | no          | yes          | yes (own `shape-casters`)  | yes                        | yes        | **no**                |
| SpiderWebs                             | no          | yes          | **no**                     | scheduler                  | yes        | **no**                |
| Fireworks                              | **yes**     | yes          | **no scene, no camera**    | **no**                     | **no**     | **no**                |
| BrokenGlass                            | no          | yes          | scene, but no casters      | yes                        | yes        | **no**                |
| Magnifier                              | yes         | yes          | yes (`optics/shadow`)      | no                         | no         | no                    |
| Neon, GlowPaint, FlareTorch, FireTorch | yes         | yes          | no                         | no                         | no         | no                    |

Reading it:

- **Light is shared.** Emitters (Fireworks, Neon, flares, photo highlights, the flash) register in one list and every
  receiver reads it. Adding a light reaches the glass, floor, water and plastic together.
- **Shadows are not.** Only `FloorLight`, `WaterDrops`, `Glass`/`GlassLight`, `Magnifier` and `Balloons` (through its own
  `shape-casters`) take part. Webs, fireworks and cracked glass read light but cast nothing; plastic is lit but throws
  no shadow. Balloons and Magnifier each have a private caster path rather than the shared one.
- **Quality and reduced-motion gating is uneven.** Only `CursorLight`, `FloorLight`, `GlassLight` and `WaterDrops`
  import the quality tier. `Balloons`, `SpiderWebs`, `Fireworks`, `PlasticBevel` and `BrokenGlass` do not, so on a weak
  device or for a reduced-motion visitor they run at full cost. This breaks the not-load-bearing rule.
- **Not verified:** whether rain drops feed caustics or shadows back into `FloorLight`. `WaterDrops` reads the casters
  and floor map, but I did not trace the reverse path.

### Finding 2: the folders form cycles

The intended layering is `core -> engine -> optics -> materials -> light -> scene -> adapters -> react`. The import
graph has eight two-way cycles:

| Pair                                                                                             | Imports each way | Why it matters                                                                                        |
| ------------------------------------------------------------------------------------------------ | ---------------- | ----------------------------------------------------------------------------------------------------- |
| `optics <-> light`                                                                               | 5 / 3            | `optics` should be pure maths and GLSL. The glass and floor shaders live in `optics` but read lights. |
| `optics <-> materials`                                                                           | 5 / 3            | the shaders read material presets                                                                     |
| `optics <-> scene`                                                                               | 2 / 7            | `casters` reads the scene graph                                                                       |
| `optics <-> core`, `engine <-> core`, `optics <-> engine`, `scene <-> engine`, `scene <-> light` | 1-5              | `tuning` imports `edge-profile`; engine imports admin-style config                                    |

These cycles are the reason `fx` cannot be split into `fx-core` / `fx-optics` / `fx-light` packages today: a package
boundary would turn each cycle into a cross-package cycle.

### Finding 3: tuning is a global mutable singleton

`core/tuning.ts` (2,093 lines, 154 knobs) is read by about 18 effect modules and mutated by anything holding a reference.
That keeps the render loops cheap (no re-render), but it makes tests order-dependent, makes two differently-tuned scenes
on one page impossible, and is shared across requests under SSR. The docs site's `Knob` component demonstrates the
leak: tweaks persist after navigating away.

## Decision

Keep one package, and make its layering and its scene contract enforced instead of conventional.

1. **Enforce the layers.** Add a dependency-boundary check to CI (`dependency-cruiser` or
   `eslint-plugin-boundaries`) encoding `core -> engine -> optics -> materials -> light -> scene -> passes -> adapters ->
react`. Start with the eight current cycles allow-listed so it passes, then remove them one by one. The check only
   ever gets stricter.
2. **Move the passes.** Shaders that read lights (`glass-light-shader`, `floor-light-shader`, `cursor-light-shader`,
   bevel filters) move out of `optics` into a `passes/` layer above `scene`. `optics` becomes pure maths.
3. **One participant contract.** Every effect registers through a small `defineEffect({ emits, receives, casts, tier,
motion })` descriptor. `FxStage` reads the descriptors to apply quality tiers and reduced-motion uniformly, and tests
   iterate the registry. Casters and emitters have one registration path each, replacing `shape-casters` and
   `optics/shadow` as separate routes.
4. **Inject tuning.** Replace the singleton with `createTuning(knobs)` and an `FxProvider`, keeping a default instance so
   existing call sites work during the migration.
5. **Test the integration.** Port the 13 Playwright specs and run them in CI on software GL as a smoke suite, plus
   headless contract tests: every effect that declares `casts` appears in the caster list, and every `emits` appears in
   the light list.

## Options Considered

### Option A: Keep the current structure and conventions

| Dimension        | Assessment                                                         |
| ---------------- | ------------------------------------------------------------------ |
| Complexity       | None now, growing                                                  |
| Cost             | Free today; every new effect re-decides how to cast, gate and tune |
| Scalability      | Poor: cycles and the singleton compound                            |
| Team familiarity | High                                                               |

**Pros:** nothing to do. **Cons:** the uneven shadow and quality behaviour stays, and package splitting stays blocked.

### Option B: One package, enforced layers, participant contract (recommended)

| Dimension        | Assessment                                              |
| ---------------- | ------------------------------------------------------- |
| Complexity       | Medium: moves files, adds a registry                    |
| Cost             | A few focused refactors, each shippable on its own      |
| Scalability      | Good: new effects get gating and shadows by declaration |
| Team familiarity | High: same code, same folders                           |

**Pros:** fixes the three findings; keeps all 541 tests; ratchets safely. **Cons:** touches the heaviest modules; needs
GPU time to confirm visuals are unchanged.

### Option C: Split into packages now (`fx-core`, `fx-optics`, `fx-light`, `fx-water`, `fx-react`)

| Dimension        | Assessment                   |
| ---------------- | ---------------------------- |
| Complexity       | High                         |
| Cost             | Large; blocked by the cycles |
| Scalability      | Good once done               |
| Team familiarity | Medium                       |

**Pros:** smaller installs and independent versions. **Cons:** impossible before Option B's cycle-breaking, and the
effects are one system, so most consumers need all of it.

### Option D: Rebuild as a scene-graph renderer where every effect is a node

| Dimension        | Assessment                                       |
| ---------------- | ------------------------------------------------ |
| Complexity       | Very high                                        |
| Cost             | A rewrite; high regression risk on tuned visuals |
| Scalability      | Best long-term coherence                         |
| Team familiarity | Low                                              |

**Pros:** shadows, light and quality become structural. **Cons:** the tuned look is the product, and a rewrite risks it.

## Trade-off Analysis

B gives most of D's coherence (a declared contract, uniform gating) at a fraction of the risk, and is the prerequisite
for C if splitting is ever wanted. A is cheapest now and most expensive later. D is the right end state only if the look
stops changing, which it has not.

## Consequences

- New effects get quality tiers, reduced-motion handling, shadows and light for free by declaring roles.
- Webs, fireworks, plastic and cracked glass start casting shadows, which changes how those effects look. That needs
  your approval, effect by effect.
- Layering becomes a CI failure rather than a review comment.
- Tuning becomes testable and SSR-safe; two differently-tuned scenes on one page become possible.
- We will need to revisit: package splitting (C), and a real GPU CI runner for the visual specs.

## Action Items

1. [ ] Add the boundary check with the eight cycles allow-listed (no behaviour change).
2. [ ] Fix the quality/reduced-motion gap first: gate `Balloons`, `SpiderWebs`, `Fireworks`, `PlasticBevel` and
       `BrokenGlass` on the tier. This is the smallest change that restores the not-load-bearing rule.
3. [ ] Move the light-reading shaders into `passes/`; remove `optics -> light/scene/materials`.
4. [ ] Introduce `defineEffect` and migrate effects one at a time; unify the caster and emitter registration paths.
5. [ ] Replace the tuning singleton with `createTuning` + `FxProvider`.
6. [ ] Port the Playwright specs and run them on software GL in CI.
7. [ ] Ask Ony which of web, firework, plastic and cracked-glass shadows should be added (a look change).

## Implementation status (2026-10-19)

Done, with tests where the logic is pure:

- [x] **Quality and reduced-motion gating.** `effectsEnabled()` (false at the `minimal` tier) now stands down balloons,
      spider webs, fireworks, the plastic bevel and cracked glass. The quality tiers are on by default instead of
      behind a preview flag, so phones and visitors who prefer reduced motion get the quiet set, and software
      renderers get `lite`. This is a behaviour change for the portfolio and Private-ai when they migrate.
- [x] **Layer boundary check.** `bun run check:layers` (dependency-cruiser) runs in CI. 22 existing violations are
      recorded in `.dependency-cruiser-known-violations.json`; a new one fails the build (verified by adding one).
- [x] **Shadows integrated.**
  - _Spider webs_ cast a shadow: the live thread network is a shape caster, rebuilt each frame (and emptied when out
    of view).
  - _Cracked glass:_ each piece knocked out is a shape caster while it falls, from the pane's face down to the floor,
    passing more light as it fades.
  - _Plastic buttons and free-standing type_ now cast and catch light over any surface marked `data-photo` (or your
    own selector) through `FreeSurfaces`, which `FxStage` mounts (ported from the portfolio, router-free).
  - _Fireworks_ emit light into the shared list, so every other surface's shadow is cast by them. Sparks cast no
    shadow of their own: they are embers, and a shadow from a light source is not physical.
- [x] Quick fixes from the code review: `configureFx` warns when `previews` is changed too late, `bootScript` escapes
      its interpolated strings, `framer-motion` is a peer, the docs `Knob` restores its knob, and `ui/resizable` is
      styled for react-resizable-panels v4.

Still to do: move the light-reading shaders into a `passes/` layer, the `defineEffect` participant contract, replacing
the tuning singleton, porting the Playwright specs, and the shadow visuals on a real GPU (see Consequences).

**A finding while doing this.** The lamp is the camera cursor: it only lights while the shutter is wound (press and
hold), and nothing sets its position unless `CustomCursor` is mounted. The docs site had no cursor mounted, so its lamp
never lit and its copy ("the lamp follows your pointer") was wrong. `FxStage` now documents this and the docs site
mounts the cursor whenever effects are on.
