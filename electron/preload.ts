import { contextBridge, ipcRenderer } from "electron";
import type { AppState, StatePatch } from "../src/types/state";

contextBridge.exposeInMainWorld("electronAPI", {
  navigate: (path: string) => ipcRenderer.send("navigate", path),
  notify: (title: string, body: string) => ipcRenderer.send("notify", title, body),
  openExternal: (url: string) => ipcRenderer.send("open-external", url),
  beep: () => ipcRenderer.send("beep"),
  store: {
    get: (): Promise<AppState> => ipcRenderer.invoke("store:get"),
    update: (patch: StatePatch): Promise<AppState> => ipcRenderer.invoke("store:update", patch),
    reset: (): Promise<AppState> => ipcRenderer.invoke("store:reset"),
  },
});
