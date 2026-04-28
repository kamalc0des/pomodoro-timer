/**
 * Dev simulation fixtures — preset progression states to visualize how the UI
 * responds at different stages of a user journey.
 *
 * Two access modes:
 *   1. Visual panel: navigate to `dev.html` (use `window.__sim.openPanel()`)
 *   2. Console:      `window.__sim.list()` / `__sim.load("kage")` / `__sim.reset()`
 */

import type { AppState, Progression, AchievementLogEntry } from "../types/state.js";
import { findAchievement, getRankInfo } from "./progression.js";
import { patchState, resetAppState } from "./storage.js";

export interface FixtureDef {
  name: string;
  label: string;
  description: string;
  pomodorosCompleted: number;
  totalFocusMinutes: number;
  streakDays: number;
  /** XP value — rank is computed from this */
  xp: number;
  /** Achievement IDs unlocked, in chronological order (oldest first) */
  achievements: string[];
}

const todayKey = () => new Date().toISOString().slice(0, 10);

/**
 * 7 fixtures spanning the full journey: from "Just installed" to "Has every ornament".
 */
export const FIXTURES: FixtureDef[] = [
  {
    name: "newbie",
    label: "🆕 Newbie",
    description: "Onboarding terminé, aucun pomodoro fait. Profil vierge.",
    pomodorosCompleted: 0,
    totalFocusMinutes: 0,
    streakDays: 0,
    xp: 0,
    achievements: [],
  },
  {
    name: "firstSession",
    label: "🍅 Première session",
    description: "1 cycle (4 pomodoros) terminé. Premières récompenses débloquées.",
    pomodorosCompleted: 4,
    totalFocusMinutes: 100,
    streakDays: 1,
    xp: 80,
    achievements: ["first_pomodoro", "first_cycle", "focus_60"],
  },
  {
    name: "oneWeek",
    label: "🔥 Une semaine",
    description: "Habitude installée — 25 pomodoros, 7 jours d'affilée. Rang Chūnin.",
    pomodorosCompleted: 25,
    totalFocusMinutes: 625,
    streakDays: 7,
    xp: 250,
    achievements: [
      "first_pomodoro",
      "first_cycle",
      "focus_60",
      "total_10",
      "streak_3",
      "total_25",
      "focus_300",
      "streak_7",
    ],
  },
  {
    name: "oneMonth",
    label: "🌀 Un mois",
    description: "Engagement réel — 100 pomodoros, streak 30 jours. Rang Jōnin.",
    pomodorosCompleted: 100,
    totalFocusMinutes: 2500,
    streakDays: 30,
    xp: 1100,
    achievements: [
      "first_pomodoro",
      "first_cycle",
      "focus_60",
      "total_10",
      "streak_3",
      "early_bird",
      "weekend_warrior",
      "pomodoro_5_day",
      "total_25",
      "focus_300",
      "streak_7",
      "total_50",
      "ranked_chunin",
      "streak_14",
      "focus_1500",
      "total_100",
      "streak_30",
      "ranked_jonin",
    ],
  },
  {
    name: "dedicated",
    label: "💪 Acharné",
    description: "250 pomodoros, 100h de focus, streak 45 jours. Rang Sannin.",
    pomodorosCompleted: 250,
    totalFocusMinutes: 6000,
    streakDays: 45,
    xp: 3300,
    achievements: [
      "first_pomodoro",
      "first_cycle",
      "focus_60",
      "total_10",
      "streak_3",
      "early_bird",
      "night_owl",
      "weekend_warrior",
      "pomodoro_5_day",
      "marathon_day",
      "total_25",
      "focus_300",
      "streak_7",
      "total_50",
      "ranked_chunin",
      "streak_14",
      "focus_1500",
      "total_100",
      "streak_30",
      "ranked_jonin",
      "total_200",
      "focus_6000",
      "eternal_mangekyou",
    ],
  },
  {
    name: "kage",
    label: "👑 Kage",
    description: "Rang max atteint. 500 pomodoros, 100h focus. Streak_60 manquant.",
    pomodorosCompleted: 500,
    totalFocusMinutes: 6500,
    streakDays: 50,
    xp: 5500,
    achievements: [
      "first_pomodoro",
      "first_cycle",
      "focus_60",
      "total_10",
      "streak_3",
      "early_bird",
      "night_owl",
      "weekend_warrior",
      "pomodoro_5_day",
      "marathon_day",
      "total_25",
      "focus_300",
      "streak_7",
      "total_50",
      "ranked_chunin",
      "streak_14",
      "focus_1500",
      "total_100",
      "streak_30",
      "ranked_jonin",
      "total_200",
      "focus_6000",
      "eternal_mangekyou",
      "total_500",
      "ranked_kage",
    ],
  },
  {
    name: "legend",
    label: "🌟 Légende",
    description: "Tous les succès débloqués, rang Kage maxé. The screenshot fixture.",
    pomodorosCompleted: 700,
    totalFocusMinutes: 8000,
    streakDays: 80,
    xp: 8000,
    achievements: ALL_ACHIEVEMENT_IDS(),
  },
];

