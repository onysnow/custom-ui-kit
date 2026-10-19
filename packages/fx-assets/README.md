# @onysnow/fx-assets

Binary assets for `@onysnow/fx` (about 12 MB): glass surface/smudge/scratch maps, HDR room reflections, the fracture
library, shard cut-outs, flare sprites, water textures and shutter sounds. They live in their own package so that
installing the code stays small and the assets version independently.

Serve them from your site root (copy `node_modules/@onysnow/fx-assets/assets/*` into `public/`), or from a CDN and tell
the library where they are:

```ts
import { configureFx } from "@onysnow/fx/core/config";
configureFx({ assetBase: "https://cdn.example.com/fx" });
```
