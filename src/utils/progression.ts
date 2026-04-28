import type { AppState, Progression, DailyMission, StatePatch } from "../types/state.js";

export interface Rank {
  index: number;
  name: string;
  color: string;
  gradient: string;
  threshold: number;
  emoji: string;
  /** Lucide icon name (kebab-case, e.g. "graduation-cap") */
  lucideIcon: string;
  iconPath?: string;
}

export const RANKS: Rank[] = [
  { index: 0, name: "Académie",     color: "#9ca3af", gradient: "from-gray-500 to-gray-300",       threshold: 0,    emoji: "🎓", lucideIcon: "graduation-cap" },
  { index: 1, name: "Genin",        color: "#3b82f6", gradient: "from-blue-600 to-blue-400",       threshold: 50,   emoji: "🥷", lucideIcon: "swords" },
  { index: 2, name: "Chūnin",       color: "#10b981", gradient: "from-emerald-600 to-emerald-400", threshold: 150,  emoji: "🍃", lucideIcon: "leaf" },
  { index: 3, name: "Jōnin spécial",color: "#a855f7", gradient: "from-purple-600 to-purple-400",   threshold: 400,  emoji: "✨", lucideIcon: "sparkles" },
  { index: 4, name: "Jōnin",        color: "#f97316", gradient: "from-orange-600 to-orange-400",   threshold: 900,  emoji: "🔥", lucideIcon: "flame" },
  { index: 5, name: "ANBU",         color: "#dc2626", gradient: "from-red-700 to-red-500",         threshold: 1700, emoji: "🐯", lucideIcon: "drama" },
  { index: 6, name: "Sannin",       color: "#eab308", gradient: "from-yellow-500 to-amber-400",    threshold: 3000, emoji: "🐍", lucideIcon: "award" },
  { index: 7, name: "Kage",         color: "#b91c1c", gradient: "from-red-800 to-red-600",         threshold: 5000, emoji: "👑", lucideIcon: "crown" },
];

export interface RankInfo {
  rank: Rank;
  next: Rank | null;
  xpInRank: number;
  xpForNext: number;
  progress: number;
}

export function getRankInfo(xp: number): RankInfo {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.threshold) rank = r;
  }
  const next = RANKS[rank.index + 1] ?? null;
  const xpInRank = xp - rank.threshold;
  const xpForNext = next ? next.threshold - rank.threshold : 0;
  const progress = next ? Math.min(1, xpInRank / xpForNext) : 1;
  return { rank, next, xpInRank, xpForNext, progress };
}

export function xpForPomodoro(durationMinutes: number): number {
  return Math.max(4, Math.round(durationMinutes / 1.5));
}

export function xpForCycleBonus(cycles: number): number {
  return cycles * 5;
}

export function xpForStreak(streakDays: number): number {
  return Math.min(streakDays, 7) * 12;
}

// Mission ranks D / C / B / S — distinct from the user's career rank progression
// (Académie → Kage). D = easy, S = exclusive ornament tier.
export type AchievementTier = "d" | "c" | "b" | "s";

export type AchievementMetric = "pomodoros" | "focusMinutes" | "streak";

export interface AchievementTrack {
  metric: AchievementMetric;
  target: number;
}

export interface Achievement {
  id: string;
  tier: AchievementTier;
  xpReward: number;
  icon: string;
  iconPath?: string;
  track?: AchievementTrack;
}

export const TIER_XP: Record<AchievementTier, number> = {
  d: 10,
  c: 25,
  b: 60,
  s: 150,
};

const ach = (
  id: string,
  tier: AchievementTier,
  icon: string,
  track?: AchievementTrack,
  iconPath?: string,
): Achievement => ({
  id,
  tier,
  xpReward: TIER_XP[tier],
  icon,
  iconPath,
  track,
});

