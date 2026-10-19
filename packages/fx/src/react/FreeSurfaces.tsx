import { useEffect } from "react";
import { registerLitSurface } from "../scene/scene";

/** How far type and a button stand off the photograph they are over (as on glass: see Glass). */
const TYPE_STANDOFF = 0.42;
const PLASTIC_STANDOFF = 0.5;

/** The things that cast when they stand over a surface marked `scope`. */
const CASTERS = ":is(h1, h2, h3, h4, p, li, blockquote, .rich-text, .plastic, a)";

/**
 * The copy and buttons that stand over a photograph (or any scope you mark) rather than on a pane, lit like the ones
 * on panes: plastic buttons catch the lamp, and everything throws its shadow onto what it stands over.
 *
 *   <section data-photo>...<h1/> <a className="plastic"/>...</section>
 *   <FreeSurfaces />                         // default scope: [data-photo]
 *   <FreeSurfaces scope="[data-lit]" />      // or your own marker
 *
 * Found whenever the page changes, not once: copy that arrives later (from a database, or rich text) casts too.
 */
export function FreeSurfaces({ scope = "[data-photo]" }: { scope?: string }) {
  useEffect(() => {
    const selector = `${scope} ${CASTERS}`;
    const registered = new Map<HTMLElement, () => void>();
    const scan = () => {
      for (const [node, stop] of registered) {
        if (!node.isConnected) {
          stop();
          registered.delete(node);
        }
      }
      for (const node of document.querySelectorAll<HTMLElement>(selector)) {
        if (registered.has(node)) continue;
        // On a pane it is the pane's (Glass registers its own type).
        if (node.closest(".glass")) continue;
        // A link inside a heading or a button is that heading's or button's.
        if (node.parentElement?.closest(".plastic, h1, h2, h3, h4, p, li, blockquote, .rich-text"))
          continue;
        // Rich text made of paragraphs casts by its paragraphs; bare rich text casts itself.
        if (
          node.classList.contains("rich-text") &&
          node.querySelector("p, h1, h2, h3, h4, li, blockquote")
        )
          continue;
        const plastic = node.classList.contains("plastic");
        const dark = node.classList.contains("plastic--dark");
        registered.set(
          node,
          registerLitSurface(node, {
            occludes: false,
            standoff: plastic ? PLASTIC_STANDOFF : TYPE_STANDOFF,
            material: plastic && !dark ? "dayglo-orange" : "ink",
          }),
        );
      }
    };
    let pending = 0;
    const soon = () => {
      window.clearTimeout(pending);
      pending = window.setTimeout(scan, 250);
    };
    // Watched only after the first scan: before then React may still be hydrating, and writing light onto its
    // elements then is a hydration mismatch.
    const changes = new MutationObserver(soon);
    const timer = window.setTimeout(() => {
      scan();
      changes.observe(document.body, { childList: true, subtree: true, characterData: true });
    }, 400);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(pending);
      changes.disconnect();
      for (const stop of registered.values()) stop();
      registered.clear();
    };
  }, [scope]);
  return null;
}
