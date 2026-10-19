export type EffectEntry = {
  slug: string;
  title: string;
  description: string;
  /** What the library exports for it. */
  exports: string[];
  /** Whether it needs the stage layers or a named preview to run. */
  needs?: string;
  /** How it works, in a few sentences each. */
  notes: string[];
  /** The `import` line shown on the page. */
  importLine: string;
};

export const EFFECTS: EffectEntry[] = [
  {
    slug: "glass",
    title: "Glass",
    description:
      "A pane of real glass: thickness, edge bevel, reflections of the room, light through it and under it. Described by causes, not looks.",
    exports: ["Pane", "Glass", "GlassSection"],
    notes: [
      "A pane is described by causes (its material, thickness, edge width, and the gap to whatever is behind it), never by looks. The bend, the rim highlight, the reflection of the room, the light through it and the side faces all follow from those causes.",
      "Materials are real glasses: frosted float (n 1.518), optical crown, dense flint, museum glass with an anti-reflection coating, and opal. Each has an index of refraction, an Abbe number for colour dispersion, and its own absorption.",
      "Leave a prop out and you get the default pane. Every pane registers itself, so the light, floor and water layers find it without wiring.",
    ],
    importLine: 'import { Pane } from "@onysnow/fx/react/Pane";',
  },
  {
    slug: "rain",
    title: "Rain",
    description:
      "Drops that run down the glass, merge, leave trails and bend the light behind them, simulated and drawn in WebGL.",
    exports: ["WaterDrops"],
    needs: 'previews: ["drops"]',
    notes: [
      "Drops form on the glass, grow as they collect water, run when heavy enough, leave trails and merge. The simulation is a fixed-step model, so it does not depend on the frame rate.",
      "Each drop is a tiny lens: the scene behind it is flipped and bent through a lookup texture, so the light from your lamp and room refract through it.",
      'WaterDrops is one fixed canvas. It finds every Pane on the page. It needs the "drops" preview switched on with configureFx.',
    ],
    importLine: 'import { WaterDrops } from "@onysnow/fx/react/WaterDrops";',
  },
  {
    slug: "light",
    title: "Light and shadow",
    description:
      "One lamp and the room's lights, shared by every surface: glass, plastic, photographs and type light each other and cast shadows through the same scene.",
    exports: ["FloorLight", "PhotoLights", "TransmittedLight"],
    notes: [
      "There is one lamp (the camera cursor: press and hold to wind it and it lights where the pointer is) and the room\\u2019s lights. Every surface reads that same list, so adding a light reaches the glass, the floor and the plastic together.",
      "Shadows come from the same lights: panes and content throw a shadow whose length follows the light height and whose softness follows the light size, onto whatever is under them.",
      "Light is colour-correct. The lamp\\u2019s colour comes from a temperature in kelvin, and bright light burns toward white at its core as it does on film.",
    ],
    importLine:
      'import { FloorLight } from "@onysnow/fx/react/FloorLight";\nimport { PhotoLights } from "@onysnow/fx/react/PhotoLights";',
  },
  {
    slug: "plastic",
    title: "Plastic",
    description:
      "Rounded buttons whose bevel is lit by every light in the scene, with a Fresnel reflection of the room.",
    exports: ["PlasticBevel"],
    notes: [
      "Moulded plastic, not glass: the bevel curves away from the face and takes a Fresnel reflection of the room plus a specular from each light.",
      "Add the class `plastic` to any rounded element, and mount PlasticBevel once. The bevel is lit by exactly the lights the glass uses.",
    ],
    importLine: 'import { PlasticBevel } from "@onysnow/fx/react/PlasticBevel";',
  },
  {
    slug: "bokeh",
    title: "Bokeh",
    description:
      "The out-of-focus lights behind a pane, shaped by the lens aperture and dimmed by the picture's vignette.",
    exports: ["BokehField", "CameraIris"],
    notes: [
      "The out-of-focus lights are drawn sharp behind a pane; the pane\\u2019s blur turns them into discs, as a lens would for lights outside the focal plane.",
      "The camera\\u2019s aperture sets their shape (blade count) and the lens vignette darkens the corners by cos\\u2074 of the angle off axis.",
    ],
    importLine: 'import { BokehField } from "@onysnow/fx/react/BokehField";',
  },
  {
    slug: "photo-section",
    title: "Photo sections",
    description:
      "A photograph that parallaxes as you pass, with a frosted pane over it. The pairing that makes glass read as glass.",
    exports: ["PhotoSection", "ParallaxScene", "Img"],
    notes: [
      "A photograph that parallaxes as you scroll, with the content on a pane over it. Without a picture underneath, glass is indistinguishable from a lighter panel.",
      "How far the picture lags comes from the pane: its gap and the viewer\\u2019s distance, not a depth preset.",
      "Pass a plain `src`, or stored paths resolved by configureFx({ photoUrl }).",
    ],
    importLine: 'import { PhotoSection } from "@onysnow/fx/react/PhotoSection";',
  },
];

export const effectBySlug = (slug: string) => EFFECTS.find((e) => e.slug === slug);