function ALL_ACHIEVEMENT_IDS(): string[] {
  return [
    "first_pomodoro",
    "first_cycle",
    "focus_60",
    "total_10",
    "streak_3",
    "early_bird",
    "night_owl",
    "weekend_warrior",
    "pomodoro_5_day",
    "marathon_day",
    "total_25",
    "focus_300",
    "streak_7",
    "total_50",
    "ranked_chunin",
    "streak_14",
    "focus_1500",
    "total_100",
    "streak_30",
    "ranked_jonin",
    "total_200",
    "focus_6000",
    "eternal_mangekyou",
    "total_500",
    "streak_60",
    "ranked_kage",
  ];
}

/**
 * Build a plausible journal log: spread achievements over the recent past,
 * one entry every ~12h going backwards from now.
 */
function buildLog(achievementIds: string[]): AchievementLogEntry[] {
  const now = Date.now();
  const stepMs = 12 * 60 * 60 * 1000; // 12 hours
  return achievementIds.map((id, i) => {
    const a = findAchievement(id);
    return {
      id,
      at: now - (achievementIds.length - 1 - i) * stepMs,
      xp: a?.xpReward ?? 0,
    };
  });
}

export function fixtureToProgression(fx: FixtureDef): Progression {
  const rankInfo = getRankInfo(fx.xp);
  return {
    xp: fx.xp,
    pomodorosCompleted: fx.pomodorosCompleted,
    totalFocusMinutes: fx.totalFocusMinutes,
    streakDays: fx.streakDays,
    lastSessionDate: fx.streakDays > 0 ? todayKey() : "",
    achievements: [...fx.achievements],
    achievementsLog: buildLog(fx.achievements),
    rankIndex: rankInfo.rank.index,
  };
}

export async function loadFixture(name: string): Promise<AppState | null> {
  const fx = FIXTURES.find((f) => f.name === name);
  if (!fx) {
    console.warn(`[__sim] Unknown fixture "${name}". Run __sim.list() to see options.`);
    return null;
  }
  const progression = fixtureToProgression(fx);
  const dailyMissionStub = {
    date: todayKey(),
    target: 4,
    progress: Math.min(4, Math.floor(fx.pomodorosCompleted % 4)),
    completed: false,
  };
  const next = await patchState({
    progression,
    dailyMission: dailyMissionStub,
  });
  console.log(`[__sim] Loaded fixture "${name}" — rank ${getRankInfo(fx.xp).rank.name}, ${fx.achievements.length} achievements unlocked.`);
  return next;
}

export async function resetSim(): Promise<void> {
  await resetAppState();
  console.log("[__sim] State reset to defaults.");
}

export interface DevSimAPI {
  list(): { name: string; label: string; description: string }[];
  load(name: string): Promise<AppState | null>;
  reset(): Promise<void>;
  openPanel(): void;
  help(): void;
}

export function installDevConsole(): void {
  if (typeof window === "undefined") return;
  if (window.__sim) return; // already installed

  const api: DevSimAPI = {
    list: () =>
      FIXTURES.map((f) => ({
        name: f.name,
        label: f.label,
        description: f.description,
      })),
    load: loadFixture,
    reset: resetSim,
    openPanel: () => window.electronAPI?.navigate("dev.html"),
    help: () => {
      console.group("%c🥷 Pomodoro Minutor — Dev Sim", "color:#f66c2d;font-weight:bold");
      console.log("Available fixtures:");
      FIXTURES.forEach((f) => console.log(`  • ${f.name.padEnd(14)} — ${f.label} — ${f.description}`));
      console.log("\nCommands:");
      console.log("  __sim.list()         → list fixtures");
      console.log("  __sim.load('name')   → apply a fixture");
      console.log("  __sim.reset()        → wipe state to defaults");
      console.log("  __sim.openPanel()    → open visual dev.html panel");
      console.groupEnd();
    },
  };

  window.__sim = api;
  // Banner once at boot
  console.log(
    "%c🥷 Dev sim installed. Type %c__sim.help()%c for available fixtures.",
    "color:#f66c2d",
    "color:#f66c2d;font-weight:bold;background:#0a0e1a;padding:2px 6px;border-radius:3px",
    "color:#f66c2d",
  );
}
