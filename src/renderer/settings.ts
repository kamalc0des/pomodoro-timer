import { byId } from "../utils/dom.js";
import { loadState, patchState, resetAppState } from "../utils/storage.js";
import { applyI18n, getLang, setLang, t } from "../utils/i18n.js";
import { mountRhythmPicker, type RhythmValues } from "../utils/rhythmPicker.js";
import { applyEnterAnimation, navigateWithExit } from "../utils/animations.js";
import { confirmDialog } from "../utils/confirmModal.js";

(async function initSettingsPage() {
  if (!window._electronApiDeclared) window._electronApiDeclared = true;

  const state = await loadState();
  const root = document.documentElement;
  root.dataset.theme = state.preferences.theme;
  applyI18n();
  window.lucide?.createIcons();
  applyEnterAnimation();

  const langToggle = byId<HTMLButtonElement>("langToggle");
  function refreshLangToggle() {
    if (langToggle) langToggle.textContent = getLang() === "en" ? "FR" : "EN";
  }
  refreshLangToggle();

  const themeButtons = document.querySelectorAll<HTMLButtonElement>(".theme-btn");
  function highlightActive(theme: string) {
    themeButtons.forEach((btn) => {
      const isActive = btn.dataset.theme === theme;
      btn.classList.toggle("ring-2", isActive);
      btn.classList.toggle("ring-accent", isActive);
      btn.classList.toggle("bg-surface/40", isActive);
    });
  }
  highlightActive(state.preferences.theme);

  let pendingTheme = state.preferences.theme;
  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme!;
      pendingTheme = theme;
      root.dataset.theme = theme;
      highlightActive(theme);
    });
  });

  const resetBtn = byId<HTMLButtonElement>("resetAppBtnSettings");
  resetBtn?.addEventListener("click", async () => {
    const ok = await confirmDialog({
      title: t("confirm.delete.title"),
      body: t("confirm.delete.body"),
      confirmLabel: t("confirm.delete.confirm"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!ok) return;
    await resetAppState();
    void navigateWithExit("onboarding.html");
  });

  const notifToggle = byId<HTMLInputElement>("notificationsToggle");
  if (notifToggle) {
    notifToggle.checked = state.preferences.notificationsEnabled;
  }

  const rhythmContainer = document.querySelector<HTMLDivElement>(".rhythm-picker");
  let rhythm: RhythmValues = {
    duration: state.preferences.duration,
    breakDuration: state.preferences.breakDuration,
    cycles: state.preferences.cycles,
  };
  if (rhythmContainer) {
    mountRhythmPicker(rhythmContainer, rhythm, (next) => {
      rhythm = next;
    });
  }

  const form = byId<HTMLFormElement>("settingsForm");
  const msg = byId<HTMLDivElement>("settingsMsg");
  const backBtn = byId<HTMLButtonElement>("backBtn");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (rhythm.duration <= 0 || rhythm.breakDuration <= 0 || rhythm.cycles <= 0) {
      if (msg) msg.textContent = t("settings.invalid");
      return;
    }

    await patchState({
      preferences: {
        duration: rhythm.duration,
        breakDuration: rhythm.breakDuration,
        cycles: rhythm.cycles,
        theme: pendingTheme,
        notificationsEnabled: notifToggle?.checked ?? true,
      },
    });

    const pageContent = byId<HTMLDivElement>("pageContent");
    const overlay = byId<HTMLDivElement>("savedOverlay");
    const icon = byId<HTMLDivElement>("savedIcon");
    const text = byId<HTMLParagraphElement>("savedText");
    if (pageContent) {
      pageContent.style.transition = "opacity 0.4s ease";
      pageContent.style.opacity = "0";
    }
    await new Promise((res) => setTimeout(res, 400));
    if (overlay) {
      overlay.style.transition = "opacity 0.4s ease";
      overlay.style.pointerEvents = "all";
      overlay.style.opacity = "1";
    }
    await new Promise((res) => setTimeout(res, 100));
    if (icon) {
      icon.style.transition = "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
      icon.style.transform = "scale(1)";
    }
    if (text) {
      text.style.transition = "opacity 0.4s ease";
      text.style.opacity = "1";
    }
    await new Promise((res) => setTimeout(res, 1200));
    void navigateWithExit("timer.html");
  });

  backBtn?.addEventListener("click", () => {
    void navigateWithExit("timer.html");
  });

  langToggle?.addEventListener("click", async () => {
    const next = getLang() === "en" ? "fr" : "en";
    setLang(next);
    await patchState({ preferences: { language: next } });
    applyI18n();
    refreshLangToggle();
    if (rhythmContainer) {
      mountRhythmPicker(rhythmContainer, rhythm, (n) => { rhythm = n; });
    }
  });
})();
