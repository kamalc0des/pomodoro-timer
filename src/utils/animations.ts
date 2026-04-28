/**
 * Page transition helpers powered by Motion One (window.Motion).
 * Reproduces the framer-motion feel for page enters/exits in our multi-page Electron app.
 */

const SPRING_OUT = { type: "spring", stiffness: 220, damping: 26, mass: 0.9 } as const;
const EASE_IN = { duration: 0.22, easing: [0.7, 0, 0.84, 0] } as const;

/**
 * Run when the renderer entry mounts. Slides + fades the body in.
 * Falls back to no animation if Motion isn't loaded yet.
 */
export function applyEnterAnimation(target: Element = document.body): void {
  const el = target as HTMLElement;
  if (!window.Motion?.animate) {
    el.style.opacity = "1";
    return;
  }
  window.Motion.animate(
    target,
    { opacity: [0, 1], y: [12, 0], filter: ["blur(2px)", "blur(0px)"] },
    SPRING_OUT,
  );
}

/**
 * Stagger-animate any direct children matching `selector` of `root`.
 * Use for stepped reveals (rank list, theme grid, etc.) — call after applyEnterAnimation.
 */
export function staggerChildren(root: ParentNode, selector: string, baseDelay = 0.05): void {
  if (!window.Motion?.animate || !window.Motion.stagger) return;
  const children = Array.from(root.querySelectorAll<HTMLElement>(selector));
  if (children.length === 0) return;
  window.Motion.animate(
    children,
    { opacity: [0, 1], y: [8, 0] },
    { ...SPRING_OUT, delay: window.Motion.stagger(baseDelay) },
  );
}

/**
 * Animate the body out, then call electron's navigate. Mimics framer-motion's exit + new page enter.
 */
export async function navigateWithExit(path: string): Promise<void> {
  if (window.Motion?.animate) {
    await window.Motion.animate(
      document.body,
      { opacity: [1, 0], y: [0, -6], filter: ["blur(0px)", "blur(2px)"] },
      EASE_IN,
    ).finished;
  }
  window.electronAPI.navigate(path);
}
