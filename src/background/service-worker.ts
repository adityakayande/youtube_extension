// src/background/service-worker.ts
//
// MV3 service workers are event-driven and non-persistent: Chrome unloads
// this file between events and re-runs it from the top when the next one
// fires. That means no in-memory state survives between calls — everything
// that matters is read from chrome.storage on each event, never cached in a
// module-level variable that assumes it will persist.
//
// Responsibilities:
//   1. First install: write DEFAULT_SETTINGS so every context (popup,
//      content scripts) has a real, versioned value to read immediately.
//   2. Keyboard shortcut: flip focusModeEnabled in storage; every content
//      script picks the change up via chrome.storage.onChanged on its own.
//   3. Schedule: a recurring alarm checks whether "now" falls inside the
//      user's configured schedule window and flips focusModeEnabled to match.
//   4. Toolbar badge: a small always-visible ON/OFF indicator so the current
//      state is visible without opening the popup.

import { DEFAULT_SETTINGS, ScheduleSettings } from "@shared/types";
import { getSettings, saveSettings, updateSettings } from "@shared/storage";
import { ALARM_SCHEDULE_TICK, COMMAND_TOGGLE_FOCUS_MODE } from "@shared/constants";

const SCHEDULE_CHECK_PERIOD_MINUTES = 1;

async function updateBadge(): Promise<void> {
  const settings = await getSettings();
  await chrome.action.setBadgeText({ text: settings.focusModeEnabled ? "ON" : "" });
  await chrome.action.setBadgeBackgroundColor({ color: "#F5A623" });
}

/** True if the current local time/day falls inside the configured schedule window. */
export function isWithinSchedule(schedule: ScheduleSettings, now: Date): boolean {
  if (!schedule.enabled) return true; // schedule off => no time restriction
  if (schedule.days.length > 0 && !schedule.days.includes(now.getDay())) return false;

  const [startH, startM] = schedule.startTime.split(":").map(Number);
  const [endH, endM] = schedule.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (startMinutes === endMinutes) return true; // 24h window
  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }
  // Window wraps past midnight, e.g. 22:00 -> 06:00.
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

async function runScheduleTick(): Promise<void> {
  const settings = await getSettings();
  if (!settings.schedule.enabled) return;

  const shouldBeOn = isWithinSchedule(settings.schedule, new Date());
  if (shouldBeOn !== settings.focusModeEnabled) {
    await updateSettings({ focusModeEnabled: shouldBeOn });
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await saveSettings(DEFAULT_SETTINGS);
  }
  await chrome.alarms.create(ALARM_SCHEDULE_TICK, {
    periodInMinutes: SCHEDULE_CHECK_PERIOD_MINUTES,
  });
  await updateBadge();
});

chrome.runtime.onStartup.addListener(async () => {
  await chrome.alarms.create(ALARM_SCHEDULE_TICK, {
    periodInMinutes: SCHEDULE_CHECK_PERIOD_MINUTES,
  });
  await updateBadge();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_SCHEDULE_TICK) {
    runScheduleTick();
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === COMMAND_TOGGLE_FOCUS_MODE) {
    const settings = await getSettings();
    await updateSettings({ focusModeEnabled: !settings.focusModeEnabled });
  }
});

// Keep the badge in sync with settings changed from the popup, the schedule
// tick, or another synced device.
chrome.storage.onChanged.addListener(() => {
  updateBadge();
});
