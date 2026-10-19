// Screens and tabs that stay mounted once opened and are only hidden need their window-level key handlers to check
// that their own screen is the one showing before they act. Otherwise Ctrl+Enter in one hidden panel acts on it.

/** Whether this element is on screen: still in the page and not inside anything marked `hidden`. */
export function onScreen(el: Element | null | undefined): boolean {
  return Boolean(el && el.isConnected && !el.closest("[hidden]"));
}

/** Whether a key went to something being typed into (a field, a list box or rich text). */
export function typingInto(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(
      target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'),
    )
  );
}
