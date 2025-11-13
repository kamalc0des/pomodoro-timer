import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";

let mainWindow: BrowserWindow | null = null;
const isDev = !app.isPackaged;

function htmlPath(page: string) {
  return isDev
    ? join(process.cwd(), "public", page) // dev
    : join(app.getAppPath(), "public", page); // prod: app.asar/public
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 350,
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

  // Dev tools only in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(() => {
  createWindow();
});

ipcMain.on("navigate", (_event, page: string) => {
  if (mainWindow && page) {
    void mainWindow.loadFile(htmlPath(page));
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
