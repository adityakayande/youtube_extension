// src/content/rules/homepage-redirect.ts
//
// Rather than trying to detect and hide every algorithmically recommended
// video on the home page (a losing game of whack-a-mole as YouTube adds new
// shelf types), we simply never let the user land on the home page at all:
// / redirects straight to /feed/subscriptions. This is the single biggest
// reliability win in the whole extension.

import { SUBSCRIPTIONS_PATH } from "@shared/constants";

const HOME_PATH_PATTERN = /^\/(index)?$/;

/** True if the current path is YouTube's home page ("/" or "/index"). */
export function isHomePage(pathname: string): boolean {
  return HOME_PATH_PATTERN.test(pathname);
}

/**
 * If Focus Mode + homepage redirect are enabled and we're on the home page,
 * replace the current history entry with the subscriptions feed. Uses
 * location.replace (not .href) so the home page never enters browser history —
 * pressing "back" won't bounce the user into the very feed we're hiding.
 */
export function redirectHomepageIfNeeded(enabled: boolean): boolean {
  if (!enabled) return false;
  if (!isHomePage(window.location.pathname)) return false;

  window.location.replace(`${window.location.origin}${SUBSCRIPTIONS_PATH}`);
  return true;
}
