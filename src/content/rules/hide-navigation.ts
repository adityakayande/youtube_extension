// src/content/rules/hide-navigation.ts
//
// Trims the left-hand guide (sidebar) down to the sections a learning-focused
// user actually needs: Subscriptions, Library, History, Watch Later,
// Playlists, and individual channels. Everything algorithmic or
// entertainment-oriented (Explore, Trending, Gaming, Music, Movies, Live,
// Shopping, Fashion, Podcasts, Learning shelves) is hidden.
//
// This rule is always active whenever Focus Mode is on — unlike the other
// features it has no separate popup toggle, since a cluttered sidebar full of
// distraction categories undermines Focus Mode's purpose even with
// recommendations and Shorts hidden. (Note for maintainers: promoting this to
// its own FocusSettings flag is a small, backward-compatible change if a
// future version wants to expose it.)

import { HIDE_CLASSES } from "@shared/constants";
import { GUIDE, NAV_LABELS_TO_HIDE, NAV_PATHS_TO_HIDE, NAV_PATHS_TO_KEEP } from "../selectors";
import { hide, queryAll, textOf, unhideByClass } from "../dom-utils";

const CLASS = HIDE_CLASSES.navigation;

function shouldHideEntry(href: string, label: string): boolean {
  if (NAV_PATHS_TO_KEEP.some((pattern) => pattern.test(href))) return false;
  if (NAV_PATHS_TO_HIDE.some((pattern) => pattern.test(href))) return true;
  // Fallback for entries with no href to test against (rare in practice).
  if (!href && NAV_LABELS_TO_HIDE.includes(label)) return true;
  return false;
}

export function applyHideNavigation(enabled: boolean): void {
  if (!enabled) {
    unhideByClass(CLASS);
    return;
  }

  queryAll(GUIDE.entries).forEach((entry) => {
    const link = entry.querySelector<HTMLAnchorElement>(GUIDE.entryLink);
    const href = link?.getAttribute("href") ?? "";
    const label = textOf(entry.querySelector(GUIDE.entryLabel));
    if (shouldHideEntry(href, label)) {
      hide(entry, CLASS);
    }
  });
}
