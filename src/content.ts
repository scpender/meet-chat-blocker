import { CHAT_ANNOUNCEMENT, CHAT_BUTTON, LIVE_ANNOUNCER } from './selectors';
import { isEnabled, onEnabledChange } from './settings';

/**
 * Static hiding (toasts, unread dot, greyed-out button) lives in content.css and
 * is switched on by this class, so it applies before Meet renders anything.
 * This script handles what CSS can't: blocking interaction with the chat button,
 * locking the chat panel if it is open, and silencing screen-reader alerts.
 */
const ROOT_CLASS = 'mcb-on';
const OVERLAY_CLASS = 'mcb-overlay';
const LOCKED_ATTR = 'data-mcb-locked';
const PANEL_ATTR = 'data-mcb-panel';

let enabled = false;

function chatButton(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(CHAT_BUTTON);
}

/** The side panel <aside> that currently shows chat, or null if chat is closed. */
function openChatPanel(button: HTMLButtonElement | null): HTMLElement | null {
  if (button?.getAttribute('aria-expanded') !== 'true') return null;
  const id = button.getAttribute('aria-controls');
  const container = id ? document.getElementById(id) : null;
  return container?.querySelector<HTMLElement>('aside') ?? container;
}

function lockButton(button: HTMLButtonElement | null): void {
  if (!button || button.hasAttribute(LOCKED_ATTR)) return;
  button.setAttribute(LOCKED_ATTR, button.getAttribute('tabindex') ?? '');
  button.setAttribute('tabindex', '-1');
  button.setAttribute('aria-disabled', 'true');
  button.title = 'Chat is disabled by Meet Chat Blocker';
}

function unlockButton(): void {
  document.querySelectorAll<HTMLElement>(`[${LOCKED_ATTR}]`).forEach((el) => {
    const tabindex = el.getAttribute(LOCKED_ATTR);
    if (tabindex) el.setAttribute('tabindex', tabindex);
    else el.removeAttribute('tabindex');
    el.removeAttribute(LOCKED_ATTR);
    el.removeAttribute('aria-disabled');
    el.removeAttribute('title');
  });
}

function buildOverlay(button: HTMLButtonElement): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = OVERLAY_CLASS;
  overlay.setAttribute('role', 'note');

  const label = document.createElement('p');
  label.textContent = 'Chat is disabled';

  // Programmatic clicks aren't trusted, so they pass the interaction guard.
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close panel';
  close.addEventListener('click', () => button.click());

  overlay.append(label, close);
  return overlay;
}

function lockPanel(panel: HTMLElement, button: HTMLButtonElement): void {
  panel.setAttribute(PANEL_ATTR, '');
  for (const child of Array.from(panel.children)) {
    if (!child.classList.contains(OVERLAY_CLASS)) (child as HTMLElement).inert = true;
  }
  if (!panel.querySelector(`:scope > .${OVERLAY_CLASS}`)) panel.append(buildOverlay(button));
}

function unlockPanels(except?: HTMLElement | null): void {
  document.querySelectorAll<HTMLElement>(`[${PANEL_ATTR}]`).forEach((panel) => {
    if (panel === except) return;
    panel.removeAttribute(PANEL_ATTR);
    panel.querySelector(`:scope > .${OVERLAY_CLASS}`)?.remove();
    for (const child of Array.from(panel.children)) (child as HTMLElement).inert = false;
  });
}

function silenceAnnouncements(): void {
  document.querySelectorAll<HTMLElement>(LIVE_ANNOUNCER).forEach((el) => {
    if (CHAT_ANNOUNCEMENT.test(el.textContent ?? '')) el.textContent = '';
  });
}

function sync(): void {
  if (!enabled) return;
  const button = chatButton();
  lockButton(button);
  const panel = openChatPanel(button);
  unlockPanels(panel);
  if (panel && button) lockPanel(panel, button);
  silenceAnnouncements();
}

let scheduled = false;
function scheduleSync(): void {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    sync();
  });
}

/** Swallow real user input aimed at the chat button before Meet's handlers see it. */
function guardEvent(event: Event): void {
  if (!enabled || !event.isTrusted) return;
  const target = event.target as Element | null;
  if (!target?.closest?.(CHAT_BUTTON)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}

/** Meet's "toggle chat" shortcut: Cmd+Ctrl+C on macOS, Ctrl+Alt+C elsewhere. */
function guardShortcut(event: KeyboardEvent): void {
  if (!enabled || event.code !== 'KeyC' || !event.ctrlKey) return;
  if (!event.metaKey && !event.altKey) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}

function apply(next: boolean): void {
  enabled = next;
  document.documentElement.classList.toggle(ROOT_CLASS, enabled);
  if (enabled) {
    sync();
  } else {
    unlockButton();
    unlockPanels();
  }
}

for (const type of ['click', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'keydown', 'keyup']) {
  window.addEventListener(type, guardEvent, true);
}
window.addEventListener('keydown', guardShortcut, true);

new MutationObserver(scheduleSync).observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
  attributeFilter: ['aria-expanded', 'aria-controls'],
});

// Default on at document_start so nothing flashes before storage answers.
apply(true);
isEnabled().then(apply);
onEnabledChange(apply);
