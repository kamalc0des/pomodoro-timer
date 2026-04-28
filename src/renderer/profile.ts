import { byId } from "../utils/dom.js";
import { loadState, patchState } from "../utils/storage.js";
import { ACHIEVEMENTS, getRankInfo } from "../utils/progression.js";
import { applyI18n, getLang, setLang, t } from "../utils/i18n.js";
import { applyEnterAnimation, navigateWithExit } from "../utils/animations.js";

(async function initProfilePage() {
  if (!window._electronApiDeclared) window._electronApiDeclared = true;

  let state = await loadState();
  document.documentElement.dataset.theme = state.preferences.theme;
  applyI18n();
  applyEnterAnimation();

  const profilePic = byId<HTMLImageElement>("profilePic");
  const pseudoLabel = byId<HTMLHeadingElement>("pseudoLabel");
  const rankBadge = byId<HTMLDivElement>("rankBadge");
  const xpFill = byId<HTMLDivElement>("xpFill");
  const xpLabel = byId<HTMLDivElement>("xpLabel");
  const rankFromLabel = byId<HTMLSpanElement>("rankFromLabel");
  const rankToLabel = byId<HTMLSpanElement>("rankToLabel");
  const statPomodoros = byId<HTMLDivElement>("statPomodoros");
  const statMinutes = byId<HTMLDivElement>("statMinutes");
  const statStreak = byId<HTMLDivElement>("statStreak");
  const missionCard = byId<HTMLDivElement>("missionCard");
  const achievementsGrid = byId<HTMLDivElement>("achievementsGrid");
  const backBtn = byId<HTMLButtonElement>("backBtn");
  const langToggle = byId<HTMLButtonElement>("langToggle");

  function refreshLangToggle() {
    if (langToggle) langToggle.textContent = getLang() === "en" ? "FR" : "EN";
  }

  function render() {
    if (profilePic) profilePic.src = state.profile.avatar;
    if (pseudoLabel) pseudoLabel.textContent = state.profile.pseudo;

    const info = getRankInfo(state.progression.xp);
    if (rankBadge) {
      rankBadge.textContent = `${info.rank.emoji} ${t(`rank.${info.rank.index}`)}`;
      rankBadge.style.background = info.rank.color;
      rankBadge.style.color = "#fff";
    }
    if (rankFromLabel) rankFromLabel.textContent = t(`rank.${info.rank.index}`);
    if (rankToLabel) rankToLabel.textContent = info.next ? t(`rank.${info.next.index}`) : t("profile.rank.max");
    if (xpFill) {
      xpFill.style.width = `${Math.round(info.progress * 100)}%`;
      xpFill.style.background = info.rank.color;
    }
    if (xpLabel) {
      xpLabel.textContent = info.next
        ? t("profile.xp.next", { cur: info.xpInRank, total: info.xpForNext, sum: state.progression.xp })
        : t("profile.xp.max", { xp: state.progression.xp });
    }

    if (statPomodoros) statPomodoros.textContent = String(state.progression.pomodorosCompleted);
    if (statMinutes) statMinutes.textContent = String(state.progression.totalFocusMinutes);
    if (statStreak) statStreak.textContent = String(state.progression.streakDays);

    if (missionCard) {
      const m = state.dailyMission;
      if (!m.target) {
        missionCard.textContent = t("profile.mission.empty");
      } else if (m.completed) {
        missionCard.innerHTML = t("profile.mission.done");
      } else {
        missionCard.innerHTML = t("profile.mission.progress", {
          progress: m.progress,
          target: m.target,
        });
      }
    }

    if (achievementsGrid) {
      const owned = new Set(state.progression.achievements);
      achievementsGrid.innerHTML = ACHIEVEMENTS.map((a) => {
        const has = owned.has(a.id);
        return `
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg border ${has ? "border-accent/40 bg-surface/40" : "border-border/10 bg-surface/10 opacity-40"}">
            <span class="text-xl">${a.icon}</span>
            <div class="text-left">
              <div class="text-xs font-semibold">${t(`ach.${a.id}.label`)}</div>
              <div class="text-[10px] text-muted">${t(`ach.${a.id}.desc`)}</div>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  render();
  refreshLangToggle();

  backBtn?.addEventListener("click", () => void navigateWithExit("timer.html"));

  langToggle?.addEventListener("click", async () => {
    const next = getLang() === "en" ? "fr" : "en";
    setLang(next);
    state = await patchState({ preferences: { language: next } });
    applyI18n();
    refreshLangToggle();
    render();
  });
})();
