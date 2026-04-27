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

  interface Window {
    electronAPI: ElectronAPI;
    _electronApiDeclared?: boolean;
  }
}
