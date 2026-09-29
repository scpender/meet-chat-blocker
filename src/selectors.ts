/**
 * Google Meet DOM hooks, discovered by driving a live meeting with Playwright
 * (two signed-in accounts, one sending chat to the other).
 *
 * Meet's class names are obfuscated and rotate between releases, so these rely
 * on attributes that carry meaning (data-*, aria-*, jsname) wherever possible.
 * If Meet changes its UI, this is the only file that should need updating.
 */

/** The "Chat with everyone" toolbar button. data-panel-id is language-independent. */
export const CHAT_BUTTON = 'button[data-panel-id="2"]';

/**
 * Wrapper around the chat button. Its children are the tooltip wrapper (which
 * holds the button) and the unread "new message" dot, which is a sibling div.
 */
export const CHAT_BUTTON_WRAPPER = `div:has(> span[data-is-tooltip-wrapper] > ${CHAT_BUTTON})`;

/** Container Meet creates for each incoming-message popup (sender, text, reply arrow). */
export const CHAT_TOAST = '[jsname="JDWQFb"]';

/** Off-screen aria-live region Meet uses for screen-reader announcements. */
export const LIVE_ANNOUNCER = '[data-mdc-dom-announce]';

/** Announcement text for a chat message, e.g. "Alex says in chat: hello". */
export const CHAT_ANNOUNCEMENT = /\bsays in chat\b/i;
