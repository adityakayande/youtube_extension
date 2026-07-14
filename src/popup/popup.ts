// src/popup/popup.ts
//
// The popup is a thin view over FocusSettings: on open it reads the current
// value from storage and paints every control to match, then each control's
// event listener writes a patch straight back to storage. It never keeps its
// own source of truth — chrome.storage.sync is the only one, which is what
// lets the popup, background worker, and every open YouTube tab all agree.

import { FocusSettings, Theme } from "@shared/types";
import { getSettings, onSettingsChanged, resetSettings, updateSettings } from "@shared/storage";

const el = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

const appRoot = document.querySelector<HTMLElement>(".app")!;
const apertureBlades = el<SVGGElement & HTMLElement>("apertureBlades");
const statusLabel = el<HTMLParagraphElement>("statusLabel");
const featureGroup = el<HTMLElement>("featureGroup");

const focusModeEnabledInput = el<HTMLInputElement>("focusModeEnabled");
const hideShortsInput = el<HTMLInputElement>("hideShorts");
const hideRecommendationsInput = el<HTMLInputElement>("hideRecommendations");
const hideSidebarInput = el<HTMLInputElement>("hideSidebar");
const hideCommentsInput = el<HTMLInputElement>("hideComments");
const disableAutoplayInput = el<HTMLInputElement>("disableAutoplay");

const scheduleEnabledInput = el<HTMLInputElement>("scheduleEnabled");
const scheduleDetails = el<HTMLElement>("scheduleDetails");
const scheduleStartInput = el<HTMLInputElement>("scheduleStart");
const scheduleEndInput = el<HTMLInputElement>("scheduleEnd");
const scheduleDaysContainer = el<HTMLElement>("scheduleDays");

const themeSegmented = el<HTMLElement>("themeSegmented");
const shortcutDisplay = el<HTMLElement>("shortcutDisplay");
const changeShortcutBtn = el<HTMLButtonElement>("changeShortcutBtn");
const resetBtn = el<HTMLButtonElement>("resetBtn");

let isRendering = false; // guards against event listeners firing while we paint programmatically

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function render(settings: FocusSettings): void {
  isRendering = true;

  appRoot.dataset.resolvedTheme = resolveTheme(settings.theme);

  focusModeEnabledInput.checked = settings.focusModeEnabled;
  apertureBlades.classList.toggle("is-closed", settings.focusModeEnabled);
  apertureBlades.classList.toggle("is-open", !settings.focusModeEnabled);
  statusLabel.textContent = settings.focusModeEnabled
    ? "Active — only your subscriptions"
    : "Off — YouTube behaves normally";
  featureGroup.classList.toggle("is-dimmed", !settings.focusModeEnabled);

  hideShortsInput.checked = settings.hideShorts;
  hideRecommendationsInput.checked = settings.hideRecommendations;
  hideSidebarInput.checked = settings.hideSidebar;
  hideCommentsInput.checked = settings.hideComments;
  disableAutoplayInput.checked = settings.disableAutoplay;

  scheduleEnabledInput.checked = settings.schedule.enabled;
  scheduleDetails.style.display = settings.schedule.enabled ? "block" : "none";
  scheduleStartInput.value = settings.schedule.startTime;
  scheduleEndInput.value = settings.schedule.endTime;
  scheduleDaysContainer.querySelectorAll<HTMLButtonElement>(".day").forEach((btn) => {
    const day = Number(btn.dataset.day);
    btn.classList.toggle("is-active", settings.schedule.days.includes(day));
  });

  themeSegmented.querySelectorAll<HTMLButtonElement>(".segmented__option").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.themeOption === settings.theme);
  });

  isRendering = false;
}

function bindToggle(input: HTMLInputElement, key: keyof FocusSettings): void {
  input.addEventListener("change", async () => {
    if (isRendering) return;
    const updated = await updateSettings({ [key]: input.checked } as Partial<FocusSettings>);
    render(updated);
  });
}

async function init(): Promise<void> {
  const settings = await getSettings();
  render(settings);

  bindToggle(focusModeEnabledInput, "focusModeEnabled");
  bindToggle(hideShortsInput, "hideShorts");
  bindToggle(hideRecommendationsInput, "hideRecommendations");
  bindToggle(hideSidebarInput, "hideSidebar");
  bindToggle(hideCommentsInput, "hideComments");
  bindToggle(disableAutoplayInput, "disableAutoplay");

  scheduleEnabledInput.addEventListener("change", async () => {
    if (isRendering) return;
    const current = await getSettings();
    const updated = await updateSettings({
      schedule: { ...current.schedule, enabled: scheduleEnabledInput.checked },
    });
    render(updated);
  });

  const commitScheduleTimes = async () => {
    if (isRendering) return;
    const current = await getSettings();
    const updated = await updateSettings({
      schedule: {
        ...current.schedule,
        startTime: scheduleStartInput.value || current.schedule.startTime,
        endTime: scheduleEndInput.value || current.schedule.endTime,
      },
    });
    render(updated);
  };
  scheduleStartInput.addEventListener("change", commitScheduleTimes);
  scheduleEndInput.addEventListener("change", commitScheduleTimes);

  scheduleDaysContainer.querySelectorAll<HTMLButtonElement>(".day").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const day = Number(btn.dataset.day);
      const current = await getSettings();
      const days = current.schedule.days.includes(day)
        ? current.schedule.days.filter((d) => d !== day)
        : [...current.schedule.days, day];
      const updated = await updateSettings({ schedule: { ...current.schedule, days } });
      render(updated);
    });
  });

  themeSegmented.querySelectorAll<HTMLButtonElement>(".segmented__option").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const theme = btn.dataset.themeOption as Theme;
      const updated = await updateSettings({ theme });
      render(updated);
    });
  });

  resetBtn.addEventListener("click", async () => {
    const confirmed = window.confirm("Reset all Focus Mode settings to their defaults?");
    if (!confirmed) return;
    const updated = await resetSettings();
    render(updated);
  });

  changeShortcutBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  });

  chrome.commands.getAll((commands) => {
    const toggleCommand = commands.find((c) => c.name === "toggle-focus-mode");
    shortcutDisplay.textContent = toggleCommand?.shortcut || "Not set";
  });

  // Keep the popup in sync if settings change while it's open (e.g. the
  // keyboard shortcut was pressed, or a schedule tick just fired).
  onSettingsChanged(render);

  // If the user has the popup open across a system theme change while on "system".
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", async () => render(await getSettings()));
}

init();
