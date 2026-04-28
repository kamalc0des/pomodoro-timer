import { byId } from "../utils/dom.js";
import { loadState, patchState, resetAppState } from "../utils/storage.js";
import { applyI18n, getLang, t } from "../utils/i18n.js";
import { applyEnterAnimation, navigateWithExit } from "../utils/animations.js";
import { confirmDialog } from "../utils/confirmModal.js";

(async function initIndexPage() {
  if (!window._electronApiDeclared) window._electronApiDeclared = true;

  const state = await loadState();

  if (!state.profile.onboarded) {
    window.electronAPI.navigate("onboarding.html");
    return;
  }

  document.documentElement.dataset.theme = state.preferences.theme;
  applyI18n();
  applyEnterAnimation();

  const startBtn = byId<HTMLButtonElement>("startBtn");
  const resetAppBtn = byId<HTMLButtonElement>("resetAppBtn");
  const welcomeDiv = byId<HTMLDivElement>("welcome");
  const langToggle = byId<HTMLButtonElement>("langToggle");

  if (!startBtn || !resetAppBtn) return;

  function renderWelcome() {
    if (!welcomeDiv) return;
    welcomeDiv.innerHTML = `
      <img src="${state.profile.avatar}" class="w-20 h-20 rounded-full mb-3 shadow-lg border-2 border-accent" alt="Avatar" />
      <h2 class="text-xl font-bold font-display">${t("index.welcome.back", { name: state.profile.pseudo })}</h2>
      <p class="text-sm text-muted mt-1">${t("index.welcome.subtitle")}</p>
    `;
  }

  function refreshLangToggle() {
    if (langToggle) {
      const lang = getLang();
      langToggle.textContent = lang === "en" ? "FR" : "EN";
    }
  }

  renderWelcome();
  refreshLangToggle();

  startBtn.addEventListener("click", () => {
    startBtn.textContent = t("common.loading");
    void navigateWithExit("timer.html");
  });

  resetAppBtn.addEventListener("click", async () => {
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

  langToggle?.addEventListener("click", async () => {
    const next = getLang() === "en" ? "fr" : "en";
    await patchState({ preferences: { language: next } });
    renderWelcome();
    refreshLangToggle();
  });
})();
