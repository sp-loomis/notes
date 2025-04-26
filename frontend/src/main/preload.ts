import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Notes API
  notes: {
    list: () => ipcRenderer.invoke('notes:list'),
    get: (id: string) => ipcRenderer.invoke('notes:get', id),
    create: (noteData: any) => ipcRenderer.invoke('notes:create', noteData),
    update: (id: string, noteData: any) => ipcRenderer.invoke('notes:update', id, noteData),
    delete: (id: string) => ipcRenderer.invoke('notes:delete', id),
    getByTag: (tag: string) => ipcRenderer.invoke('notes:getByTag', tag),
    getLinked: (noteId: string) => ipcRenderer.invoke('notes:getLinked', noteId),
  },
  
  // Tags API
  tags: {
    list: () => ipcRenderer.invoke('tags:list'),
    get: (id: string) => ipcRenderer.invoke('tags:get', id),
    create: (tagData: any) => ipcRenderer.invoke('tags:create', tagData),
    update: (id: string, tagData: any) => ipcRenderer.invoke('tags:update', id, tagData),
    delete: (id: string) => ipcRenderer.invoke('tags:delete', id),
    findByName: (name: string) => ipcRenderer.invoke('tags:findByName', name),
  },
});