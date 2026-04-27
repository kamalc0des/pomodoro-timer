import { byId } from "../utils/dom.js";
import { loadState, patchState } from "../utils/storage.js";
import { RANKS } from "../utils/progression.js";
import { applyI18n, getLang, setLang, t } from "../utils/i18n.js";
import { mountRhythmPicker } from "../utils/rhythmPicker.js";

(async function initOnboarding() {
  if (!window._electronApiDeclared) window._electronApiDeclared = true;

  const state = await loadState();
  document.documentElement.dataset.theme = state.preferences.theme;

  const TOTAL_STEPS = 7;
  let step = 0;

  const formData = {
    pseudo: state.profile.pseudo || "",
    avatar: state.profile.avatar || "",
    duration: state.preferences.duration || 25,
    breakDuration: state.preferences.breakDuration || 4,
    cycles: state.preferences.cycles || 4,
    theme: state.preferences.theme || "retro-teal",
    notificationsEnabled: state.preferences.notificationsEnabled,
  };

  const stepper = byId<HTMLDivElement>("stepper");
  const sections = Array.from(document.querySelectorAll<HTMLElement>(".step"));
  const prevBtn = byId<HTMLButtonElement>("prevBtn");
  const nextBtn = byId<HTMLButtonElement>("nextBtn");
  const langToggle = byId<HTMLButtonElement>("langToggle");

  function refreshNextLabel() {
    if (!nextBtn) return;
    nextBtn.textContent = step === TOTAL_STEPS - 1 ? t("onboarding.cta.final") : t("common.next");
  }

  function renderStepper() {
    if (!stepper) return;
    stepper.innerHTML = Array.from({ length: TOTAL_STEPS })
      .map((_, i) => {
        const cls =
          i === step
            ? "w-3 h-3 rounded-full bg-accent"
            : i < step
            ? "w-3 h-3 rounded-full bg-accent/50"
            : "w-3 h-3 rounded-full bg-surface/40";
        return `<span class="${cls}"></span>`;
      })
      .join("");
  }

  function showStep(i: number) {
    sections.forEach((s) => {
      const stepIdx = parseInt(s.dataset.step ?? "-1", 10);
      const visible = stepIdx === i;
      s.classList.toggle("hidden", !visible);
      if (visible) {
        s.classList.remove("step-active");
        void s.offsetWidth;
        s.classList.add("step-active");
      }
    });
    if (prevBtn) prevBtn.style.visibility = i === 0 ? "hidden" : "visible";
    if (i === TOTAL_STEPS - 1) refreshReadyName();
    refreshNextLabel();
    renderStepper();
  }

  function refreshLangToggle() {
    if (!langToggle) return;
    langToggle.textContent = getLang() === "en" ? "FR" : "EN";
  }

  function refreshReadyName() {
    const el = byId<HTMLHeadingElement>("readyTitle");
    if (el) el.textContent = t("onboarding.ready.title", { name: formData.pseudo });
  }

  // Step 2 — identity
  const pseudoInput = byId<HTMLInputElement>("pseudoInput");
  const avatarInput = byId<HTMLInputElement>("avatarInput");
  const avatarPreview = byId<HTMLImageElement>("avatarPreview");
  const identityError = byId<HTMLDivElement>("identityError");

  if (pseudoInput) pseudoInput.value = formData.pseudo;
  if (avatarPreview && formData.avatar) avatarPreview.src = formData.avatar;

  pseudoInput?.addEventListener("input", () => {
    formData.pseudo = pseudoInput.value.trim();
  });

  avatarInput?.addEventListener("change", () => {
    const file = avatarInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result;
      if (typeof result === "string") {
        formData.avatar = result;
        if (avatarPreview) avatarPreview.src = result;
      }
    };
    reader.readAsDataURL(file);
  });

  // Step 3 — rhythm picker (shared component)
  const rhythmContainer = document.querySelector<HTMLDivElement>(".rhythm-picker");
  if (rhythmContainer) {
    mountRhythmPicker(
      rhythmContainer,
      {
        duration: formData.duration,
        breakDuration: formData.breakDuration,
        cycles: formData.cycles,
      },
      (next) => {
        formData.duration = next.duration;
        formData.breakDuration = next.breakDuration;
        formData.cycles = next.cycles;
      },
    );
  }

  // Step 4 — notifications
  const notifToggle = byId<HTMLInputElement>("notifToggle");
  const testNotifBtn = byId<HTMLButtonElement>("testNotifBtn");
  if (notifToggle) {
    notifToggle.checked = formData.notificationsEnabled;
    notifToggle.addEventListener("change", async () => {
      formData.notificationsEnabled = notifToggle.checked;
      await patchState({ preferences: { notificationsEnabled: notifToggle.checked } });
    });
  }
  testNotifBtn?.addEventListener("click", async () => {
    await patchState({ preferences: { notificationsEnabled: true } });
    if (notifToggle) notifToggle.checked = true;
    formData.notificationsEnabled = true;
    window.electronAPI.notify(t("notif.test.title"), t("notif.test.body"));
  });

  // Step 5 — theme
  const themeButtons = document.querySelectorAll<HTMLButtonElement>(".theme-btn");
  function highlightTheme(theme: string) {
    themeButtons.forEach((btn) => {
      const active = btn.dataset.theme === theme;
      btn.classList.toggle("ring-2", active);
      btn.classList.toggle("ring-accent", active);
      btn.classList.toggle("bg-surface/40", active);
    });
  }
  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme!;
      formData.theme = theme;
      document.documentElement.dataset.theme = theme;
      highlightTheme(theme);
    });
  });
  highlightTheme(formData.theme);

  // Step 6 — RPG intro
  function renderRankList() {
    const rankList = byId<HTMLDivElement>("rankList");
    if (!rankList) return;
    rankList.innerHTML = RANKS.map(
      (r) => `
      <div class="flex items-center gap-3 px-3 py-1.5 rounded-md bg-surface/20">
        <span class="text-lg">${r.emoji}</span>
        <span class="font-semibold flex-1">${t(`rank.${r.index}`)}</span>
        <span class="text-xs text-muted">${r.threshold} XP</span>
      </div>`,
    ).join("");
  }

  function validateStep(i: number): string | null {
    if (i === 1) {
      if (!formData.pseudo) return t("onboarding.identity.error.pseudo");
      if (!formData.avatar) return t("onboarding.identity.error.avatar");
    }
    return null;
  }

  prevBtn?.addEventListener("click", () => {
    if (step > 0) {
      step--;
      showStep(step);
    }
  });

  nextBtn?.addEventListener("click", async () => {
    const err = validateStep(step);
    if (err) {
      if (identityError) identityError.textContent = err;
      return;
    }
    if (identityError) identityError.textContent = "";

    if (step === TOTAL_STEPS - 1) {
      await patchState({
        profile: {
          pseudo: formData.pseudo,
          avatar: formData.avatar,
          onboarded: true,
          createdAt: state.profile.createdAt || Date.now(),
        },
        preferences: {
          duration: formData.duration,
          breakDuration: formData.breakDuration,
          cycles: formData.cycles,
          theme: formData.theme,
          notificationsEnabled: formData.notificationsEnabled,
        },
      });
      window.electronAPI.navigate("timer.html");
      return;
    }

    step++;
    showStep(step);
  });

  langToggle?.addEventListener("click", async () => {
    const next = getLang() === "en" ? "fr" : "en";
    setLang(next);
    await patchState({ preferences: { language: next } });
    applyI18n();
    refreshLangToggle();
    refreshNextLabel();
    renderRankList();
    refreshReadyName();
  });

  applyI18n();
  refreshLangToggle();
  renderRankList();
  showStep(0);
})();
