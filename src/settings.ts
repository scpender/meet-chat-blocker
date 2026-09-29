export const ENABLED_KEY = 'enabled';

/** Blocking is on unless the user has switched it off in the popup. */
export async function isEnabled(): Promise<boolean> {
  if (typeof chrome === 'undefined' || !chrome.storage?.sync) return true;
  const stored = await chrome.storage.sync.get(ENABLED_KEY);
  return stored[ENABLED_KEY] !== false;
}

export function setEnabled(enabled: boolean): Promise<void> {
  return chrome.storage.sync.set({ [ENABLED_KEY]: enabled });
}

export function onEnabledChange(callback: (enabled: boolean) => void): void {
  if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) return;
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && ENABLED_KEY in changes) callback(changes[ENABLED_KEY].newValue !== false);
  });
}
