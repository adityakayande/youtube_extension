// src/content/rules/watch-page.ts
//
// Covers everything specific to the video watch page: the "Up next" /
// related-videos column, the in-player end-screen overlay, the "i" cards that
// pop up mid-video, floating suggestion surfaces, and (optionally) comments.

import { HIDE_CLASSES } from "@shared/constants";
import { WATCH_PAGE } from "../selectors";
import { hide, queryAll, unhideByClass } from "../dom-utils";

const SIDEBAR_CLASS = HIDE_CLASSES.watchSidebar;
const COMMENTS_CLASS = HIDE_CLASSES.comments;

/** Up next / related column, end-screen suggestions, in-player cards, floating suggestions. */
export function applyWatchSidebar(enabled: boolean): void {
  if (!enabled) {
    unhideByClass(SIDEBAR_CLASS);
    return;
  }
  queryAll(WATCH_PAGE.relatedColumn).forEach((el) => hide(el, SIDEBAR_CLASS));
  queryAll(WATCH_PAGE.endScreen).forEach((el) => hide(el, SIDEBAR_CLASS));
  queryAll(WATCH_PAGE.playerCards).forEach((el) => hide(el, SIDEBAR_CLASS));
  queryAll(WATCH_PAGE.floatingSuggestions).forEach((el) => hide(el, SIDEBAR_CLASS));
}

export function applyComments(hideComments: boolean): void {
  if (!hideComments) {
    unhideByClass(COMMENTS_CLASS);
    return;
  }
  queryAll(WATCH_PAGE.comments).forEach((el) => hide(el, COMMENTS_CLASS));
}
