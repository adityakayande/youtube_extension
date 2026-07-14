// src/shared/constants.ts
//
// Centralized string constants. Avoids "magic string" typos across files
// that would otherwise only surface as silent runtime failures.

export const STORAGE_KEY = "focusModeData";

export const ALARM_SCHEDULE_TICK = "focus-mode-schedule-tick";

export const COMMAND_TOGGLE_FOCUS_MODE = "toggle-focus-mode";

/** Attribute set on <html> by the content script; all CSS hiding rules key off this. */
export const ROOT_STATE_ATTR = "data-yfm-state";

/** Individual per-feature attributes, so CSS can target one feature without affecting others. */
export const FEATURE_ATTRS = {
  shorts: "data-yfm-hide-shorts",
  comments: "data-yfm-hide-comments",
  recommendations: "data-yfm-hide-recommendations",
  sidebar: "data-yfm-hide-sidebar",
} as const;

export const YOUTUBE_HOME_PATTERNS = [
  "https://www.youtube.com/",
  "https://youtube.com/",
  "https://m.youtube.com/",
];

export const SUBSCRIPTIONS_PATH = "/feed/subscriptions";

/**
 * CSS classes applied to elements the content script decides to hide, one per
 * independently-toggleable feature. Using a separate class per feature (rather
 * than one shared "hidden" class) means turning a single feature off only
 * reveals the elements *that feature* hid — it can't accidentally un-hide
 * something a different, still-enabled rule is responsible for.
 *
 * Each key here has a matching rule in focus-mode.css; the two files must be
 * kept in sync (a comment in focus-mode.css points back to this file).
 */
export const HIDE_CLASSES = {
  shorts: "yfm-hidden-shorts",
  recommendations: "yfm-hidden-recommendations",
  navigation: "yfm-hidden-navigation",
  watchSidebar: "yfm-hidden-watch-sidebar",
  comments: "yfm-hidden-comments",
} as const;

export type HideClassName = (typeof HIDE_CLASSES)[keyof typeof HIDE_CLASSES];

