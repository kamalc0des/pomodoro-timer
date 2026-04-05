export {};

declare global {
  interface ElectronAPI {
    navigate: (path: string) => void;
    notify: (title: string, body: string) => void;
  }

  interface Window {
    electronAPI: ElectronAPI;
    _electronApiDeclared?: boolean;
  }
}
