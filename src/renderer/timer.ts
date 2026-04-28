import { byId } from "../utils/dom.js";
import { loadState, patchState } from "../utils/storage.js";
import {
  ACHIEVEMENTS,
  applyPomodoroComplete,
  ensureDailyMission,
  getRankInfo,
  todayKey,
} from "../utils/progression.js";
import { applyI18n, getLang, setLang, t } from "../utils/i18n.js";
import { applyEnterAnimation, navigateWithExit } from "../utils/animations.js";
import { showSessionEndModal } from "../utils/sessionEndModal.js";
import type { AppState } from "../types/state.js";

(async function initTimerPage() {
  if (!window._electronApiDeclared) window._electronApiDeclared = true;

  let state: AppState = await loadState();

  if (!state.profile.onboarded) {
    window.electronAPI.navigate("onboarding.html");
    return;
  }

  document.documentElement.dataset.theme = state.preferences.theme;
  applyI18n();
  window.lucide?.createIcons();
  applyEnterAnimation();

  const today = todayKey();
  const refreshedMission = ensureDailyMission(state, today);
  if (
    refreshedMission.date !== state.dailyMission.date ||
    refreshedMission.target !== state.dailyMission.target
  ) {
    state = await patchState({ dailyMission: refreshedMission });
  }

  const timerEl = byId<HTMLDivElement>("timer");
  if (!timerEl) return;

  const userInfo = byId<HTMLSpanElement>("userInfo");
  const profilePic = byId<HTMLImageElement>("profilePic");
  const cycleInfo = byId<HTMLDivElement>("cycleInfo");
  const startPauseBtn = byId<HTMLButtonElement>("startPauseBtn");
  const resetBtn = byId<HTMLButtonElement>("resetBtn");
  const settingsBtn = byId<HTMLButtonElement>("settingsBtn");
  const profileBtn = byId<HTMLButtonElement>("profileBtn");
  const rankLabel = byId<HTMLSpanElement>("rankLabel");
  const xpBar = byId<HTMLDivElement>("xpBar");
  const xpFill = byId<HTMLDivElement>("xpFill");
  const missionLabel = byId<HTMLDivElement>("missionLabel");
  const langToggle = byId<HTMLButtonElement>("langToggle");

  if (userInfo) userInfo.textContent = state.profile.pseudo;
  if (profilePic) profilePic.src = state.profile.avatar;

  let duration = state.preferences.duration;
  let breakDuration = state.preferences.breakDuration;
  let cycles = state.preferences.cycles;
  const pseudo = state.profile.pseudo;

  let mode: "pomodoro" | "timer" = state.preferences.mode === "timer" ? "timer" : "pomodoro";
  let timerDuration = Math.max(1, Math.min(60, state.preferences.timerDuration ?? 25));
  let currentCycle = 1;
  let isBreak = false;
  let timeLeft = (mode === "timer" ? timerDuration : duration) * 60;
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let isRunning = false;
  let sessionXp = 0; // accumulator for the current session's XP gain (pomodoro mode only)

  const fmt = (n: number) => String(n).padStart(2, "0");

  function notify(title: string, body: string) {
    if (!state.preferences.notificationsEnabled) return;
    window.electronAPI.notify(title, body);
  }

  // Native OS beep — replaces previous custom WAV files.
  // macOS plays the user's selected alert sound, Windows plays the default ding.
  function playSound() {
    window.electronAPI.beep();
  }

  function refreshLangToggle() {
    if (langToggle) langToggle.textContent = getLang() === "en" ? "FR" : "EN";
  }

  function refreshStartPauseLabel() {
    if (startPauseBtn) {
      startPauseBtn.textContent = isRunning ? t("timer.pause") : t("timer.start");
    }
    refreshTimerControls();
  }

  function updateProgressionUI() {
    const info = getRankInfo(state.progression.xp);
    if (rankLabel) {
      const labelText = t("timer.rank.label", {
        n: info.rank.index + 1,
        rank: t(`rank.${info.rank.index}`),
      });
      rankLabel.innerHTML = `<i data-lucide="${info.rank.lucideIcon}" class="w-3.5 h-3.5 inline-block align-middle"></i> <span class="align-middle">${labelText}</span>`;
      window.lucide?.createIcons();
    }
    if (xpBar) {
      xpBar.dataset.tooltip = info.next
        ? `${info.xpInRank} / ${info.xpForNext} XP`
        : `${state.progression.xp} XP`;
    }
    if (xpFill) {
      xpFill.style.width = `${Math.round(info.progress * 100)}%`;
      xpFill.style.background = info.rank.color;
    }
    if (missionLabel) {
      const m = state.dailyMission;
      if (m.completed) {
        missionLabel.textContent = t("timer.mission.done");
      } else if (m.target > 0) {
        missionLabel.textContent = t("timer.mission.progress", {
          progress: m.progress,
          target: m.target,
        });
      } else {
        missionLabel.textContent = "";
      }
    }
  }

  function updateTitle() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    const phase = isBreak ? t("timer.phase.break") : t("timer.phase.work");
    document.title = `${fmt(min)}:${fmt(sec)} • ${phase}`;
  }

  function updateDisplay() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    timerEl!.textContent = `${fmt(min)}:${fmt(sec)}`;
    if (cycleInfo) {
      if (mode === "timer") {
        cycleInfo.textContent = "";
      } else {
        const cycleLine = t("timer.cycle", { current: currentCycle, total: cycles });
        const phase = isBreak ? t("timer.phase.break") : t("timer.phase.work");
        cycleInfo.textContent = `${cycleLine} (${phase})`;
      }
    }
    updateTitle();
  }

  function clearTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  async function recordPomodoro(isCycleEnd: boolean) {
    const result = applyPomodoroComplete(state, { isCycleEnd });
    state = await patchState(result.patch);
    sessionXp += result.gained.xp;
    updateProgressionUI();

    if (result.gained.rankUp) {
      showLevelUp(result.gained.toRank);
    } else if (result.gained.newAchievements.length > 0) {
      showAchievement(result.gained.newAchievements[0]);
    }
  }

  function showLevelUp(rank: { index: number; emoji: string; name: string; lucideIcon: string }) {
    const overlay = byId<HTMLDivElement>("levelUpOverlay");
    const title = byId<HTMLDivElement>("levelUpTitle");
    const sub = byId<HTMLDivElement>("levelUpRank");
    if (!overlay || !title || !sub) return;
    title.textContent = t("timer.levelup");
    sub.innerHTML = `<div class="flex flex-col items-center gap-2">
      <i data-lucide="${rank.lucideIcon}" class="w-12 h-12"></i>
      <span>${t(`rank.${rank.index}`)}</span>
    </div>`;
    window.lucide?.createIcons();
    overlay.classList.remove("hidden");
    overlay.classList.add("level-up-active");
    playSound();
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.classList.remove("level-up-active");
    }, 2800);
  }

  function showAchievement(id: string) {
    const toast = byId<HTMLDivElement>("achievementToast");
    if (!toast) return;
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    const label = def ? t(`ach.${id}.label`) : id;
    toast.textContent = t("timer.achievement.unlocked", { label });
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2500);
  }

  function startTimer() {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
        return;
      }

      clearTimer();
      isRunning = false;

      // Timer mode — simple countdown: beep + notif + auto-reset, no cycle/XP logic
      if (mode === "timer") {
        playSound();
        notify(t("timer.simple.done.title"), t("timer.simple.done.body"));
        timeLeft = timerDuration * 60;
        refreshStartPauseLabel();
        updateDisplay();
        updateTitle();
        refreshTimerControls();
        return;
      }

      if (!isBreak) {
        const isLastWorkOfSession = currentCycle >= cycles;

        if (isLastWorkOfSession) {
          // Wait for recordPomodoro to update state.progression.xp before opening modal
          void recordPomodoro(isLastWorkOfSession).then(() => {
            playSound();
            notify(
              t("notif.done.title"),
              t("notif.done.body", { n: cycles, name: pseudo }),
            );
            // Snapshot session XP, then reset accumulator for next session
            const xpEarnedThisSession = sessionXp;
            sessionXp = 0;
            // Auto-reset internal state so the timer is ready for a fresh run
            currentCycle = 1;
            isBreak = false;
            timeLeft = duration * 60;
            isRunning = false;
            refreshStartPauseLabel();
            updateDisplay();
            updateTitle();
            // Reward modal with animated XP bar
            void showSessionEndModal({
              name: pseudo,
              sessionXp: xpEarnedThisSession,
              finalXp: state.progression.xp,
            });
          });
          return;
        }

        // Not last cycle — record and start break in parallel
        void recordPomodoro(isLastWorkOfSession);

        // Normal break flow (not last cycle)
        isBreak = true;
        timeLeft = Math.round(breakDuration * 60);
        playSound();
        notify(
          t("notif.break.title"),
          t("notif.break.body", { name: pseudo, min: breakDuration }),
        );

        setTimeout(() => {
          updateDisplay();
          startTimer();
          isRunning = true;
          refreshStartPauseLabel();
        }, 1000);
      } else {
        // Break ended → next work cycle
        isBreak = false;
        currentCycle++;
        timeLeft = duration * 60;
        playSound();
        notify(
          t("notif.back.title"),
          t("notif.back.body", { current: currentCycle, total: cycles }),
        );
        setTimeout(() => {
          updateDisplay();
          startTimer();
          isRunning = true;
          refreshStartPauseLabel();
        }, 1000);
      }
    }, 1000);

    isRunning = true;
    refreshStartPauseLabel();
  }

  startPauseBtn?.addEventListener("click", () => {
    if (isRunning) {
      clearTimer();
      isRunning = false;
      refreshStartPauseLabel();
      updateTitle();
    } else {
      playSound();
      startTimer();
    }
  });

  resetBtn?.addEventListener("click", async () => {
    clearTimer();
    state = await loadState(true);
    duration = state.preferences.duration;
    breakDuration = state.preferences.breakDuration;
    cycles = state.preferences.cycles;
    isBreak = false;
    currentCycle = 1;
    timeLeft = duration * 60;
    isRunning = false;
    refreshStartPauseLabel();
    updateDisplay();
    updateProgressionUI();
  });

  settingsBtn?.addEventListener("click", () => void navigateWithExit("settings.html"));
  profileBtn?.addEventListener("click", () => void navigateWithExit("profile.html"));

  // External support link — open in default browser instead of replacing the Electron window
  const supportLink = byId<HTMLAnchorElement>("supportLink");
  supportLink?.addEventListener("click", (e) => {
    e.preventDefault();
    const opener = window.electronAPI?.openExternal;
    if (opener) {
      opener(supportLink.href);
    } else {
      // Fallback: preload not yet updated — restart Electron to enable
      console.warn("[support] electronAPI.openExternal missing, restart Electron to pick up new preload");
    }
  });

  langToggle?.addEventListener("click", async () => {
    const next = getLang() === "en" ? "fr" : "en";
    setLang(next);
    state = await patchState({ preferences: { language: next } });
    applyI18n();
    refreshLangToggle();
    refreshStartPauseLabel();
    updateDisplay();
    updateProgressionUI();
  });

  // Inline +/- controls for timer mode
  const timerMinusBtn = byId<HTMLButtonElement>("timerMinusBtn");
  const timerPlusBtn = byId<HTMLButtonElement>("timerPlusBtn");

  function isTimerEditable(): boolean {
    return mode === "timer" && !isRunning && timeLeft === timerDuration * 60;
  }
  function refreshTimerControls() {
    const inTimer = mode === "timer";
    if (timerMinusBtn) {
      timerMinusBtn.classList.toggle("hidden", !inTimer);
      timerMinusBtn.disabled = !isTimerEditable() || timerDuration <= 1;
    }
    if (timerPlusBtn) {
      timerPlusBtn.classList.toggle("hidden", !inTimer);
      timerPlusBtn.disabled = !isTimerEditable() || timerDuration >= 60;
    }
  }
  async function adjustTimerDuration(delta: number) {
    if (!isTimerEditable()) return;
    const next = Math.max(1, Math.min(60, timerDuration + delta));
    if (next === timerDuration) return;
    timerDuration = next;
    timeLeft = timerDuration * 60;
    state = await patchState({ preferences: { timerDuration } });
    updateDisplay();
    refreshTimerControls();
  }

  /** Bind a button so a single click adjusts once and a long-press auto-repeats. */
  function bindLongPress(btn: HTMLButtonElement | null, action: () => void) {
    if (!btn) return;
    let initialTimeout: ReturnType<typeof setTimeout> | null = null;
    let repeatInterval: ReturnType<typeof setInterval> | null = null;
    const stop = () => {
      if (initialTimeout) {
        clearTimeout(initialTimeout);
        initialTimeout = null;
      }
      if (repeatInterval) {
        clearInterval(repeatInterval);
        repeatInterval = null;
      }
    };
    btn.addEventListener("pointerdown", (e) => {
      if (btn.disabled) return;
      e.preventDefault();
      action();
      initialTimeout = setTimeout(() => {
        repeatInterval = setInterval(() => {
          if (btn.disabled) { stop(); return; }
          action();
        }, 90);
      }, 380);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) =>
      btn.addEventListener(ev, stop),
    );
  }
  bindLongPress(timerMinusBtn, () => void adjustTimerDuration(-1));
  bindLongPress(timerPlusBtn, () => void adjustTimerDuration(1));

  // Mode switch (Pomodoro / Timer)
  const modeButtons = document.querySelectorAll<HTMLButtonElement>("#modeSwitch .mode-btn");
  function refreshModeSwitch() {
    modeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });
  }
  refreshModeSwitch();
  const timerArea = byId<HTMLDivElement>("timerArea");

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const next = btn.dataset.mode === "timer" ? "timer" : "pomodoro";
      if (mode === next) return;

      // Fade out current content
      if (timerArea && window.Motion?.animate) {
        const fadeOut = window.Motion.animate as unknown as (
          el: Element,
          kf: Record<string, unknown>,
          opts?: Record<string, unknown>,
        ) => { finished: Promise<void> };
        await fadeOut(
          timerArea,
          { opacity: [1, 0], y: [0, 8] },
          { duration: 0.16, easing: [0.65, 0, 0.35, 1] },
        ).finished;
      }

      // Swap state
      mode = next;
      clearTimer();
      isRunning = false;
      isBreak = false;
      currentCycle = 1;
      timeLeft = (mode === "timer" ? timerDuration : duration) * 60;
      sessionXp = 0;
      refreshModeSwitch();
      refreshStartPauseLabel();
      updateDisplay();
      refreshTimerControls();

      // Fade in new content (spring entry, mirrors page transitions)
      if (timerArea && window.Motion?.animate) {
        const fadeIn = window.Motion.animate as unknown as (
          el: Element,
          kf: Record<string, unknown>,
          opts?: Record<string, unknown>,
        ) => { finished: Promise<void> };
        fadeIn(
          timerArea,
          { opacity: [0, 1], y: [-8, 0] },
          { type: "spring", stiffness: 320, damping: 24 },
        );
      }

      // Persist preference
      state = await patchState({ preferences: { mode } });
    });
  });

  refreshLangToggle();
  refreshStartPauseLabel();
  updateDisplay();
  updateProgressionUI();
})();
