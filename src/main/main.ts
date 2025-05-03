import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as isDev from "electron-is-dev";
import { initializeDatabase } from "../database";

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  // Initialize database
  await initializeDatabase();

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the app
  const startUrl = isDev
    ? "http://localhost:3000" // Dev server URL
    : `file://${path.join(__dirname, "../renderer/index.html")}`; // Production build

  mainWindow.loadURL(startUrl);

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Dereference the window object when closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// On macOS, re-create window when dock icon is clicked and no other windows open
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
