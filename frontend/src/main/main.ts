import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { DatabaseService } from '@notes/database';

// Initialize the database service
const dbService = new DatabaseService();

// Keep a global reference of the window object to avoid garbage collection
let mainWindow: BrowserWindow | null = null;

const isDevelopment = process.env.NODE_ENV === 'development';

async function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    // VS Code-like appearance
    backgroundColor: '#1e1e1e',
    titleBarStyle: 'hiddenInset',
  });

  // Load the app
  try {
    if (isDevelopment) {
      // Dev mode: load from webpack dev server
      await mainWindow.loadURL('http://localhost:3000');
      // Open DevTools
      mainWindow.webContents.openDevTools();
    } else {
      // Production: load local file
      await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
  } catch (error) {
    console.error('Failed to load URL:', error);
    app.quit();
  }

  // Window closed event handler
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize the app when ready
app.whenReady().then(async () => {
  try {
    // Connect to Redis
    await dbService.initialize();
    console.log('Connected to Redis successfully');

    // Create the main window
    await createWindow();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    app.quit();
  }
  
  // Log the environment
  console.log('Running in', process.env.NODE_ENV, 'mode');

  app.on('activate', async () => {
    // On macOS, recreate a window when dock icon is clicked and no windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  // Close database connection
  await dbService.close();
  console.log('Database connection closed');
});

// Database API endpoints for IPC communication

// Notes API
ipcMain.handle('notes:list', async () => {
  try {
    const noteService = dbService.getNoteService();
    return await noteService.listNotes();
  } catch (error) {
    console.error('Error listing notes:', error);
    throw error;
  }
});

ipcMain.handle('notes:get', async (_event, id: string) => {
  try {
    const noteService = dbService.getNoteService();
    return await noteService.getNote(id);
  } catch (error) {
    console.error(`Error getting note ${id}:`, error);
    throw error;
  }
});

ipcMain.handle('notes:create', async (_event, noteData: any) => {
  try {
    const noteService = dbService.getNoteService();
    return await noteService.createNote(noteData);
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
});

ipcMain.handle('notes:update', async (_event, id: string, noteData: any) => {
  try {
    const noteService = dbService.getNoteService();
    return await noteService.updateNote(id, noteData);
  } catch (error) {
    console.error(`Error updating note ${id}:`, error);
    throw error;
  }
});

ipcMain.handle('notes:delete', async (_event, id: string) => {
  try {
    const noteService = dbService.getNoteService();
    return await noteService.deleteNote(id);
  } catch (error) {
    console.error(`Error deleting note ${id}:`, error);
    throw error;
  }
});

ipcMain.handle('notes:getByTag', async (_event, tag: string) => {
  try {
    const noteService = dbService.getNoteService();
    return await noteService.findNotesByTag(tag);
  } catch (error) {
    console.error(`Error finding notes with tag ${tag}:`, error);
    throw error;
  }
});

ipcMain.handle('notes:getLinked', async (_event, noteId: string) => {
  try {
    const noteService = dbService.getNoteService();
    return await noteService.findLinkedNotes(noteId);
  } catch (error) {
    console.error(`Error finding notes linked to ${noteId}:`, error);
    throw error;
  }
});

// Tags API
ipcMain.handle('tags:list', async () => {
  try {
    const tagService = dbService.getTagService();
    return await tagService.listTags();
  } catch (error) {
    console.error('Error listing tags:', error);
    throw error;
  }
});

ipcMain.handle('tags:get', async (_event, id: string) => {
  try {
    const tagService = dbService.getTagService();
    return await tagService.getTag(id);
  } catch (error) {
    console.error(`Error getting tag ${id}:`, error);
    throw error;
  }
});

ipcMain.handle('tags:create', async (_event, tagData: any) => {
  try {
    const tagService = dbService.getTagService();
    return await tagService.createTag(tagData);
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
});

ipcMain.handle('tags:update', async (_event, id: string, tagData: any) => {
  try {
    const tagService = dbService.getTagService();
    return await tagService.updateTag(id, tagData);
  } catch (error) {
    console.error(`Error updating tag ${id}:`, error);
    throw error;
  }
});

ipcMain.handle('tags:delete', async (_event, id: string) => {
  try {
    const tagService = dbService.getTagService();
    return await tagService.deleteTag(id);
  } catch (error) {
    console.error(`Error deleting tag ${id}:`, error);
    throw error;
  }
});

ipcMain.handle('tags:findByName', async (_event, name: string) => {
  try {
    const tagService = dbService.getTagService();
    return await tagService.findTagByName(name);
  } catch (error) {
    console.error(`Error finding tag with name ${name}:`, error);
    throw error;
  }
});