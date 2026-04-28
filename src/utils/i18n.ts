import type { Lang } from "../types/state.js";

export const LANGS: Lang[] = ["en", "fr"];

const dict: Record<Lang, Record<string, string>> = {
  en: {
    "common.next": "Next →",
    "common.prev": "← Previous",
    "common.back": "← Back",
    "common.save": "Save",
    "common.loading": "Loading...",
    "common.cancel": "Cancel",
    "common.minutes": "min",

    "confirm.delete.title": "Delete profile?",
    "confirm.delete.body": "This will erase your pseudo, avatar, and all your progress. This action cannot be undone.",
    "confirm.delete.confirm": "Delete",

    "index.welcome.back": "Welcome back, {name}!",
    "index.welcome.subtitle": "Ready to focus?",
    "index.welcome.new": "Welcome to Pomodoro Minutor!",
    "index.welcome.cta": "Create your profile to get started.",
    "index.start": "Let's go",
    "index.delete": "Delete my profile",

    "timer.start": "Start",
    "timer.pause": "Break",
    "timer.reset": "Reset",
    "timer.cycle": "Cycle {current} / {total}",
    "timer.phase.work": "Work",
    "timer.phase.break": "Break",
    "timer.xp": "XP",
    "timer.mission.progress": "🎯 Mission: {progress}/{target} pomodoros",
    "timer.mission.done": "🎯 Daily mission completed! (+50 XP)",
    "timer.levelup": "RANK UP!",
    "timer.achievement.unlocked": "🏆 Achievement unlocked: {label}",

    "notif.break.title": "Break time",
    "notif.break.body": "Good job {name}! Take a {min} min break.",
    "notif.done.title": "Pomodoro complete",
    "notif.done.body": "All {n} cycles completed. Well done {name}!",
    "notif.back.title": "Back to work",
    "notif.back.body": "Cycle {current} / {total} — let's focus!",
    "notif.test.title": "Notifications enabled",
    "notif.test.body": "You'll get an alert at every transition.",

    "settings.title": "Settings",
    "settings.duration": "Work",
    "settings.break": "Break",
    "settings.cycles": "Cycles",
    "settings.theme": "Theme",
    "settings.notifications": "Notifications",
    "settings.notifications.label": "Enable notifications",
    "settings.language": "Language",
    "settings.saved": "Settings saved!",
    "settings.invalid": "Invalid values",
    "settings.go.back": "Go back",
    "settings.delete": "Delete my profile",

    "footer.support": "Support me and visit my portfolio: @kamalcodes",

    "theme.retro_teal": "Retro Teal",
    "theme.coral_teal": "Coral Teal",
    "theme.burgundy_gold": "Burgundy Gold",
    "theme.slate_orange": "Slate Orange",
    "theme.naruto": "Naruto",
    "theme.sasuke": "Sasuke",
    "theme.sakura": "Sakura",
    "theme.kakashi": "Kakashi",

    "onboarding.welcome.title": "Welcome to Minutor",
    "onboarding.welcome.body": "Stay focused, level up like a ninja, unlock new ranks. Every pomodoro brings you closer to Kage.",
    "onboarding.identity.title": "Your identity",
    "onboarding.identity.subtitle": "Pick a name and an avatar",
    "onboarding.identity.pseudo": "Username",
    "onboarding.identity.error.pseudo": "Pick a username.",
    "onboarding.identity.error.avatar": "Add a profile picture.",
    "onboarding.rhythm.title": "Your rhythm",
    "onboarding.rhythm.subtitle": "How long is a session?",
    "onboarding.rhythm.summary": "{cycles} cycles → about {total} min total",
    "onboarding.notif.title": "Notifications",
    "onboarding.notif.body": "Get alerted when a pomodoro ends, even if you switch apps.",
    "onboarding.notif.toggle": "Enable notifications",
    "onboarding.notif.test": "Test now",
    "onboarding.theme.title": "Pick your theme",
    "onboarding.theme.subtitle": "You can change it later",
    "onboarding.rpg.title": "Your progression",
    "onboarding.rpg.body": "You start at the Academy rank. Earn XP per pomodoro and climb the ranks.",
    "onboarding.ready.title": "Ready {name}!",
    "onboarding.ready.body": "May your focus be legendary.",
    "onboarding.cta.final": "Become a ninja 🥷",

    "profile.title": "Profile",
    "profile.edit": "Edit profile",
    "profile.edit.title": "Edit profile",
    "profile.edit.saved": "Profile updated",
    "profile.stat.pomodoros": "pomodoros",
    "profile.stat.minutes": "min focus",
    "profile.stat.streak": "day streak",
    "profile.mission.title": "Daily mission",
    "profile.mission.empty": "Start a pomodoro to kick off today's mission.",
    "profile.mission.done": "✅ Mission accomplished — +50 XP bonus",
    "profile.mission.progress": "🎯 <strong>{progress}/{target}</strong> pomodoros today",
    "profile.achievements.title": "Achievements",
    "profile.rank.max": "Max",
    "profile.xp.next": "{cur} / {total} XP — total {sum}",
    "profile.xp.max": "{xp} XP (max rank)",

    "rank.0": "Academy",
    "rank.1": "Genin",
    "rank.2": "Chūnin",
    "rank.3": "Special Jōnin",
    "rank.4": "Jōnin",
    "rank.5": "ANBU",
    "rank.6": "Sannin",
    "rank.7": "Kage",

    "ach.first_pomodoro.label": "First step",
    "ach.first_pomodoro.desc": "Complete your first pomodoro",
    "ach.first_cycle.label": "Full cycle",
    "ach.first_cycle.desc": "Finish a full session",
    "ach.total_10.label": "Apprentice",
    "ach.total_10.desc": "10 pomodoros",
    "ach.total_50.label": "Focused",
    "ach.total_50.desc": "50 pomodoros",
    "ach.total_100.label": "Centurion",
    "ach.total_100.desc": "100 pomodoros",
    "ach.streak_3.label": "Consistent",
    "ach.streak_3.desc": "3 days in a row",
    "ach.streak_7.label": "Sacred week",
    "ach.streak_7.desc": "7 days in a row",
    "ach.streak_30.label": "Sennin",
    "ach.streak_30.desc": "30 days in a row",
    "ach.night_owl.label": "Night owl",
    "ach.night_owl.desc": "Pomodoro between 10 PM and 4 AM",
    "ach.early_bird.label": "Early bird",
    "ach.early_bird.desc": "Pomodoro between 5 AM and 7 AM",
  },
  fr: {
    "common.next": "Suivant →",
    "common.prev": "← Précédent",
    "common.back": "← Retour",
    "common.save": "Enregistrer",
    "common.loading": "Chargement...",
    "common.cancel": "Annuler",
    "common.minutes": "min",

    "confirm.delete.title": "Supprimer le profil ?",
    "confirm.delete.body": "Ton pseudo, ton avatar et toute ta progression seront effacés. Cette action est irréversible.",
    "confirm.delete.confirm": "Supprimer",

    "index.welcome.back": "Bon retour, {name} !",
    "index.welcome.subtitle": "Prêt à te concentrer ?",
    "index.welcome.new": "Bienvenue dans Pomodoro Minutor !",
    "index.welcome.cta": "Crée ton profil pour démarrer.",
    "index.start": "C'est parti",
    "index.delete": "Supprimer mon profil",

    "timer.start": "Démarrer",
    "timer.pause": "Pause",
    "timer.reset": "Reset",
    "timer.cycle": "Cycle {current} / {total}",
    "timer.phase.work": "Travail",
    "timer.phase.break": "Pause",
    "timer.xp": "XP",
    "timer.mission.progress": "🎯 Mission : {progress}/{target} pomodoros",
    "timer.mission.done": "🎯 Mission du jour terminée ! (+50 XP)",
    "timer.levelup": "RANG SUPÉRIEUR !",
    "timer.achievement.unlocked": "🏆 Achievement débloqué : {label}",

    "notif.break.title": "C'est la pause",
    "notif.break.body": "Bien joué {name} ! Prends {min} min de pause.",
    "notif.done.title": "Pomodoro terminé",
    "notif.done.body": "Les {n} cycles sont terminés. Bravo {name} !",
    "notif.back.title": "Au boulot",
    "notif.back.body": "Cycle {current} / {total} — concentre-toi !",
    "notif.test.title": "Notifications activées",
    "notif.test.body": "Tu recevras une alerte à chaque transition.",

    "settings.title": "Paramètres",
    "settings.duration": "Travail",
    "settings.break": "Pause",
    "settings.cycles": "Cycles",
    "settings.theme": "Thème",
    "settings.notifications": "Notifications",
    "settings.notifications.label": "Activer les notifications",
    "settings.language": "Langue",
    "settings.saved": "Paramètres enregistrés !",
    "settings.invalid": "Valeurs invalides",
    "settings.go.back": "Retour",
    "settings.delete": "Supprimer mon profil",

    "footer.support": "Soutiens-moi et visite mon portfolio : @kamalcodes",

    "theme.retro_teal": "Rétro Teal",
    "theme.coral_teal": "Coral Teal",
    "theme.burgundy_gold": "Bordeaux Or",
    "theme.slate_orange": "Slate Orange",
    "theme.naruto": "Naruto",
    "theme.sasuke": "Sasuke",
    "theme.sakura": "Sakura",
    "theme.kakashi": "Kakashi",

    "onboarding.welcome.title": "Bienvenue dans Minutor",
    "onboarding.welcome.body": "Reste concentré, progresse comme un ninja, débloque des rangs. Chaque pomodoro te rapproche du titre de Kage.",
    "onboarding.identity.title": "Ton identité",
    "onboarding.identity.subtitle": "Choisis un pseudo et un avatar",
    "onboarding.identity.pseudo": "Pseudo",
    "onboarding.identity.error.pseudo": "Choisis un pseudo.",
    "onboarding.identity.error.avatar": "Ajoute une photo de profil.",
    "onboarding.rhythm.title": "Ton rythme",
    "onboarding.rhythm.subtitle": "Combien de minutes par session ?",
    "onboarding.rhythm.summary": "{cycles} cycles → environ {total} min de session",
    "onboarding.notif.title": "Notifications",
    "onboarding.notif.body": "Reçois une alerte quand un pomodoro se termine, même si tu changes d'app.",
    "onboarding.notif.toggle": "Activer les notifications",
    "onboarding.notif.test": "Tester maintenant",
    "onboarding.theme.title": "Choisis ton thème",
    "onboarding.theme.subtitle": "Tu pourras le changer plus tard",
    "onboarding.rpg.title": "Ta progression",
    "onboarding.rpg.body": "Tu commences au rang Académie. Gagne de l'XP à chaque pomodoro et grimpe les échelons.",
    "onboarding.ready.title": "Prêt {name} !",
    "onboarding.ready.body": "Que ta concentration soit légendaire.",
    "onboarding.cta.final": "Devenir ninja 🥷",

    "profile.title": "Profil",
    "profile.edit": "Modifier le profil",
    "profile.edit.title": "Modifier le profil",
    "profile.edit.saved": "Profil mis à jour",
    "profile.stat.pomodoros": "pomodoros",
    "profile.stat.minutes": "min focus",
    "profile.stat.streak": "jours de suite",
    "profile.mission.title": "Mission du jour",
    "profile.mission.empty": "Lance un pomodoro pour démarrer ta mission du jour.",
    "profile.mission.done": "✅ Mission accomplie — bonus +50 XP",
    "profile.mission.progress": "🎯 <strong>{progress}/{target}</strong> pomodoros aujourd'hui",
    "profile.achievements.title": "Achievements",
    "profile.rank.max": "Max",
    "profile.xp.next": "{cur} / {total} XP — total {sum}",
    "profile.xp.max": "{xp} XP (rang max)",

    "rank.0": "Académie",
    "rank.1": "Genin",
    "rank.2": "Chūnin",
    "rank.3": "Jōnin spécial",
    "rank.4": "Jōnin",
    "rank.5": "ANBU",
    "rank.6": "Sannin",
    "rank.7": "Kage",

    "ach.first_pomodoro.label": "Premier pas",
    "ach.first_pomodoro.desc": "Complète ton premier pomodoro",
    "ach.first_cycle.label": "Cycle complet",
    "ach.first_cycle.desc": "Termine une session complète",
    "ach.total_10.label": "Apprenti",
    "ach.total_10.desc": "10 pomodoros au compteur",
    "ach.total_50.label": "Concentré",
    "ach.total_50.desc": "50 pomodoros au compteur",
    "ach.total_100.label": "Centurion",
    "ach.total_100.desc": "100 pomodoros au compteur",
    "ach.streak_3.label": "Régulier",
    "ach.streak_3.desc": "3 jours de suite",
    "ach.streak_7.label": "Semaine sacrée",
    "ach.streak_7.desc": "7 jours de suite",
    "ach.streak_30.label": "Sennin",
    "ach.streak_30.desc": "30 jours de suite",
    "ach.night_owl.label": "Hibou de nuit",
    "ach.night_owl.desc": "Pomodoro entre 22h et 4h",
    "ach.early_bird.label": "Lève-tôt",
    "ach.early_bird.desc": "Pomodoro entre 5h et 7h",
  },
};

let current: Lang = "en";

export function detectInitialLang(saved?: Lang): Lang {
  if (saved === "en" || saved === "fr") return saved;
  const nav = (typeof navigator !== "undefined" ? navigator.language : "") || "";
  return nav.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export function setLang(lang: Lang): void {
  current = lang;
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", lang);
  }
}

export function getLang(): Lang {
  return current;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const raw = dict[current][key] ?? dict.en[key] ?? key;
  if (!vars) return raw;
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.split(`{${k}}`).join(String(v)),
    raw,
  );
}

export function applyI18n(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n!;
    el.textContent = t(key);
  });
  root.querySelectorAll<HTMLElement>("[data-i18n-html]").forEach((el) => {
    const key = el.dataset.i18nHtml!;
    el.innerHTML = t(key);
  });
  root.querySelectorAll<HTMLElement>("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder!;
    if (el instanceof HTMLInputElement) el.placeholder = t(key);
  });
  root.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach((el) => {
    const key = el.dataset.i18nTitle!;
    el.title = t(key);
  });
}
