import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
// Re-enable database import since we're now using a mock implementation
import { initializeDatabase } from '../database';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  // Initialize database (now using mock implementation)
  await initializeDatabase();

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Log application paths for debugging
  console.log('Application paths:');
  console.log('__dirname:', __dirname);
  console.log('User data path:', app.getPath('userData'));
  console.log('App path:', app.getAppPath());
  console.log('Executable path:', process.execPath);

  // Load the app
  const startUrl = isDev
    ? `file://${path.join(__dirname, 'renderer/index.html')}` // Local build in dev mode
    : `file://${path.join(__dirname, 'renderer/index.html')}`; // Production build

  mainWindow.loadURL(startUrl);

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Dereference the window object when closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, re-create window when dock icon is clicked and no other windows open
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
