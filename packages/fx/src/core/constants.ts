/**
 * Numbers more than one layer needs. They live in `core` (the bottom layer) so the tuning registry and the optics
 * maths can both read them without importing each other.
 */

/** The glass's rounded-over edge, CSS px, when nothing says otherwise (the "Edge width" knob's default). */
export const DEFAULT_EDGE_WIDTH = 40;
