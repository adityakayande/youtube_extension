// src/shared/messaging.ts
//
// Small typed wrapper around chrome.runtime messaging so callers get
// autocomplete/type-checking instead of passing raw `any` objects around.

import { ExtensionMessage } from "./types";

/** Send a message and, if the receiving end responds, get a typed reply back. */
export function sendMessage<T extends ExtensionMessage = ExtensionMessage>(
  message: ExtensionMessage
): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      // Swallow "no receiver" errors — content scripts on non-YouTube tabs,
      // or a popup that isn't open, simply won't respond, which is fine.
      if (chrome.runtime.lastError) {
        resolve(undefined);
        return;
      }
      resolve(response as T | undefined);
    });
  });
}

/** Send a message to a specific tab (used by the background worker -> content script). */
export function sendMessageToTab<T extends ExtensionMessage = ExtensionMessage>(
  tabId: number,
  message: ExtensionMessage
): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve(undefined);
        return;
      }
      resolve(response as T | undefined);
    });
  });
}

export function onMessage(
  handler: (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: ExtensionMessage) => void
  ) => boolean | void
): void {
  chrome.runtime.onMessage.addListener(handler);
}
