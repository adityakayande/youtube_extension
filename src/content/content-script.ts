// src/content/content-script.ts
//
// Entry point for the content script (runs at document_start on every
// youtube.com page, per manifest.json). Responsibilities:
//   1. Load settings from storage.
//   2. Apply every rule once, immediately.
//   3. Re-apply on every relevant DOM mutation and SPA navigation.
//   4. React live to settings changes made from the popup.
//
// Deliberately thin: all actual hiding logic lives in ./rules/*, this file
// only sequences it. See selectors.ts for the single place YouTube-markup
// knowledge lives, and README.md "Architecture" for the full data-flow.

import { FocusSettings } from "@shared/types";
import { getSettings, onSettingsChanged } from "@shared/storage";
import { redirectHomepageIfNeeded } from "./rules/homepage-redirect";
import { applyHideShorts } from "./rules/hide-shorts";
import { applyHideRecommendations } from "./rules/hide-recommendations";
import { applyHideNavigation } from "./rules/hide-navigation";
import { applyWatchSidebar, applyComments } from "./rules/watch-page";
import { enforceAutoplayOff } from "./rules/autoplay";
import { startObserving } from "./observer-manager";

let currentSettings: FocusSettings | undefined;

/** Runs every rule against the current DOM, gated by both the master switch and its own flag. */
function applyAll(settings: FocusSettings): void {
  const on = settings.focusModeEnabled;

  // Redirect first: if it fires, it navigates away immediately and nothing
  // else in this pass matters.
  const redirected = redirectHomepageIfNeeded(on && settings.redirectHomepage);
  if (redirected) return;

  applyHideShorts(on && settings.hideShorts);
  applyHideRecommendations(on && settings.hideRecommendations);
  applyHideNavigation(on);
  applyWatchSidebar(on && settings.hideSidebar);
  applyComments(on && settings.hideComments);
  enforceAutoplayOff(on && settings.disableAutoplay);

  // Exposed for CSS that wants to key off Focus Mode state generally
  // (e.g. a subtle "focus mode active" affordance) without needing JS.
  document.documentElement.setAttribute("data-yfm-focus-mode", on ? "on" : "off");
}

function bootstrap(): void {
  getSettings().then((settings) => {
    currentSettings = settings;
    applyAll(settings);
    startObserving(() => {
      if (currentSettings) applyAll(currentSettings);
    });
  });

  onSettingsChanged((settings) => {
    currentSettings = settings;
    applyAll(settings);
  });
}

bootstrap();
