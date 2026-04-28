import { byId } from "../utils/dom.js";
import { loadState } from "../utils/storage.js";
import { FIXTURES, loadFixture, resetSim } from "../utils/devFixtures.js";
import { applyEnterAnimation, navigateWithExit } from "../utils/animations.js";

(async function initDevPage() {
  if (!window._electronApiDeclared) window._electronApiDeclared = true;

  const state = await loadState();
  document.documentElement.dataset.theme = state.preferences.theme;
  applyEnterAnimation();

  const list = byId<HTMLDivElement>("fixtureList");
  const closeBtn = byId<HTMLButtonElement>("closeBtn");
  const resetBtn = byId<HTMLButtonElement>("resetBtn");

  if (list) {
    list.innerHTML = FIXTURES.map(
      (f) => `
        <button type="button" data-fixture="${f.name}"
          class="text-left flex flex-col gap-1 p-3 rounded-lg border border-border/20 bg-surface/30 hover:bg-surface/50 transition">
          <div class="flex justify-between items-center">
            <span class="text-sm font-bold font-display">${f.label}</span>
            <span class="text-[10px] uppercase tracking-wider text-muted">${f.name}</span>
          </div>
          <span class="text-[11px] text-muted leading-snug">${f.description}</span>
          <div class="flex gap-3 text-[10px] text-muted mt-1">
            <span>🍅 ${f.pomodorosCompleted}</span>
            <span>⏱ ${Math.floor(f.totalFocusMinutes / 60)}h${f.totalFocusMinutes % 60 ? ` ${f.totalFocusMinutes % 60}m` : ""}</span>
            <span>🔥 ${f.streakDays}j</span>
            <span class="text-accent font-bold">${f.xp} XP</span>
            <span>🏆 ${f.achievements.length}</span>
          </div>
        </button>
      `,
    ).join("");

    list.querySelectorAll<HTMLButtonElement>("[data-fixture]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const name = btn.dataset.fixture!;
        await loadFixture(name);
        void navigateWithExit("profile.html");
      });
    });
  }

  resetBtn?.addEventListener("click", async () => {
    if (!confirm("Reset complet ? Tu reviendras à l'onboarding.")) return;
    await resetSim();
    void navigateWithExit("onboarding.html");
  });

  closeBtn?.addEventListener("click", () => void navigateWithExit("timer.html"));
})();
