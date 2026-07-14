// src/content/dom-utils.ts
//
// Generic DOM helpers with no knowledge of YouTube's specific markup. Keeping
// these YouTube-agnostic means they never need to change when a selector in
// selectors.ts changes, and they're trivially unit-testable in isolation.
//
// Every hide/show helper takes an explicit className rather than assuming a
// single global "hidden" class — see HIDE_CLASSES in shared/constants.ts for
// why: each feature owns its own class so toggling one feature off can never
// accidentally reveal something a different, still-enabled feature hid.

import { HideClassName } from "@shared/constants";

/** Query all matching elements as a real array (querySelectorAll returns a static NodeList). */
export function queryAll(selector: string, root: ParentNode = document): Element[] {
  try {
    return Array.from(root.querySelectorAll(selector));
  } catch {
    // A malformed selector should never crash the whole content script.
    return [];
  }
}

export function hide(el: Element, className: HideClassName): void {
  el.classList.add(className);
}

export function show(el: Element, className: HideClassName): void {
  el.classList.remove(className);
}

export function hideAll(selector: string, className: HideClassName, root: ParentNode = document): number {
  const els = queryAll(selector, root);
  els.forEach((el) => hide(el, className));
  return els.length;
}

/** Removes one feature's hide-class from every element currently carrying it, scoped to a root.
 * Used when that specific feature is turned off, so exactly the elements it hid reappear. */
export function unhideByClass(className: HideClassName, root: ParentNode = document): void {
  queryAll(`.${className}`, root).forEach((el) => show(el, className));
}

export function textOf(el: Element | null): string {
  return (el?.textContent ?? "").trim().toLowerCase();
}

/** Nearest ancestor (or self) matching a selector, without throwing on detached nodes. */
export function closestSafe(el: Element, selector: string): Element | null {
  try {
    return el.closest(selector);
  } catch {
    return null;
  }
}

/**
 * Debounce: collapse bursts of calls (e.g. from a MutationObserver firing on every
 * one of YouTube's many rapid DOM writes) into a single trailing call.
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
}

/** Dispatch a real "click" event — some YouTube toggles listen for pointer/click events
 * rather than exposing a settable property, so a synthetic click is the reliable option. */
export function simulateClick(el: Element): void {
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
}
