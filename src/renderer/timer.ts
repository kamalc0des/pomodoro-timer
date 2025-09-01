import { byId } from "../utils/dom.js";
import { storage } from "../utils/storage.js";

(function initTimerPage() {
  if (!window._electronApiDeclared) {
    window._electronApiDeclared = true;
  }

  // 1) Grab the element, guard, then rebind as non-null
  const el = byId<HTMLDivElement>("timer");
  if (!el) return; // not on timer page
  const timerEl: HTMLDivElement = el; // <-- permanently non-null from here

  const userInfo = byId<HTMLSpanElement>("userInfo");
  const profilePic = byId<HTMLImageElement>("profilePic");
  const cycleInfo = byId<HTMLDivElement>("cycleInfo");
  const startPauseBtn = byId<HTMLButtonElement>("startPauseBtn");
  const resetBtn = byId<HTMLButtonElement>("resetBtn");
  const settingsBtn = byId<HTMLButtonElement>("settingsBtn");

  const pseudo = localStorage.getItem("pseudo") ?? "";
  const avatar = localStorage.getItem("avatar") ?? "";
  if (userInfo) userInfo.textContent = pseudo ? `👤 ${pseudo}` : "";
  if (profilePic) profilePic.src = avatar;

  // Parameters
  let duration = storage.getNumber("duration", 25);          // minutes work
  let breakDuration = storage.getNumber("breakDuration", 5); // minutes break
  let cycles = storage.getNumber("cycles", 4);

  let currentCycle = 1;
  let isBreak = false;
  let timeLeft = duration * 60;
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let isRunning = false;

  const dingSound = new Audio("assets/ding.mp3");

  const fmt = (n: number) => String(n).padStart(2, "0");

  function updateTitle() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    const phase = isBreak ? "Pause" : "Work";
    document.title = `${fmt(min)}:${fmt(sec)} • ${phase}`;
  }

  function updateDisplay() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    timerEl.textContent = `${fmt(min)}:${fmt(sec)}`;
    if (cycleInfo) {
      cycleInfo.textContent = `Cycle ${currentCycle} / ${cycles} ${isBreak ? "(Pause)" : "(Work)"}`;
    }
    updateTitle();
  }

  function clearTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function startTimer() {
    if (timerInterval) return; // prevent double interval

    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
        return;
      }

      clearTimer();
      isRunning = false;

      if (!isBreak) {
        // Work -> Break
        isBreak = true;
        timeLeft = breakDuration * 60;
        timerEl.textContent = "Pause !";
        void dingSound.play().catch(() => void 0);

        setTimeout(() => {
          updateDisplay();
          startTimer();
          isRunning = true;
          if (startPauseBtn) startPauseBtn.textContent = "Pause";
        }, 1000);
      } else {
        // Break -> Work or End
        isBreak = false;
        currentCycle++;
        if (currentCycle > cycles) {
          timerEl.textContent = "Pomodoro terminé !";
          if (startPauseBtn) startPauseBtn.textContent = "Start";
          void dingSound.play().catch(() => void 0);
          updateTitle();
        } else {
          timeLeft = duration * 60;
          timerEl.textContent = "Go !";
          setTimeout(() => {
            updateDisplay();
            startTimer();
            isRunning = true;
            if (startPauseBtn) startPauseBtn.textContent = "Pause";
          }, 1000);
        }
      }
    }, 1000);

    isRunning = true;
    if (startPauseBtn) startPauseBtn.textContent = "Pause";
  }

  startPauseBtn?.addEventListener("click", () => {
    if (isRunning) {
      clearTimer();
      isRunning = false;
      if (startPauseBtn) startPauseBtn.textContent = "Start";
      updateTitle();
    } else {
      startTimer();
    }
  });

  resetBtn?.addEventListener("click", () => {
    clearTimer();
    duration = storage.getNumber("duration", 25);
    breakDuration = storage.getNumber("breakDuration", 5);
    cycles = storage.getNumber("cycles", 4);

    isBreak = false;
    currentCycle = 1;
    timeLeft = duration * 60;
    isRunning = false;
    if (startPauseBtn) startPauseBtn.textContent = "Start";
    updateDisplay();
  });

  settingsBtn?.addEventListener("click", () => {
    window.electronAPI.navigate("settings.html");
  });

  updateDisplay();
})();
