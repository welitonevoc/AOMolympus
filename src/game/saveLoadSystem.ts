/**
 * Single source of truth for Match Save/Load persistence in localStorage.
 * Fixes the legacy key mismatch between TitleScreen ('aom_saved_match') and Engine ('aom_modern_save_v1').
 */

export const MATCH_SAVE_KEY = 'aom_modern_save_v1';
const LEGACY_MATCH_SAVE_KEY = 'aom_saved_match';

export function hasSavedMatchInStorage(): boolean {
  try {
    if (localStorage.getItem(MATCH_SAVE_KEY)) return true;
    const legacy = localStorage.getItem(LEGACY_MATCH_SAVE_KEY);
    if (legacy) {
      localStorage.setItem(MATCH_SAVE_KEY, legacy);
      localStorage.removeItem(LEGACY_MATCH_SAVE_KEY);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function writeSavedMatchToStorage(payload: unknown): boolean {
  try {
    localStorage.setItem(MATCH_SAVE_KEY, JSON.stringify(payload));
    localStorage.removeItem(LEGACY_MATCH_SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function readSavedMatchFromStorage<T = Record<string, unknown>>(): T | null {
  try {
    const raw = localStorage.getItem(MATCH_SAVE_KEY) || localStorage.getItem(LEGACY_MATCH_SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as T;
    if (!localStorage.getItem(MATCH_SAVE_KEY)) {
      localStorage.setItem(MATCH_SAVE_KEY, raw);
      localStorage.removeItem(LEGACY_MATCH_SAVE_KEY);
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSavedMatchFromStorage(): void {
  try {
    localStorage.removeItem(MATCH_SAVE_KEY);
    localStorage.removeItem(LEGACY_MATCH_SAVE_KEY);
  } catch {
    // ignore storage errors
  }
}
