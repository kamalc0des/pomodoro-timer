export interface Profile {
  pseudo: string;
  avatar: string;
  onboarded: boolean;
  createdAt: number;
}

export type Lang = "en" | "fr";

export interface Preferences {
  duration: number;
  breakDuration: number;
  cycles: number;
  theme: string;
  notificationsEnabled: boolean;
  language: Lang;
}

export interface Progression {
  xp: number;
  pomodorosCompleted: number;
  totalFocusMinutes: number;
  streakDays: number;
  lastSessionDate: string;
  achievements: string[];
  rankIndex: number;
}

export interface DailyMission {
  date: string;
  target: number;
  progress: number;
  completed: boolean;
}

export interface AppState {
  profile: Profile;
  preferences: Preferences;
  progression: Progression;
  dailyMission: DailyMission;
}

export interface StatePatch {
  profile?: Partial<Profile>;
  preferences?: Partial<Preferences>;
  progression?: Partial<Progression>;
  dailyMission?: Partial<DailyMission>;
}