export const ACHIEVEMENTS: Achievement[] = [
  // Rang D — first steps
  ach("first_pomodoro", "d", "🍅", undefined, "icons/tomato.png"),
  ach("first_cycle", "d", "🔁"),
  ach("total_10", "d", "📘", { metric: "pomodoros", target: 10 }),
  ach("focus_60", "d", "⏱️", { metric: "focusMinutes", target: 60 }),
  ach("early_bird", "d", "🐦"),
  ach("night_owl", "d", "🦉"),
  ach("streak_3", "d", "🔥", { metric: "streak", target: 3 }),
  ach("weekend_warrior", "d", "🏯"),
  ach("pomodoro_5_day", "d", "🎯"),

  // Rang C — habit forming
  ach("total_25", "c", "📒", { metric: "pomodoros", target: 25 }),
  ach("total_50", "c", "📗", { metric: "pomodoros", target: 50 }),
  ach("focus_300", "c", "⌚", { metric: "focusMinutes", target: 300 }),
  ach("streak_7", "c", "🔥🔥", { metric: "streak", target: 7 }),
  ach("ranked_chunin", "c", "🍃"),

  // Rang B — committed
  ach("total_100", "b", "💯", { metric: "pomodoros", target: 100 }),
  ach("total_200", "b", "📕", { metric: "pomodoros", target: 200 }),
  ach("focus_1500", "b", "🎓", { metric: "focusMinutes", target: 1500 }),
  ach("streak_14", "b", "💪", { metric: "streak", target: 14 }),
  ach("streak_30", "b", "🌀", { metric: "streak", target: 30 }),
  ach("ranked_jonin", "b", "🔥"),
  ach("marathon_day", "b", "🏃"),

  // Rang S — exclusive ornaments
  ach("total_500", "s", "👑", { metric: "pomodoros", target: 500 }),
  ach("focus_6000", "s", "💎", { metric: "focusMinutes", target: 6000 }),
  ach("streak_60", "s", "🐉", { metric: "streak", target: 60 }),
  ach("ranked_kage", "s", "👑"),
  ach("eternal_mangekyou", "s", "🌀"),
];

export function findAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getMetricValue(state: AppState, metric: AchievementMetric): number {
  switch (metric) {
    case "pomodoros":
      return state.progression.pomodorosCompleted;
    case "focusMinutes":
      return state.progression.totalFocusMinutes;
    case "streak":
      return state.progression.streakDays;
  }
}

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function generateDailyMission(today: string, cycles: number): DailyMission {
  return {
    date: today,
    target: Math.max(1, cycles),
    progress: 0,
    completed: false,
  };
}

export function ensureDailyMission(state: AppState, today: string): DailyMission {
  if (state.dailyMission.date === today && state.dailyMission.target > 0) {
    return state.dailyMission;
  }
  return generateDailyMission(today, state.preferences.cycles);
}

export interface PomodoroResult {
  patch: StatePatch;
  gained: {
    xp: number;
    rankUp: boolean;
    fromRank: Rank;
    toRank: Rank;
    newAchievements: string[];
    missionCompleted: boolean;
  };
}

function evaluateAchievements(
  state: AppState,
  ctx: { hour: number; dayOfWeek: number; pomodorosToday: number }
): string[] {
  const owned = new Set(state.progression.achievements);
  const newly: string[] = [];
  const p = state.progression;

  const unlock = (id: string) => {
    if (!owned.has(id)) {
      newly.push(id);
      owned.add(id);
    }
  };

  // Pomodoro count tiers — realistic
  if (p.pomodorosCompleted >= 1) unlock("first_pomodoro");
  if (p.pomodorosCompleted >= 10) unlock("total_10");
  if (p.pomodorosCompleted >= 25) unlock("total_25");
  if (p.pomodorosCompleted >= 50) unlock("total_50");
  if (p.pomodorosCompleted >= 100) unlock("total_100");
  if (p.pomodorosCompleted >= 200) unlock("total_200");
  if (p.pomodorosCompleted >= 500) unlock("total_500");

  // Total focus minutes — 1h, 5h, 25h, 100h
  if (p.totalFocusMinutes >= 60) unlock("focus_60");
  if (p.totalFocusMinutes >= 300) unlock("focus_300");
  if (p.totalFocusMinutes >= 1500) unlock("focus_1500");
  if (p.totalFocusMinutes >= 6000) unlock("focus_6000");

  // Streak tiers — capped at 60 days for realism
  if (p.streakDays >= 3) unlock("streak_3");
  if (p.streakDays >= 7) unlock("streak_7");
  if (p.streakDays >= 14) unlock("streak_14");
  if (p.streakDays >= 30) unlock("streak_30");
  if (p.streakDays >= 60) unlock("streak_60");

  // Rank-tied
  if (p.rankIndex >= 2) unlock("ranked_chunin");
  if (p.rankIndex >= 4) unlock("ranked_jonin");
  if (p.rankIndex >= 7) unlock("ranked_kage");

  // Time-of-day
  if (ctx.hour >= 22 || ctx.hour < 4) unlock("night_owl");
  if (ctx.hour >= 5 && ctx.hour < 7) unlock("early_bird");

  // Day-of-week (Sat=6, Sun=0)
  if (ctx.dayOfWeek === 0 || ctx.dayOfWeek === 6) unlock("weekend_warrior");

  // Single-day intensity
  if (ctx.pomodorosToday >= 5) unlock("pomodoro_5_day");
  if (ctx.pomodorosToday >= 10) unlock("marathon_day");

  // Compound S-rank — 30+ days streak AND 200+ pomodoros (was 100j+1000p)
  if (p.streakDays >= 30 && p.pomodorosCompleted >= 200) unlock("eternal_mangekyou");

  return newly;
}

