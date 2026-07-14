// src/shared/types.ts
//
// Single source of truth for the shapes of data that flow between the
// popup, background service worker, and content script. Keeping these in
// one file means a change to the settings schema only needs to happen here.

/** Every individually toggleable behavior exposed in the popup. */
export interface FocusSettings {
  /** Master switch. When false, every other setting is inert. */
  focusModeEnabled: boolean;
  hideShorts: boolean;
  hideComments: boolean;
  hideRecommendations: boolean;
  hideSidebar: boolean;
  disableAutoplay: boolean;
  /** Redirect youtube.com/ -> youtube.com/feed/subscriptions when Focus Mode is on. */
  redirectHomepage: boolean;
  theme: Theme;
  schedule: ScheduleSettings;
}

export type Theme = "system" | "light" | "dark";

export interface ScheduleSettings {
  enabled: boolean;
  /** 24h "HH:MM" local time */
  startTime: string;
  endTime: string;
  /** 0 (Sun) - 6 (Sat). Empty array = every day. */
  days: number[];
}

/** The complete persisted shape in chrome.storage.sync, versioned for future migrations. */
export interface StoredData {
  schemaVersion: number;
  settings: FocusSettings;
}

/** Messages sent between popup/background/content via chrome.runtime messaging. */
export type ExtensionMessage =
  | { type: "SETTINGS_UPDATED"; settings: FocusSettings }
  | { type: "GET_SETTINGS" }
  | { type: "GET_SETTINGS_RESPONSE"; settings: FocusSettings }
  | { type: "TOGGLE_FOCUS_MODE" }
  | { type: "SCHEDULE_TICK" };

export const DEFAULT_SETTINGS: FocusSettings = {
  focusModeEnabled: true,
  hideShorts: true,
  hideComments: false,
  hideRecommendations: true,
  hideSidebar: true,
  disableAutoplay: true,
  redirectHomepage: true,
  theme: "system",
  schedule: {
    enabled: false,
    startTime: "09:00",
    endTime: "17:00",
    days: [],
  },
};

export const SCHEMA_VERSION = 1;
