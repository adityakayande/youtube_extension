// src/shared/storage.ts
//
// Thin, typed wrapper around chrome.storage.sync. All reads/writes to
// persisted settings should go through here so schema migrations and
// fallbacks to defaults live in exactly one place.

import { DEFAULT_SETTINGS, FocusSettings, SCHEMA_VERSION, StoredData } from "./types";
import { STORAGE_KEY } from "./constants";

/** Merge stored settings over defaults so newly-added fields are never undefined. */
function withDefaults(partial: Partial<FocusSettings> | undefined): FocusSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...partial,
    schedule: { ...DEFAULT_SETTINGS.schedule, ...partial?.schedule },
  };
}

export async function getSettings(): Promise<FocusSettings> {
  const result = await chrome.storage.sync.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY] as StoredData | undefined;
  if (!stored) return DEFAULT_SETTINGS;
  return withDefaults(stored.settings);
}

export async function saveSettings(settings: FocusSettings): Promise<void> {
  const data: StoredData = { schemaVersion: SCHEMA_VERSION, settings };
  await chrome.storage.sync.set({ [STORAGE_KEY]: data });
}

export async function updateSettings(
  patch: Partial<FocusSettings>
): Promise<FocusSettings> {
  const current = await getSettings();
  const next = withDefaults({ ...current, ...patch });
  await saveSettings(next);
  return next;
}

export async function resetSettings(): Promise<FocusSettings> {
  await saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

/** Subscribe to live changes (e.g. content script reacting to popup edits, or sync across devices). */
export function onSettingsChanged(
  callback: (settings: FocusSettings) => void
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: chrome.storage.AreaName
  ) => {
    if (areaName !== "sync") return;
    const change = changes[STORAGE_KEY];
    if (!change) return;
    const stored = change.newValue as StoredData | undefined;
    callback(withDefaults(stored?.settings));
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