function isYesterday(prev: string, today: string): boolean {
  if (!prev) return false;
  const d = new Date(today + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10) === prev;
}

export function applyPomodoroComplete(
  state: AppState,
  opts: { isCycleEnd: boolean; now?: Date }
): PomodoroResult {
  const now = opts.now ?? new Date();
  const today = todayKey(now);
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const prevRankInfo = getRankInfo(state.progression.xp);

  const baseXp = xpForPomodoro(state.preferences.duration);
  const cycleBonus = opts.isCycleEnd ? xpForCycleBonus(state.preferences.cycles) : 0;

  let newStreak = state.progression.streakDays;
  if (state.progression.lastSessionDate !== today) {
    if (isYesterday(state.progression.lastSessionDate, today)) {
      newStreak = state.progression.streakDays + 1;
    } else {
      newStreak = 1;
    }
  } else if (newStreak === 0) {
    newStreak = 1;
  }

  const streakBonus = state.progression.lastSessionDate !== today ? xpForStreak(newStreak) : 0;

  const mission = ensureDailyMission(state, today);
  const newMissionProgress = Math.min(mission.target, mission.progress + 1);
  const missionCompletedNow = !mission.completed && newMissionProgress >= mission.target;
  const missionBonus = missionCompletedNow ? 30 : 0;

  // Pomodoros done today (used for marathon/5_day achievements). dailyMission.progress
  // resets per day so it's the day's count when state.dailyMission.date === today.
  const pomodorosToday =
    state.dailyMission.date === today ? newMissionProgress : 1;

  // Initial XP (without achievement bonuses — those are added after evaluation)
  const xpBeforeAchievements = baseXp + cycleBonus + streakBonus + missionBonus;
  const tentativeXp = state.progression.xp + xpBeforeAchievements;
  const tentativeRankInfo = getRankInfo(tentativeXp);

  const tentativeProgression: Progression = {
    xp: tentativeXp,
    pomodorosCompleted: state.progression.pomodorosCompleted + 1,
    totalFocusMinutes: state.progression.totalFocusMinutes + state.preferences.duration,
    streakDays: newStreak,
    lastSessionDate: today,
    achievements: state.progression.achievements,
    rankIndex: tentativeRankInfo.rank.index,
  };

  const newAchievements = evaluateAchievements(
    { ...state, progression: tentativeProgression },
    { hour, dayOfWeek, pomodorosToday }
  );
  if (opts.isCycleEnd && !state.progression.achievements.includes("first_cycle")) {
    newAchievements.push("first_cycle");
  }

  // Sum XP rewards from newly unlocked achievements + build journal entries
  const unlockTimestamp = now.getTime();
  const newLogEntries = newAchievements
    .map((id) => {
      const a = findAchievement(id);
      if (!a) return null;
      return { id, at: unlockTimestamp, xp: a.xpReward };
    })
    .filter((e): e is { id: string; at: number; xp: number } => e !== null);
  const achievementBonus = newLogEntries.reduce((sum, e) => sum + e.xp, 0);

  const totalGained = xpBeforeAchievements + achievementBonus;
  const finalXp = state.progression.xp + totalGained;
  const finalRankInfo = getRankInfo(finalXp);

  const previousLog = state.progression.achievementsLog ?? [];

  const newProgressionState: Progression = {
    ...tentativeProgression,
    xp: finalXp,
    rankIndex: finalRankInfo.rank.index,
    achievements:
      newAchievements.length > 0
        ? [...state.progression.achievements, ...newAchievements]
        : state.progression.achievements,
    achievementsLog:
      newLogEntries.length > 0 ? [...previousLog, ...newLogEntries] : previousLog,
  };

  return {
    patch: {
      progression: newProgressionState,
      dailyMission: {
        date: mission.date,
        target: mission.target,
        progress: newMissionProgress,
        completed: missionCompletedNow || mission.completed,
      },
    },
    gained: {
      xp: totalGained,
      rankUp: finalRankInfo.rank.index > prevRankInfo.rank.index,
      fromRank: prevRankInfo.rank,
      toRank: finalRankInfo.rank,
      newAchievements,
      missionCompleted: missionCompletedNow,
    },
  };
}
