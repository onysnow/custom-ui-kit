import { useEffect, useState } from "react";
import { FloorLight } from "./FloorLight";
import { FreeSurfaces } from "./FreeSurfaces";
import { GlassFilters } from "./GlassFilters";
import { PhotoLights } from "./PhotoLights";
import { PlasticBevel } from "./PlasticBevel";
import { Vignette } from "./Vignette";
import { WaterDrops } from "./WaterDrops";
import { Balloons } from "./Balloons";
import { Fireworks } from "./Fireworks";
import { SpiderWebs } from "./SpiderWebs";
import { CustomCursor } from "./CustomCursor";
import { ShutterFlash } from "./ShutterFlash";

/** Runs `fn` once the page has loaded and the browser is idle (or after a short cap). Returns a cancel function. */
function whenIdle(fn: () => void): () => void {
  // Safari has no requestIdleCallback.
  const win = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  let cancelled = false;
  let idle = 0;
  let timer = 0;
  const go = () => !cancelled && fn();
  const run = () => {
    if (cancelled) return;
    if (win.requestIdleCallback) idle = win.requestIdleCallback(go, { timeout: 4000 });
    else timer = window.setTimeout(go, 1500);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
    if (idle) win.cancelIdleCallback?.(idle);
    window.clearTimeout(timer);
  };
}

export type FxStageProps = {
  /** The SVG filters the glass panes use. Needed by every <Glass>/<Pane>. Default true. */
  glassFilters?: boolean;
  /** The light on the floor under the panes (the lamp that follows the pointer). Default true. */
  floorLight?: boolean;
  /** The brightest spots of photographs behind panes act as lights. Default true. */
  photoLights?: boolean;
  /**
   * Type and plastic buttons that stand over a `[data-photo]` surface catch the lamp and throw shadows. Pass a
   * selector to use your own marker. Default true.
   */
  freeSurfaces?: boolean | string;
  /** Lit, rounded plastic buttons (`.plastic`). Default true. */
  plasticBevel?: boolean;
  /** The lens's darker corners. Default true. */
  vignette?: boolean;
  /** Rain running down the glass. Needs `previews: ["drops"]` in configureFx. Default false. */
  rain?: boolean;
  /** Party balloons drifting in the room (needs `previews: ["balloons"]`). Default false. */
  balloons?: boolean;
  /** A spider's web in the corner (needs `previews: ["webs"]`). Default false. */
  webs?: boolean;
  /** Fireworks (needs `previews: ["fireworks"]`). Default false. */
  fireworks?: boolean;
  /** The camera-shaped cursor with the wind-up flash. Default false. */
  cursor?: boolean;
};

/**
 * The standard set of effect layers, mounted once near the root of the app, after hydration.
 *
 *   <FxStage rain />
 *
 * Every layer is a fixed-position canvas or overlay that finds the page's `<Glass>` panes and lit surfaces by itself,
 * so the stage has no children and nothing to wire up. Which layers run is plain props; which *named* effects are
 * allowed to run at all is `configureFx({ previews })`.
 */
export function FxStage({
  glassFilters = true,
  floorLight = true,
  photoLights = true,
  plasticBevel = true,
  freeSurfaces = true,
  vignette = true,
  rain = false,
  balloons = false,
  webs = false,
  fireworks = false,
  cursor = false,
}: FxStageProps) {
  // Effects measure the document and draw to canvases, so none of them belongs in the server render. They also run
  // a frame loop that can starve React's own (idle-priority) hydration of the rest of the page, so they wait
  // until the browser is idle after load.
  // Phase 1: the light layers. Phase 2, a moment later: the heavy simulations (rain, balloons, webs, fireworks).
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  useEffect(() => whenIdle(() => setPhase(1)), []);
  useEffect(() => {
    if (phase !== 1) return;
    let cancel = () => {};
    const timer = window.setTimeout(() => {
      cancel = whenIdle(() => setPhase(2));
    }, 2000);
    return () => {
      window.clearTimeout(timer);
      cancel();
    };
  }, [phase]);
  if (phase === 0) return null;
  const heavy = phase === 2;
  return (
    <>
      {glassFilters && <GlassFilters />}
      {floorLight && <FloorLight />}
      {photoLights && <PhotoLights />}
      {plasticBevel && <PlasticBevel />}
      {freeSurfaces && (
        <FreeSurfaces {...(typeof freeSurfaces === "string" ? { scope: freeSurfaces } : {})} />
      )}
      {vignette && <Vignette />}
      {heavy && rain && <WaterDrops />}
      {heavy && balloons && <Balloons />}
      {heavy && webs && <SpiderWebs />}
      {heavy && fireworks && <Fireworks />}
      {heavy && cursor && (
        <>
          <CustomCursor />
          <ShutterFlash />
        </>
      )}
    </>
  );
}
