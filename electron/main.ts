import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import notifier from "node-notifier";

app.setAppUserModelId("com.pomodoro.minutor");

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged;

function htmlPath(page: string) {
  return isDev
    ? join(process.cwd(), "public", page)
    : join(app.getAppPath(), "public", page);
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    resizable: false,
    show: false,
    backgroundColor: "#ffffff",
    icon: join(__dirname, "icon"),
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenu(null);
  void mainWindow.loadFile(htmlPath("index.html"));
  mainWindow.once("ready-to-show", () => mainWindow?.show());

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.setAppUserModelId(app.name);
  }
  createWindow();
});

ipcMain.on("navigate", (_event, page: string) => {
  if (mainWindow && page) {
    void mainWindow.loadFile(htmlPath(page));
  }
});

ipcMain.on("notify", (_event, title: string, body: string) => {
  notifier.notify({
    title,
    message: body,
    sound: false,
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});