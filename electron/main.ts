import { app, BrowserWindow, ipcMain, Notification, shell } from "electron";
import { join } from "path";
import { getState, initFromOSLocale, updateState, resetState } from "./store";
import type { StatePatch } from "../src/types/state";

app.setAppUserModelId("com.pomodoro.minutor");

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged;

function htmlPath(page: string) {
  return isDev
    ? join(process.cwd(), "public", page)
    : join(app.getAppPath(), "public", page);
}

function iconPath() {
  return isDev
    ? join(process.cwd(), "assets", "icons", "icon.png")
    : join(process.resourcesPath, "assets", "icons", "icon.png");
}

function firstPage(): string {
  const { profile } = getState();
  return profile.onboarded ? "index.html" : "onboarding.html";
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: false,
    show: false,
    backgroundColor: "#ffffff",
    icon: iconPath(),
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenu(null);
  void mainWindow.loadFile(htmlPath(firstPage()));
  mainWindow.once("ready-to-show", () => mainWindow?.show());

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.setAppUserModelId(app.name);
  }
  initFromOSLocale();
  createWindow();
});

ipcMain.on("navigate", (_event, page: string) => {
  if (mainWindow && page) {
    void mainWindow.loadFile(htmlPath(page));
  }
});

ipcMain.on("open-external", (_event, url: string) => {
  if (typeof url === "string" && /^https?:\/\//i.test(url)) {
    void shell.openExternal(url);
  }
});

ipcMain.on("beep", () => {
  shell.beep();
});

ipcMain.on("notify", (_event, title: string, body: string) => {
  const { preferences } = getState();
  if (!preferences.notificationsEnabled) return;
  if (!Notification.isSupported()) {
    console.warn("[notify] Native notifications not supported on this system");
    return;
  }
  const notification = new Notification({
    title,
    body,
    icon: iconPath(),
    silent: false,
  });
  notification.on("click", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });
  notification.show();
});

ipcMain.handle("store:get", () => getState());
ipcMain.handle("store:update", (_event, patch: StatePatch) => updateState(patch));
ipcMain.handle("store:reset", () => resetState());

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
