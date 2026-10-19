/** The named effects that can be switched on, and what each one is (see engine/preview for how they are read). */
export const PREVIEWS = {
  /** Scratches and smudges block and scatter in proportion to each pixel's opacity. */
  marks: "Scratches and smudges act in proportion to how much of each pixel they cover",
  burn: "Bright coloured light burns toward white at its core, as on film, instead of staying fully saturated",
  satin: "The front of the glass etched like the back, so reflected room lights are soft glows",
  dimroom:
    "The room's brightest lights (windows, softboxes) compressed so their reflection doesn't clip to white",
  flash:
    "The shutter flash is a light in the scene: the glass, the light through it and the rims answer it",
  shaderplastic:
    "The orange buttons lit by the glass light pass from every light in the scene, instead of by CSS gradients that knew only the cursor",
  blacklight:
    "The lamp is a black light: it gives off UV and only a violet glow; smudges on the glass, white type and the orange plastic fluoresce",
  magnifier:
    "A detective's magnifying glass where the lamp is: the live page enlarged through a real lens, swimming and colour-fringed at the rim",
  flare:
    "A burning road flare where the lamp is: deep red, flickering and sputtering, lighting the glass and the photographs",
  polariser:
    "Light engine step H: the glass's reflections by the exact Fresnel equations, s and p apart, and a polarising filter on the camera (Camera > Polarising filter) to cut or keep them",
  roughglass:
    "Light engine step H: the light through a frosted face from its microfacets (Walter et al. 2007) -- how much gets through and how widely it scatters -- in place of two rules of thumb",
  photolights:
    "Light engine step I: the brightest spots of the photographs behind the panes -- neon, windows, lamps they recorded -- are lights under the glass, shining up into it in their own colour and following the photographs as they slide",
  kelvin:
    "The lamp's colour from its temperature, as a camera's white balance speaks of it (Light > Lamp colour temperature): a blackbody's glow, 1900 K candle to 10000 K blue sky",
  vignette:
    "The lens's natural vignetting (Camera > Vignetting): the picture's corners darker by cos^4 of their angle off the lens's axis, as in a photograph",
  coating:
    "Museum and opal glass on Lab samples: polished glass with an anti-reflection coating on each face (a quarter wave of magnesium fluoride) beside the same glass bare -- the room's reflection falls to a third and turns faintly purple -- and opal glass, which scatters blue in its volume (Rayleigh): lit, it glows faintly blue and what comes through lands warm",
  gapparallax:
    "Item 33: how far a photograph slides under its glass as you scroll comes from how far the glass stands off it and how far away your eye is (gap / (distance + gap)), not from a depth preset",
  quality:
    "Item 34: quality tiers -- a device with 4 GB or less, 4 cores or fewer, no GPU, or frames that keep coming slow runs a lighter site (the light drawn at 1 device pixel per CSS pixel, the bokeh layer off); force one with ?quality=full|lite|minimal",
  redroom:
    "Item 39, secret 2: take a picture of a photograph (wind the shutter, click one) and the page goes dark but for the safelight -- everything a negative in red, as a print looks in the developer tray; the cursor is a loupe showing the true frame; the picture you took comes up in the developer and hangs on the line on a cord, swinging as a real one does -- grab it and swing it; Lights on or Escape leaves",
  flashlight:
    "A flashlight where the lamp is (item 25i): a beam -- a bright hotspot and a dim spill. Press and hold to plant it; it stays where you pressed and turns to point where the pointer goes, lighting whatever the beam falls on",
  laser:
    "A laser pointer's beam across the page (?laser=red|green|violet): it enters the panes at their edges, bends, splits, is guided and absorbed as real glass does; press and drag to aim",
  bounce:
    "Light bouncing off a lit photograph lights the frosted glass above it from below, in the photograph's colour (light engine step F)",
  corners:
    "The bevel's lines round each corner in a curve instead of meeting in a mitre, so no thin line runs in from the corners (item 2a)",
  contact:
    "Two panes resting dry on each other (the Contact stack on Lab samples): the air film between them shows Newton's colours where both faces are polished, black where they touch (light engine step G)",
  broken:
    "Broken panes on Lab samples -- plain (annealed) and laminated -- cracks as mirrors that flash with the lamp, the view stepping at each crack",
  breaklib:
    "Broken glass B1: the break is a real one, simulated with physics offline (tools/fracture-sim) and placed at the strike, its cracks arriving in their simulated order, instead of the generated pattern",
  shardlight:
    "Item 10 step 3b, with ?try=broken: each piece of a broken pane mirrors the room at its own slope, per pixel in the glass shader -- a mirror turned by t turns the reflection by 2t, so the room's reflection breaks up piece by piece along the cracks; a hole reflects nothing",
  fireworks:
    "Task 81: fireworks over the page -- click to send up a shell (a show goes up on its own too); stars fly out at a 10-go shell's speed, slow by air drag, burn about 2 s in their chemistry's colour (strontium, barium, copper, sodium, calcium, magnesium), shed charcoal sparks, and light the page in their colour, no more than three flashes a second",
  fire: "Task 82: a burning torch in the hand -- firelight at 1900 K that puffs at 6.7 Hz with slower wander and the odd gutter, lighting the glass and throwing swaying shadows; the flame leans as you move it and burns brighter when fanned; the room goes dark around it",
  webs: "Task 75: a garden spider's orb web in the corner of the hero, built from measured webs and solved thread by thread -- it sways in the room's air and the pointer's wake, glints where each light catches its threads, tears when you pull a thread too far, and a flick cuts through it",
  balloons:
    "Task 74: helium party balloons in the room in front of the page -- they rise to the top of the window and wander on its draughts, the pointer's wake pushes them, a click pops one; latex lit by every light, crystal ones throwing coloured shadows (Water & room > Balloons)",
  drops:
    "Task 77: rain on the glass, rebuilt for photorealism -- drawn at the screen's own pixels, drops at their real size, pear-shaped and irregular, thousands of tiny droplets between them; wet frosted glass goes clear, so each drop is a lens holding the photograph sharp and upside down, dark-rimmed, with every light's glint; heavy drops run and sweep clean tracks (Water > Rain, Droplets, Rain lands on)",
  solids:
    "Glass solids on Lab samples -- prism, sphere, cube, cone, pyramid, rod -- ray traced through their glass",
  tools:
    "A tray to pick what you hold -- lamp, black light, flare, laser or magnifier -- one at a time",
  liquidlights:
    "Liquid glass lit only by the scene's lights: its own fixed gloss, rim glow, white Fresnel and drop shadow are off",
  liquidedge:
    "Liquid glass edges the way the CSS glass draws them: the bevel bends by Snell through the pane's own edge and thickness (the same numbers as the CSS bend), colours split by the glass's own dispersion, the pane's smoky fill, no drawn rim lines, and none of the library's own fixed lights -- on a band they are the bright streaks across the screen (2j; includes liquidlights)",
} as const;

export type PreviewName = keyof typeof PREVIEWS;
