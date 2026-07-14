// src/content/rules/hide-shorts.ts
//
// Hides Shorts everywhere: home/subscriptions shelves, the sidebar entry,
// channel page tabs, search results, and any individual Shorts item that
// slips into a normal video grid.

import { HIDE_CLASSES } from "@shared/constants";
import { GUIDE, SHORTS } from "../selectors";
import { closestSafe, hide, queryAll, unhideByClass } from "../dom-utils";

const CLASS = HIDE_CLASSES.shorts;

function hideShortsShelves(): void {
  queryAll(SHORTS.shelves).forEach((el) => hide(el, CLASS));
  queryAll(SHORTS.items).forEach((el) => hide(el, CLASS));
}

/** The sidebar/guide "Shorts" entry, matched by href so it works in any UI language. */
function hideShortsGuideEntry(): void {
  queryAll(GUIDE.entries).forEach((entry) => {
    const link = entry.querySelector<HTMLAnchorElement>(GUIDE.entryLink);
    const href = link?.getAttribute("href") ?? "";
    if (SHORTS.guideEntryHrefPattern.test(href)) {
      hide(entry, CLASS);
    }
  });
}

/** The "Shorts" tab on a channel page's tab strip. */
function hideChannelShortsTab(): void {
  queryAll("tp-yt-paper-tab, yt-tab-shape").forEach((tab) => {
    const link = tab.querySelector<HTMLAnchorElement>("a");
    const href = link?.getAttribute("href") ?? tab.getAttribute("href") ?? "";
    if (SHORTS.channelTabHrefPattern.test(href)) {
      hide(tab, CLASS);
    }
  });
}

/** Individual Shorts thumbnails that appear mixed into an otherwise normal grid/list. */
function hideEmbeddedShortsItems(): void {
  queryAll(SHORTS.thumbnailOverlaySelector).forEach((badge) => {
    const parent = closestSafe(badge, SHORTS.parentRendererSelector);
    if (parent) hide(parent, CLASS);
  });
}

export function applyHideShorts(enabled: boolean): void {
  if (!enabled) {
    unhideByClass(CLASS);
    return;
  }
  hideShortsShelves();
  hideShortsGuideEntry();
  hideChannelShortsTab();
  hideEmbeddedShortsItems();
}
