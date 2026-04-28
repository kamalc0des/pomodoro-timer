import { app } from "electron";
import Store from "electron-store";
import type { AppState, Lang, StatePatch } from "../src/types/state";

const defaults: AppState = {
  profile: {
    pseudo: "",
    avatar: "",
    onboarded: false,
    createdAt: 0,
  },
  preferences: {
    duration: 25,
    breakDuration: 4,
    cycles: 4,
    theme: "retro-teal",
    notificationsEnabled: true,
    language: "en",
    mode: "pomodoro",
  },
  progression: {
    xp: 0,
    pomodorosCompleted: 0,
    totalFocusMinutes: 0,
    streakDays: 0,
    lastSessionDate: "",
    achievements: [],
    achievementsLog: [],
    rankIndex: 0,
  },
  dailyMission: {
    date: "",
    target: 0,
    progress: 0,
    completed: false,
  },
};

const store = new Store<AppState & { _meta?: { languageInitialized?: boolean } }>({
  name: "config",
  defaults,
});

export function initFromOSLocale(): void {
  if (store.get("_meta")?.languageInitialized) return;
  const locale = (app.getLocale() ?? "").toLowerCase();
  const detected: Lang = locale.startsWith("fr") ? "fr" : "en";
  store.set("preferences", { ...store.get("preferences"), language: detected });
  store.set("_meta", { languageInitialized: true });
}

export function getState(): AppState {
  return {
    profile: store.get("profile"),
    preferences: store.get("preferences"),
    progression: store.get("progression"),
    dailyMission: store.get("dailyMission"),
  };
}

export function updateState(patch: StatePatch): AppState {
  if (patch.profile) {
    store.set("profile", { ...store.get("profile"), ...patch.profile });
  }
  if (patch.preferences) {
    store.set("preferences", { ...store.get("preferences"), ...patch.preferences });
  }
  if (patch.progression) {
    store.set("progression", { ...store.get("progression"), ...patch.progression });
  }
  if (patch.dailyMission) {
    store.set("dailyMission", { ...store.get("dailyMission"), ...patch.dailyMission });
  }
  return getState();
}

export function resetState(): AppState {
  store.clear();
  return getState();
}
