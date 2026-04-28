/**
 * Reward modal shown at the end of a pomodoro session.
 * Animates a +XP counter ticking up and the XP bar filling from old → new
 * position, giving visible feedback for the session's gain.
 */

import { getRankInfo } from "./progression.js";
import { t } from "./i18n.js";

export interface SessionEndOptions {
  name: string;
  /** XP earned during the session (sum of result.gained.xp across pomodoros) */
  sessionXp: number;
  /** Total XP after the session ended (state.progression.xp) */
  finalXp: number;
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

export function showSessionEndModal(opts: SessionEndOptions): Promise<void> {
  return new Promise((resolve) => {
    const oldXp = Math.max(0, opts.finalXp - opts.sessionXp);
    const oldInfo = getRankInfo(oldXp);
    const newInfo = getRankInfo(opts.finalXp);
    const leveledUp = oldInfo.rank.index !== newInfo.rank.index;

    // When level-up happened during the session, animate the bar within the new
    // rank tier — start from 0% (the boundary that was just crossed).
    const oldPct = leveledUp ? 0 : Math.round(oldInfo.progress * 100);
    const newPct = Math.round(newInfo.progress * 100);

    const backdrop = document.createElement("div");
    backdrop.className =
      "fixed inset-0 bg-bg/80 backdrop-blur-sm z-[100] flex items-center justify-center px-6";

    const modal = document.createElement("div");
    modal.className =
      "bg-surface border border-border/30 rounded-xl p-6 max-w-sm w-full shadow-xl text-center";

    const title = t("session.end.title", { name: opts.name });
    const cta = t("session.end.cta");
    const rankLabel = t(`rank.${newInfo.rank.index}`);
    const remaining = newInfo.next ? Math.max(0, newInfo.xpForNext - newInfo.xpInRank) : 0;
    const progressLabel = newInfo.next
      ? t("session.end.toNext", { remaining })
      : t("session.end.maxRank", { xp: opts.finalXp });

    modal.innerHTML = `
      <h3 class="text-2xl font-bold font-display text-fg mb-4">${escapeHtml(title)}</h3>
      <div class="flex items-baseline justify-center gap-2 mb-4">
        <span id="endXpDelta" class="text-4xl font-bold font-display text-green-400 tabular-nums">+0</span>
        <span class="text-base text-muted">XP</span>
      </div>
      <div class="w-full h-2 bg-surface/50 rounded-full overflow-hidden mb-1.5">
        <div id="endXpFill" class="h-full bg-green-400 rounded-full" style="width: ${oldPct}%;"></div>
      </div>
      <p class="text-[11px] text-muted mb-3 text-center">${escapeHtml(progressLabel)}</p>
      <p class="text-xs text-muted mb-5 inline-flex items-center gap-1.5 justify-center">
        <i data-lucide="${newInfo.rank.lucideIcon}" class="w-3.5 h-3.5"></i>
        <span>${escapeHtml(rankLabel)}</span>
      </p>
      <button type="button" data-action="confirm"
        class="w-full bg-accent text-accentFg font-semibold py-2.5 px-4 rounded-lg shadow-md hover:opacity-90 transition text-sm">
        ${escapeHtml(cta)}
      </button>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    window.lucide?.createIcons();

    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKey);
      if (window.Motion?.animate) {
        const exitMotion = window.Motion.animate as unknown as (
          el: Element,
          kf: Record<string, unknown>,
          opts?: Record<string, unknown>,
        ) => { finished: Promise<void> };
        void exitMotion(backdrop, { opacity: [1, 0] }, { duration: 0.15 }).finished.then(
          () => backdrop.remove(),
        );
      } else {
        backdrop.remove();
      }
      resolve();
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter") close();
    }
    document.addEventListener("keydown", onKey);

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });
    modal
      .querySelector<HTMLButtonElement>('[data-action="confirm"]')
      ?.addEventListener("click", close);

    // Entrance: backdrop fade + modal spring scale/y
    if (window.Motion?.animate) {
      const elementMotion = window.Motion.animate as unknown as (
        el: Element,
        kf: Record<string, unknown>,
        opts?: Record<string, unknown>,
      ) => { finished: Promise<void> };
      elementMotion(backdrop, { opacity: [0, 1] }, { duration: 0.18 });
      elementMotion(
        modal,
        { opacity: [0, 1], scale: [0.95, 1], y: [10, 0] },
        { type: "spring", stiffness: 300, damping: 26 },
      );
    }

    // Bar fill + counter — start after a brief delay so the modal is settled
    const fill = modal.querySelector<HTMLDivElement>("#endXpFill");
    const delta = modal.querySelector<HTMLSpanElement>("#endXpDelta");
    setTimeout(() => {
      if (window.Motion?.animate) {
        const elementMotion = window.Motion.animate as unknown as (
          el: Element,
          kf: Record<string, unknown>,
          opts?: Record<string, unknown>,
        ) => { finished: Promise<void> };
        if (fill) {
          elementMotion(
            fill,
            { width: [`${oldPct}%`, `${newPct}%`] },
            { duration: 1.4, easing: [0.22, 0.65, 0.4, 1] },
          );
        }
        if (delta && opts.sessionXp > 0) {
          // Numerical tween — use Motion's (from, to, options) overload
          const numericMotion = window.Motion.animate as unknown as (
            from: number,
            to: number,
            options: { duration?: number; easing?: unknown; onUpdate?: (v: number) => void },
          ) => { finished: Promise<void> };
          numericMotion(0, opts.sessionXp, {
            duration: 1.4,
            easing: [0.22, 0.65, 0.4, 1],
            onUpdate: (v: number) => {
              delta.textContent = `+${Math.round(v)}`;
            },
          });
        } else if (delta) {
          delta.textContent = `+${opts.sessionXp}`;
        }
      } else {
        if (fill) fill.style.width = `${newPct}%`;
        if (delta) delta.textContent = `+${opts.sessionXp}`;
      }
    }, 350);
  });
}
