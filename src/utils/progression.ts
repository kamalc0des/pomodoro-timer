import type { AppState, Progression, DailyMission, StatePatch } from "../types/state.js";

export interface Rank {
  index: number;
  name: string;
  color: string;
  gradient: string;
  threshold: number;
  emoji: string;
}

export const RANKS: Rank[] = [
  { index: 0, name: "Académie", color: "#9ca3af", gradient: "from-gray-500 to-gray-300", threshold: 0, emoji: "🎓" },
  { index: 1, name: "Genin", color: "#3b82f6", gradient: "from-blue-600 to-blue-400", threshold: 100, emoji: "🥷" },
  { index: 2, name: "Chūnin", color: "#10b981", gradient: "from-emerald-600 to-emerald-400", threshold: 300, emoji: "🍃" },
  { index: 3, name: "Jōnin spécial", color: "#a855f7", gradient: "from-purple-600 to-purple-400", threshold: 700, emoji: "✨" },
  { index: 4, name: "Jōnin", color: "#f97316", gradient: "from-orange-600 to-orange-400", threshold: 1500, emoji: "🔥" },
  { index: 5, name: "ANBU", color: "#dc2626", gradient: "from-red-700 to-red-500", threshold: 3000, emoji: "🐯" },
  { index: 6, name: "Sannin", color: "#eab308", gradient: "from-yellow-500 to-amber-400", threshold: 5500, emoji: "🐍" },
  { index: 7, name: "Kage", color: "#b91c1c", gradient: "from-red-800 to-red-600", threshold: 9000, emoji: "👑" },
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
  return Math.max(5, Math.round(durationMinutes));
}

export function xpForCycleBonus(cycles: number): number {
  return cycles * 10;
}

export function xpForStreak(streakDays: number): number {
  return Math.min(streakDays, 7) * 20;
}

export const ACHIEVEMENTS: { id: string; label: string; icon: string; description: string }[] = [
  { id: "first_pomodoro", label: "Premier pas", icon: "🍅", description: "Complète ton premier pomodoro" },
  { id: "first_cycle", label: "Cycle complet", icon: "🔁", description: "Termine une session complète" },
  { id: "total_10", label: "Apprenti", icon: "📘", description: "10 pomodoros au compteur" },
  { id: "total_50", label: "Concentré", icon: "📗", description: "50 pomodoros au compteur" },
  { id: "total_100", label: "Centurion", icon: "💯", description: "100 pomodoros au compteur" },
  { id: "streak_3", label: "Régulier", icon: "🔥", description: "3 jours de suite" },
  { id: "streak_7", label: "Semaine sacrée", icon: "🔥🔥", description: "7 jours de suite" },
  { id: "streak_30", label: "Sennin", icon: "🌀", description: "30 jours de suite" },
  { id: "night_owl", label: "Hibou de nuit", icon: "🦉", description: "Pomodoro entre 22h et 4h" },
  { id: "early_bird", label: "Lève-tôt", icon: "🐦", description: "Pomodoro entre 5h et 7h" },
];

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

function evaluateAchievements(state: AppState, hour: number): string[] {
  const owned = new Set(state.progression.achievements);
  const newly: string[] = [];
  const p = state.progression;

  const unlock = (id: string) => {
    if (!owned.has(id)) {
      newly.push(id);
      owned.add(id);
    }
  };

  if (p.pomodorosCompleted >= 1) unlock("first_pomodoro");
  if (p.pomodorosCompleted >= 10) unlock("total_10");
  if (p.pomodorosCompleted >= 50) unlock("total_50");
  if (p.pomodorosCompleted >= 100) unlock("total_100");
  if (p.streakDays >= 3) unlock("streak_3");
  if (p.streakDays >= 7) unlock("streak_7");
  if (p.streakDays >= 30) unlock("streak_30");
  if (hour >= 22 || hour < 4) unlock("night_owl");
  if (hour >= 5 && hour < 7) unlock("early_bird");

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
  const missionBonus = missionCompletedNow ? 50 : 0;

  const totalGained = baseXp + cycleBonus + streakBonus + missionBonus;
  const newXp = state.progression.xp + totalGained;
  const newRankInfo = getRankInfo(newXp);

  const newProgressionState: Progression = {
    xp: newXp,
    pomodorosCompleted: state.progression.pomodorosCompleted + 1,
    totalFocusMinutes: state.progression.totalFocusMinutes + state.preferences.duration,
    streakDays: newStreak,
    lastSessionDate: today,
    achievements: state.progression.achievements,
    rankIndex: newRankInfo.rank.index,
  };

  const newAchievements = evaluateAchievements(
    { ...state, progression: newProgressionState },
    hour
  );
  if (opts.isCycleEnd && !state.progression.achievements.includes("first_cycle")) {
    newAchievements.push("first_cycle");
  }
  if (newAchievements.length > 0) {
    newProgressionState.achievements = [
      ...state.progression.achievements,
      ...newAchievements,
    ];
  }

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
      rankUp: newRankInfo.rank.index > prevRankInfo.rank.index,
      fromRank: prevRankInfo.rank,
      toRank: newRankInfo.rank,
      newAchievements,
      missionCompleted: missionCompletedNow,
    },
  };
}
