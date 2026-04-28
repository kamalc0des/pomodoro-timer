import { byId } from "../utils/dom.js";
import { loadState, patchState } from "../utils/storage.js";
import { ACHIEVEMENTS, findAchievement, getMetricValue, getRankInfo } from "../utils/progression.js";
import { applyI18n, getLang, setLang, t } from "../utils/i18n.js";
import { applyEnterAnimation, navigateWithExit } from "../utils/animations.js";
import { renderIcon } from "../utils/iconRender.js";

(async function initProfilePage() {
  if (!window._electronApiDeclared) window._electronApiDeclared = true;

  let state = await loadState();
  document.documentElement.dataset.theme = state.preferences.theme;
  applyI18n();
  window.lucide?.createIcons();
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
  const rewardsJournal = byId<HTMLDivElement>("rewardsJournal");
  const backBtn = byId<HTMLButtonElement>("backBtn");
  const langToggle = byId<HTMLButtonElement>("langToggle");

  // Edit profile panel
  const editProfileBtn = byId<HTMLButtonElement>("editProfileBtn");
  const editProfilePanel = byId<HTMLDivElement>("editProfilePanel");
  const editAvatarPreview = byId<HTMLImageElement>("editAvatarPreview");
  const editAvatarInput = byId<HTMLInputElement>("editAvatarInput");
  const editPseudoInput = byId<HTMLInputElement>("editPseudoInput");
  const editError = byId<HTMLDivElement>("editError");
  const editCancelBtn = byId<HTMLButtonElement>("editCancelBtn");
  const editSaveBtn = byId<HTMLButtonElement>("editSaveBtn");
  let pendingAvatar = "";

  function refreshLangToggle() {
    if (langToggle) langToggle.textContent = getLang() === "en" ? "FR" : "EN";
  }

  function render() {
    if (profilePic) profilePic.src = state.profile.avatar;
    if (pseudoLabel) pseudoLabel.textContent = state.profile.pseudo;

    const info = getRankInfo(state.progression.xp);
    if (rankBadge) {
      rankBadge.innerHTML = `<span class="inline-flex items-center gap-1.5">
        <i data-lucide="${info.rank.lucideIcon}" class="w-4 h-4"></i>
        <span>${t(`rank.${info.rank.index}`)}</span>
      </span>`;
      rankBadge.style.background = info.rank.color;
      rankBadge.style.color = "#fff";
      window.lucide?.createIcons();
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
      const tierOrder = { d: 0, c: 1, b: 2, s: 3 } as const;
      const sorted = [...ACHIEVEMENTS].sort(
        (a, b) => tierOrder[a.tier] - tierOrder[b.tier],
      );
      achievementsGrid.innerHTML = sorted.map((a) => {
        const has = owned.has(a.id);
        const tierClass = has ? `ach-tier-${a.tier}` : "border-border/10";
        const desc = t(`ach.${a.id}.desc`);

        // Footer line: progress (if tracked & locked) + XP reward (always visible)
        let progressTag = "";
        if (a.track && !has) {
          const current = getMetricValue(state, a.track.metric);
          const display = Math.min(current, a.track.target);
          progressTag = `<span class="text-[9px] text-muted">${display} / ${a.track.target}</span>`;
        }
        const xpClass = has
          ? "text-green-400 font-bold"
          : "text-green-400/80";
        const xpTag = `<span class="text-[9px] ${xpClass}">+${a.xpReward} XP</span>`;

        const achIcon = renderIcon({
          iconPath: a.iconPath,
          fallback: a.icon,
          size: "md",
          alt: t(`ach.${a.id}.label`),
        });
        return `
          <div class="ach-card flex items-start gap-2 px-3 py-2 rounded-lg border ${tierClass} ${has ? "bg-surface/40" : "bg-surface/10"} relative">
            <span class="mt-0.5 ${has ? "" : "opacity-50"}">${achIcon}</span>
            <div class="text-left flex-1 min-w-0">
              <span class="block text-xs font-semibold truncate ${has ? "" : "opacity-60"}">${t(`ach.${a.id}.label`)}</span>
              <div class="ach-desc text-[10px] text-muted truncate ${has ? "" : "opacity-80"}">${desc}</div>
              <div class="flex items-center gap-2 mt-0.5">
                ${progressTag}
                ${xpTag}
              </div>
            </div>
          </div>
        `;
      }).join("");

      // Detect overflowing descriptions/labels and enable click-to-expand only on those
      achievementsGrid.querySelectorAll<HTMLElement>(".ach-card").forEach((card) => {
        const truncated = Array.from(card.querySelectorAll<HTMLElement>(".truncate"));
        const overflows = truncated.some((el) => el.scrollWidth > el.clientWidth);
        if (!overflows) return;
        card.classList.add("ach-expandable");
        card.addEventListener("click", () => card.classList.toggle("expanded"));
      });
    }

    if (rewardsJournal) {
      const log = state.progression.achievementsLog ?? [];
      if (log.length === 0) {
        rewardsJournal.innerHTML = `<div class="text-xs text-muted text-center py-3">${t("profile.journal.empty")}</div>`;
      } else {
        const sortedLog = [...log].sort((a, b) => b.at - a.at);
        const dateFormatter = new Intl.DateTimeFormat(getLang(), {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
        rewardsJournal.innerHTML = sortedLog.map((entry) => {
          const a = findAchievement(entry.id);
          if (!a) return "";
          const dateStr = dateFormatter.format(new Date(entry.at));
          const desc = t(`ach.${entry.id}.desc`);
          const journalIcon = renderIcon({
            iconPath: a.iconPath,
            fallback: a.icon,
            size: "md",
            alt: t(`ach.${entry.id}.label`),
          });
          return `
            <div data-tooltip="${escapeAttr(desc)}" class="flex items-center gap-3 p-2 rounded-lg border ach-tier-${a.tier} bg-surface/30">
              <span>${journalIcon}</span>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold truncate">${t(`ach.${entry.id}.label`)}</div>
                <div class="text-[10px] text-muted">${dateStr}</div>
              </div>
              <div class="text-xs text-green-400 font-bold whitespace-nowrap">+${entry.xp} XP</div>
            </div>
          `;
        }).join("");
      }
    }
  }

  render();
  refreshLangToggle();

  function openEditPanel() {
    if (!editProfilePanel) return;
    pendingAvatar = state.profile.avatar;
    if (editPseudoInput) editPseudoInput.value = state.profile.pseudo;
    if (editAvatarPreview) editAvatarPreview.src = state.profile.avatar;
    if (editError) editError.textContent = "";
    editProfilePanel.classList.remove("hidden");
  }

  function closeEditPanel() {
    if (!editProfilePanel) return;
    editProfilePanel.classList.add("hidden");
    if (editAvatarInput) editAvatarInput.value = "";
    if (editError) editError.textContent = "";
  }

  editProfileBtn?.addEventListener("click", () => {
    if (editProfilePanel?.classList.contains("hidden")) {
      openEditPanel();
    } else {
      closeEditPanel();
    }
  });

  editAvatarInput?.addEventListener("change", () => {
    const file = editAvatarInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result;
      if (typeof result === "string") {
        pendingAvatar = result;
        if (editAvatarPreview) editAvatarPreview.src = result;
      }
    };
    reader.readAsDataURL(file);
  });

  editCancelBtn?.addEventListener("click", () => closeEditPanel());

  editSaveBtn?.addEventListener("click", async () => {
    const pseudo = editPseudoInput?.value.trim() ?? "";
    if (!pseudo) {
      if (editError) editError.textContent = t("onboarding.identity.error.pseudo");
      return;
    }
    if (!pendingAvatar) {
      if (editError) editError.textContent = t("onboarding.identity.error.avatar");
      return;
    }
    state = await patchState({ profile: { pseudo, avatar: pendingAvatar } });
    closeEditPanel();
    render();
  });

  backBtn?.addEventListener("click", () => void navigateWithExit("timer.html"));

  langToggle?.addEventListener("click", async () => {
    const next = getLang() === "en" ? "fr" : "en";
    setLang(next);
    state = await patchState({ preferences: { language: next } });
    applyI18n();
    refreshLangToggle();
    render();
  });

  function escapeAttr(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
})();
