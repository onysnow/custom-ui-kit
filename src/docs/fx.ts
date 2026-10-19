// Configures the effects system for this site. Imported once, from the root route, before any effect mounts
// (on the server too: the room reflection script in <head> is built from this configuration).
import { configureFx } from "@onysnow/fx/core/config";

configureFx({
  // The library's textures, rooms and sounds are served from /fx (see tooling/fx-assets-plugin.ts).
  assetBase: "/fx",
  // Named effects that are allowed to run for every visitor, on top of the ones on by default.
  previews: [
    "drops",
    "satin",
    "balloons",
    "webs",
    "fireworks",
    "blacklight",
    "magnifier",
    "flashlight",
    "flare",
  ],
});
