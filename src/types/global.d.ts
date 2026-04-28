import type { AppState, StatePatch } from "./state";

export {};

declare global {
  interface ElectronAPI {
    navigate: (path: string) => void;
    notify: (title: string, body: string) => void;
    openExternal: (url: string) => void;
    beep: () => void;
    store: {
      get: () => Promise<AppState>;
      update: (patch: StatePatch) => Promise<AppState>;
      reset: () => Promise<AppState>;
    };
  }

  interface LucideGlobal {
    createIcons: (options?: {
      icons?: Record<string, unknown>;
      nameAttr?: string;
      attrs?: Record<string, string>;
    }) => void;
  }

  interface MotionGlobal {
    /**
     * Motion One animate() — overloaded:
     * - animate(target, keyframes, options) for DOM
     * - animate(from, to, options) for numerical tweens (use options.onUpdate)
     */
    animate: (
      ...args: unknown[]
    ) => { finished: Promise<void>; cancel?: () => void };
    stagger: (delay: number, options?: { start?: number; from?: string | number }) => unknown;
  }

  interface Window {
    electronAPI: ElectronAPI;
    _electronApiDeclared?: boolean;
    lucide: LucideGlobal;
    Motion: MotionGlobal;
    __sim?: import("../utils/devFixtures.js").DevSimAPI;
  }
}
