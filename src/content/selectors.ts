// src/content/selectors.ts
//
// ============================================================================
// THE ONE FILE TO EDIT WHEN YOUTUBE CHANGES ITS HTML
// ============================================================================
// Every CSS selector, attribute name, and URL pattern the extension relies on
// lives here and nowhere else. Rule modules (src/content/rules/*.ts) import
// from this file instead of hard-coding selectors, so a YouTube markup change
// only ever requires an edit in one place.
//
// Two matching strategies are used, and preferred in this order:
//   1. Structural: custom element tag names (e.g. <ytd-rich-shelf-renderer>)
//      and stable attributes/hrefs. These survive YouTube's frequent CSS
//      class-name churn and, unlike text content, work in every UI language.
//   2. Text-based: matching a label like "Shorts" or "Trending". Used only as
//      a fallback, and only for English — YouTube ships 100+ locales, so text
//      matching is inherently the least reliable option and should be
//      avoided where a structural match exists.
//
// When YouTube changes something and a rule stops working:
//   1. Open the page in Chrome, right-click the element, "Inspect".
//   2. Find the closest custom element (tag names containing a dash, e.g.
//      <ytd-...-renderer>) or a stable-looking attribute/href.
//   3. Update the relevant selector below. No other file should need changes.
// ============================================================================

/** Elements that make up YouTube's algorithmic home-feed grid. */
export const HOME_RECOMMENDATIONS = [
  "ytd-rich-grid-renderer", // the main home page video grid
  "ytd-rich-section-renderer", // "For you" / topic shelves on home
].join(", ");

/** Recommendation shelves that can appear outside the home page (search, channel pages). */
export const RECOMMENDATION_SHELVES = [
  "ytd-shelf-renderer", // generic horizontal shelf ("People also watched", etc.)
  'ytd-shelf-renderer[card-mode-brand="1"]',
  "ytd-reel-shelf-renderer", // Shorts shelf (also caught by SHORTS_SHELVES below)
  "ytd-horizontal-card-list-renderer",
].join(", ");

/** Everything Shorts-related, across every surface listed in the spec. */
export const SHORTS = {
  /** Shelf renderers used specifically for Shorts carousels. */
  shelves: "ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts]",
  /** Individual Shorts items inside a shelf or grid. */
  items: "ytd-reel-item-renderer, ytd-reel-video-renderer",
  /** The "Shorts" entry in the left guide (sidebar) and bottom mobile nav. */
  guideEntryHrefPattern: /^\/shorts(\/|$)/,
  /** The "Shorts" tab on a channel page. */
  channelTabHrefPattern: /\/shorts(\/|$|\?)/,
  /** Thumbnail badge YouTube stamps on Shorts inside normal video/grid renderers. */
  thumbnailOverlaySelector: 'ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]',
  /** Parent renderer to remove entirely when it contains a Shorts thumbnail badge. */
  parentRendererSelector: "ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer",
} as const;

/** Left-hand guide (hamburger sidebar) entries. */
export const GUIDE = {
  /** Every clickable row in the sidebar, mini or expanded. */
  entries: "ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer",
  /** The link inside a guide entry, whose href is the most locale-proof signal available. */
  entryLink: "a#endpoint, a.yt-simple-endpoint",
  /** The text label, used only as a fallback for entries with no useful href. */
  entryLabel: "yt-formatted-string, .title, .item-title",
};

/** URL path fragments identifying guide sections to hide. Matched against the entry's href. */
export const NAV_PATHS_TO_HIDE: RegExp[] = [
  /^\/feed\/explore/,
  /^\/feed\/trending/,
  /^\/gaming/,
  /^\/feed\/storefront/, // Shopping
  /^\/podcasts/,
  /^\/movies/,
  /^\/feed\/live/,
  /^\/news/,
  /^\/sports/,
  /^\/feed\/fashion/,
  /music\.youtube\.com/,
];

/** English-label fallback, used only when an entry has no href to test (rare). */
export const NAV_LABELS_TO_HIDE = [
  "explore",
  "trending",
  "shopping",
  "music",
  "movies & tv",
  "movies",
  "live",
  "gaming",
  "news",
  "sports",
  "fashion & beauty",
  "learning",
  "podcasts",
];

/** Guide sections that must always remain visible, even if a future YouTube label overlaps
 * with a NAV_LABELS_TO_HIDE entry. Checked first, before any hide rule. */
export const NAV_PATHS_TO_KEEP: RegExp[] = [
  /^\/feed\/subscriptions/,
  /^\/playlist/,
  /^\/feed\/library/,
  /^\/feed\/history/,
  /^\/feed\/watch_later/,
  /^\/channel\//,
  /^\/@/, // handle-style channel URLs
  /^\/c\//,
];

/** Watch-page (video player page) elements. */
export const WATCH_PAGE = {
  /** "Up next" / related videos column next to the player. */
  relatedColumn: "#related, ytd-watch-next-secondary-results-renderer",
  /** In-player end screen overlay with suggested-video tiles. */
  endScreen: ".ytp-endscreen-content, .html5-endscreen",
  /** In-player "i" cards and teasers that pop up during playback. */
  playerCards: ".ytp-ce-element, .ytp-cards-teaser, .ytp-cards-button",
  /** Comments section container. */
  comments: "ytd-comments#comments, #comments",
  /** The autoplay toggle switch built into the player controls. */
  autonavToggle: ".ytp-autonav-toggle-button",
  /** Miniplayer / floating suggestion surfaces. */
  floatingSuggestions: "ytd-mealbar-promo-renderer, ytd-popup-container tp-yt-paper-dialog #items",
};

/** Search results page. */
export const SEARCH_PAGE = {
  /** Container for a single result row/card — used to test for a nested Shorts badge. */
  resultItem: "ytd-video-renderer",
};
