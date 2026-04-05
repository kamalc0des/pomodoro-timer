import { byId } from "../utils/dom.js";
import { storage } from "../utils/storage.js";

(function initTimerPage() {
  if (!window._electronApiDeclared) {
    window._electronApiDeclared = true;
  }

  const savedTheme = localStorage.getItem("theme") ?? "retro-teal";
  document.documentElement.dataset.theme = savedTheme;

  const el = byId<HTMLDivElement>("timer");
  if (!el) return;
  const timerEl: HTMLDivElement = el;

  const userInfo = byId<HTMLSpanElement>("userInfo");
  const profilePic = byId<HTMLImageElement>("profilePic");
  const cycleInfo = byId<HTMLDivElement>("cycleInfo");
  const startPauseBtn = byId<HTMLButtonElement>("startPauseBtn");
  const resetBtn = byId<HTMLButtonElement>("resetBtn");
  const settingsBtn = byId<HTMLButtonElement>("settingsBtn");

  const pseudo = localStorage.getItem("pseudo") ?? "";
  const avatar = localStorage.getItem("avatar") ?? "";
  if (userInfo) userInfo.textContent = pseudo ? `${pseudo}` : "";
  if (profilePic) profilePic.src = avatar;

  let duration = storage.getNumber("duration", 25);
  let breakDuration = storage.getNumber("breakDuration", 0.1); // keep it on 5min
  let cycles = storage.getNumber("cycles", 4);

  let currentCycle = 1;
  let isBreak = false;
  let timeLeft = duration * 60;
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let isRunning = false;

  const fmt = (n: number) => String(n).padStart(2, "0");

  function notify(title: string, body: string) {
    window.electronAPI.notify(title, body);
  }

  function playSound(file: string) {
    const sound = new Audio(`sounds/${file}`);
    void sound.play().catch((err) => console.error("play error:", err));
  }

  function updateTitle() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    const phase = isBreak ? "Break" : "Work";
    document.title = `${fmt(min)}:${fmt(sec)} • ${phase}`;
  }

  function updateDisplay() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    timerEl.textContent = `${fmt(min)}:${fmt(sec)}`;
    if (cycleInfo) {
      cycleInfo.textContent = `Cycle ${currentCycle} / ${cycles} ${isBreak ? "(Break)" : "(Work)"}`;
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
    if (timerInterval) return;

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
        playSound("end.wav");
        notify("⏸ Break time!", `Good job ${pseudo}! Take a ${breakDuration} min break.`);

        setTimeout(() => {
          updateDisplay();
          startTimer();
          isRunning = true;
          if (startPauseBtn) startPauseBtn.textContent = "Break";
        }, 1000);

      } else {
        // Break -> Work or End
        isBreak = false;
        currentCycle++;

        if (currentCycle > cycles) {
          // timerEl.textContent = "Pomodoro finished! 🍅";
          timeLeft = 0;
          isRunning = false;
          if (startPauseBtn) startPauseBtn.textContent = "Start";
          playSound("end.wav");
          notify("🍅 Pomodoro done!", `All ${cycles} cycles completed. Well done ${pseudo}!`);
          updateTitle();
          return;
        } else {
          timeLeft = duration * 60;
          // timerEl.textContent = "Go!";
          playSound("start.wav");
          notify("▶️ Back to work!", `Cycle ${currentCycle} / ${cycles} — let's focus!`);
          setTimeout(() => {
            updateDisplay();
            startTimer();
            isRunning = true;
            if (startPauseBtn) startPauseBtn.textContent = "Break";
          }, 1000);
        }
      }
    }, 1000);

    isRunning = true;
    if (startPauseBtn) startPauseBtn.textContent = "Break";
  }

  startPauseBtn?.addEventListener("click", () => {
    if (isRunning) {
      clearTimer();
      isRunning = false;
      if (startPauseBtn) startPauseBtn.textContent = "Start";
      updateTitle();
    } else {
      // Reset to first cycle if we were at the end of the last break
      if (currentCycle > cycles) {
        currentCycle = 1;
        isBreak = false;
        timeLeft = duration * 60;
        updateDisplay();
      }
      playSound("start.wav");
      startTimer();
    }
  });

  resetBtn?.addEventListener("click", () => {
    clearTimer();
    duration = storage.getNumber("duration", 25);
    breakDuration = storage.getNumber("breakDuration", 0.1);
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