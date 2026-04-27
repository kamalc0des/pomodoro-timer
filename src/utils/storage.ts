import type { AppState, Lang, StatePatch } from "../types/state.js";
import { applyI18n, detectInitialLang, setLang } from "./i18n.js";

let cache: AppState | null = null;

export async function loadState(force = false): Promise<AppState> {
  if (!cache || force) {
    cache = await window.electronAPI.store.get();
    await migrateFromLocalStorageIfNeeded(cache);
    await ensureLanguage(cache);
  }
  setLang(cache.preferences.language);
  return cache;
}

export async function patchState(patch: StatePatch): Promise<AppState> {
  cache = await window.electronAPI.store.update(patch);
  if (patch.preferences?.language) {
    setLang(cache.preferences.language);
    applyI18n();
  }
  return cache;
}

export async function resetAppState(): Promise<AppState> {
  cache = await window.electronAPI.store.reset();
  return cache;
}

async function ensureLanguage(state: AppState): Promise<void> {
  const stored = state.preferences.language as Lang | undefined;
  if (stored === "en" || stored === "fr") return;
  const detected = detectInitialLang();
  cache = await window.electronAPI.store.update({
    preferences: { language: detected },
  });
}

async function migrateFromLocalStorageIfNeeded(state: AppState): Promise<void> {
  if (state.profile.pseudo || state.profile.onboarded) return;

  const lsPseudo = localStorage.getItem("pseudo");
  const lsAvatar = localStorage.getItem("avatar");
  if (!lsPseudo || !lsAvatar) return;

  const lsTheme = localStorage.getItem("theme") ?? state.preferences.theme;
  const lsDuration = parseInt(localStorage.getItem("duration") ?? "", 10);
  const lsBreak = parseFloat(localStorage.getItem("breakDuration") ?? "");
  const lsCycles = parseInt(localStorage.getItem("cycles") ?? "", 10);

  cache = await window.electronAPI.store.update({
    profile: {
      pseudo: lsPseudo,
      avatar: lsAvatar,
      onboarded: true,
      createdAt: Date.now(),
    },
    preferences: {
      duration: Number.isFinite(lsDuration) && lsDuration > 0 ? lsDuration : state.preferences.duration,
      breakDuration: Number.isFinite(lsBreak) && lsBreak > 0 ? lsBreak : state.preferences.breakDuration,
      cycles: Number.isFinite(lsCycles) && lsCycles > 0 ? lsCycles : state.preferences.cycles,
      theme: lsTheme,
    },
  });

  localStorage.clear();
}
