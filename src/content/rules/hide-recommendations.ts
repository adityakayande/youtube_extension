// src/content/rules/hide-recommendations.ts
//
// The home page itself is handled by homepage-redirect.ts (the user is never
// shown it). This rule covers two remaining cases:
//
//   1. A safety net for the home grid itself, in case the redirect is ever
//      disabled, races the page load, or a future YouTube change bypasses it.
//      This ONLY runs when the pathname is actually "/", never elsewhere —
//      the same <ytd-rich-grid-renderer> element also renders the
//      subscriptions feed and channel "Videos" tabs, which must stay visible
//      (requirement: subscriptions feed remains fully functional).
//   2. Recommendation shelves that appear on pages we do want the user to
//      see, e.g. "People also watched" on search or "For you" on a channel
//      page. These use distinct shelf-renderer elements, never the grid
//      renderer, so hiding them can't collide with case 1.

import { HIDE_CLASSES } from "@shared/constants";
import { HOME_RECOMMENDATIONS, RECOMMENDATION_SHELVES } from "../selectors";
import { hide, queryAll, unhideByClass } from "../dom-utils";
import { isHomePage } from "./homepage-redirect";

const CLASS = HIDE_CLASSES.recommendations;

export function applyHideRecommendations(enabled: boolean): void {
  if (!enabled) {
    unhideByClass(CLASS);
    return;
  }

  // Case 1: only ever touches the grid on the actual home path.
  if (isHomePage(window.location.pathname)) {
    queryAll(HOME_RECOMMENDATIONS).forEach((el) => hide(el, CLASS));
  }

  // Case 2: shelves are never the primary subscriptions/channel grid, so this
  // is safe on every page.
  queryAll(RECOMMENDATION_SHELVES).forEach((el) => hide(el, CLASS));
}
