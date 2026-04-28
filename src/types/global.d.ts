import type { AppState, StatePatch } from "./state";

export {};

declare global {
  interface ElectronAPI {
    navigate: (path: string) => void;
    notify: (title: string, body: string) => void;
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
    animate: (
      target: Element | Element[] | string,
      keyframes: Record<string, unknown> | Record<string, unknown>[],
      options?: Record<string, unknown>,
    ) => { finished: Promise<void> };
    stagger: (delay: number, options?: { start?: number; from?: string | number }) => unknown;
  }

  interface Window {
    electronAPI: ElectronAPI;
    _electronApiDeclared?: boolean;
    lucide: LucideGlobal;
    Motion: MotionGlobal;
  }
}
