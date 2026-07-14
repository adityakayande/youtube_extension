// src/content/rules/autoplay.ts
//
// YouTube's autoplay-next-video toggle lives inside the player controls and
// is re-inserted into the DOM every time a new video/player loads, so "turn
// it off once" isn't enough — this rule re-checks and re-clicks it on every
// scan pass. We interact with the real toggle element (a synthetic click)
// rather than trying to set an internal player property or cookie, since the
// visible toggle is YouTube's own supported on/off switch and stays correct
// even if their internal autoplay implementation changes.

import { WATCH_PAGE } from "../selectors";
import { queryAll, simulateClick } from "../dom-utils";

export function enforceAutoplayOff(enabled: boolean): void {
  if (!enabled) return;

  queryAll(WATCH_PAGE.autonavToggle).forEach((toggle) => {
    const isOn = toggle.getAttribute("aria-checked") === "true";
    if (isOn) {
      simulateClick(toggle);
    }
  });
}
