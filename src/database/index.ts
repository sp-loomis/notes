// This is a temporary stub for the database module
// It will be replaced with the actual implementation once we're ready
// to re-enable database functionality

import { Note, CreateNoteData, UpdateNoteData } from './models/note';
import { Tag, CreateTagData, UpdateTagData } from './models/tag';
import {
  Component,
  CreateComponentData,
  UpdateComponentData,
  ComponentType,
} from './models/component';
import { ComponentVersion } from './models/component-version';

// Mock data for UI development
const mockNotes: Note[] = [
  {
    id: 1,
    title: 'Getting Started',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 2,
    title: 'Research Notes',
    createdAt: new Date('2025-02-15'),
    updatedAt: new Date('2025-03-20'),
  },
  {
    id: 3,
    title: 'Project Ideas',
    createdAt: new Date('2025-04-10'),
    updatedAt: new Date('2025-04-10'),
  },
];

const mockTags: Tag[] = [
  {
    id: 1,
    name: 'Personal',
    color: '#4299e1',
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Work',
    color: '#48bb78',
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: 'Ideas',
    color: '#ed8936',
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockComponents: Component[] = [
  {
    id: 1,
    noteId: 1,
    name: 'Introduction',
    type: ComponentType.Markup,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    noteId: 1,
    name: 'Quick Tips',
    type: ComponentType.Markup,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    noteId: 2,
    name: 'Literature Review',
    type: ComponentType.Markup,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockVersions: ComponentVersion[] = [
  { id: 'v1', componentId: 1, content: 'Welcome to the notes application!', createdAt: new Date() },
  {
    id: 'v2',
    componentId: 2,
    content: 'Here are some quick tips to get started...',
    createdAt: new Date(),
  },
  {
    id: 'v3',
    componentId: 3,
    content: 'Literature review content goes here...',
    createdAt: new Date(),
  },
];

// Mock repositories for UI development
export const noteRepository = {
  getAllNotes: () => Promise.resolve([...mockNotes]),
  getNoteById: (id: number) => Promise.resolve(mockNotes.find((note) => note.id === id) || null),
  findNotesByTags: (tagIds: number[]) =>
    Promise.resolve(mockNotes.filter((note) => note.id % 2 === 0)),
  findNotesByAllTags: (tagIds: number[]) =>
    Promise.resolve(mockNotes.filter((note) => note.id % 3 === 0)),
  findNotesByAnyTags: (tagIds: number[], includeDescendants?: boolean) =>
    Promise.resolve([...mockNotes]),
  createNote: (data: CreateNoteData) => {
    const newId = Math.max(...mockNotes.map((n) => n.id), 0) + 1;
    mockNotes.push({
      id: newId,
      title: data.title,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return Promise.resolve(newId);
  },
  updateNote: (id: number, data: UpdateNoteData) => {
    const index = mockNotes.findIndex((note) => note.id === id);
    if (index >= 0) {
      mockNotes[index] = {
        ...mockNotes[index],
        ...data,
        updatedAt: new Date(),
      };
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },
  deleteNote: (id: number) => {
    const index = mockNotes.findIndex((note) => note.id === id);
    if (index >= 0) {
      mockNotes.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },
};

export const tagRepository = {
  getAllTags: () => Promise.resolve([...mockTags]),
  getTagById: (id: number) => Promise.resolve(mockTags.find((tag) => tag.id === id) || null),
  getTagHierarchy: () => Promise.resolve([...mockTags]),
  getAncestors: (tagId: number) => Promise.resolve([]),
  getDescendants: (tagId: number) => Promise.resolve([]),
  createTag: (data: CreateTagData) => {
    const newId = Math.max(...mockTags.map((t) => t.id), 0) + 1;
    mockTags.push({
      id: newId,
      name: data.name,
      color: data.color || '#4299e1',
      parentId: data.parentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return Promise.resolve(newId);
  },
  updateTag: (id: number, data: UpdateTagData) => {
    const index = mockTags.findIndex((tag) => tag.id === id);
    if (index >= 0) {
      mockTags[index] = {
        ...mockTags[index],
        ...data,
        updatedAt: new Date(),
      };
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },
  deleteTag: (id: number) => {
    const index = mockTags.findIndex((tag) => tag.id === id);
    if (index >= 0) {
      mockTags.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },
  getTagsForNote: (noteId: number) => Promise.resolve([...mockTags].slice(0, 2)),
  addTagToNote: (noteId: number, tagId: number) => Promise.resolve(true),
  removeTagFromNote: (noteId: number, tagId: number) => Promise.resolve(true),
};

export const componentRepository = {
  createComponent: (data: CreateComponentData) => {
    const newId = Math.max(...mockComponents.map((c) => c.id), 0) + 1;
    mockComponents.push({
      id: newId,
      noteId: data.noteId,
      name: data.name,
      type: data.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return Promise.resolve(newId);
  },
  getComponentById: (id: number) =>
    Promise.resolve(mockComponents.find((comp) => comp.id === id) || null),
  getComponentsByNoteId: (noteId: number) =>
    Promise.resolve(mockComponents.filter((comp) => comp.noteId === noteId)),
  updateComponent: (id: number, data: UpdateComponentData) => {
    const index = mockComponents.findIndex((comp) => comp.id === id);
    if (index >= 0) {
      mockComponents[index] = {
        ...mockComponents[index],
        ...data,
        updatedAt: new Date(),
      };
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },
  deleteComponent: (id: number) => {
    const index = mockComponents.findIndex((comp) => comp.id === id);
    if (index >= 0) {
      mockComponents.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },
  createComponentVersion: (componentId: number, content: string) => {
    const newId = `v${mockVersions.length + 1}`;
    mockVersions.push({
      id: newId,
      componentId,
      content,
      createdAt: new Date(),
    });
    return Promise.resolve(newId);
  },
  getComponentVersions: (componentId: number) =>
    Promise.resolve(mockVersions.filter((ver) => ver.componentId === componentId)),
  getComponentVersion: (versionId: string) =>
    Promise.resolve(mockVersions.find((ver) => ver.id === versionId) || null),
  getLatestComponentVersion: (componentId: number) => {
    const versions = mockVersions
      .filter((ver) => ver.componentId === componentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return Promise.resolve(versions.length > 0 ? versions[0] : null);
  },
};

// Mock database initialization
export async function initializeDatabase(): Promise<void> {
  console.log('Mock database initialized for UI development');
  return Promise.resolve();
}

export default {};
