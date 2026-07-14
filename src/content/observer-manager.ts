// src/content/observer-manager.ts
//
// YouTube is a single-page app that streams in new DOM constantly (infinite
// scroll, lazy-loaded shelves, client-side route changes). Rather than one
// MutationObserver per rule, the extension runs exactly one observer here and
// fans a single debounced "re-scan" callback out to every rule. This keeps
// the performance cost bounded and predictable regardless of how many
// features are enabled.

import { debounce } from "./dom-utils";

const MUTATION_DEBOUNCE_MS = 150;

let observer: MutationObserver | null = null;
let navigateListenerAttached = false;

/**
 * Start watching the page for DOM changes and YouTube's own SPA navigation
 * events. `onChange` is called (debounced) after any relevant mutation, and
 * called immediately (not debounced) on navigation, since a route change
 * should apply new rules right away rather than waiting out the debounce.
 */
export function startObserving(onChange: () => void): void {
  stopObserving();

  const debouncedChange = debounce(onChange, MUTATION_DEBOUNCE_MS);

  observer = new MutationObserver((mutations) => {
    // Skip scans triggered purely by our own class-list toggles, so hiding an
    // element doesn't itself trigger another scan.
    const relevant = mutations.some((m) => {
      if (m.type === "attributes" && m.attributeName === "class") {
        const target = m.target as Element;
        if (target.className && String(target.className).includes("yfm-hidden")) {
          return false;
        }
      }
      return true;
    });
    if (relevant) debouncedChange();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href", "aria-checked", "is-shorts"],
  });

  // YouTube fires this custom event on every client-side route change
  // (clicking a video, the logo, the sidebar, etc.) without a full page load.
  if (!navigateListenerAttached) {
    document.addEventListener("yt-navigate-finish", onChange);
    navigateListenerAttached = true;
  }
}

export function stopObserving(): void {
  observer?.disconnect();
  observer = null;
}
