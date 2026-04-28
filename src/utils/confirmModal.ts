/**
 * Lightweight themed confirmation modal.
 * Returns a Promise<boolean> — true on confirm, false on cancel/backdrop/Escape.
 */

export interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
}

export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className =
      "fixed inset-0 bg-bg/80 backdrop-blur-sm z-[100] flex items-center justify-center px-6";

    const modal = document.createElement("div");
    modal.className =
      "bg-surface border border-border/30 rounded-xl p-5 max-w-sm w-full shadow-xl";

    const confirmClasses = opts.destructive
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-accent text-accentFg hover:opacity-90";

    modal.innerHTML = `
      <h3 class="text-lg font-bold font-display text-fg mb-2">${escapeHtml(opts.title)}</h3>
      ${opts.body ? `<p class="text-sm text-muted mb-4">${escapeHtml(opts.body)}</p>` : ""}
      <div class="flex gap-2 justify-end">
        <button type="button" data-action="cancel"
          class="bg-surface/40 border border-border/20 text-fg font-semibold py-2 px-4 rounded-lg hover:bg-surface/60 transition text-sm">
          ${escapeHtml(opts.cancelLabel)}
        </button>
        <button type="button" data-action="confirm"
          class="${confirmClasses} font-semibold py-2 px-4 rounded-lg shadow-md transition text-sm">
          ${escapeHtml(opts.confirmLabel)}
        </button>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    let closed = false;
    function close(result: boolean) {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKey);
      if (window.Motion?.animate) {
        void window.Motion.animate(
          backdrop,
          { opacity: [1, 0] },
          { duration: 0.15 },
        ).finished.then(() => backdrop.remove());
      } else {
        backdrop.remove();
      }
      resolve(result);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close(false);
      else if (e.key === "Enter") close(true);
    }
    document.addEventListener("keydown", onKey);

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close(false);
    });
    modal.querySelector<HTMLButtonElement>('[data-action="cancel"]')?.addEventListener("click", () => close(false));
    modal.querySelector<HTMLButtonElement>('[data-action="confirm"]')?.addEventListener("click", () => close(true));

    if (window.Motion?.animate) {
      window.Motion.animate(backdrop, { opacity: [0, 1] }, { duration: 0.18 });
      window.Motion.animate(
        modal,
        { opacity: [0, 1], scale: [0.95, 1], y: [8, 0] },
        { type: "spring", stiffness: 300, damping: 26 },
      );
    }
  });
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
