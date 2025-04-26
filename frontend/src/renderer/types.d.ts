// Types for the contextBridge API
interface Window {
  api: {
    notes: {
      list: () => Promise<Note[]>;
      get: (id: string) => Promise<Note>;
      create: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
      update: (id: string, noteData: Partial<Omit<Note, 'id' | 'createdAt'>>) => Promise<Note>;
      delete: (id: string) => Promise<boolean>;
      getByTag: (tag: string) => Promise<Note[]>;
      getLinked: (noteId: string) => Promise<Note[]>;
    };
    tags: {
      list: () => Promise<Tag[]>;
      get: (id: string) => Promise<Tag>;
      create: (tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Tag>;
      update: (id: string, tagData: Partial<Omit<Tag, 'id' | 'createdAt'>>) => Promise<Tag>;
      delete: (id: string) => Promise<boolean>;
      findByName: (name: string) => Promise<Tag | null>;
    };
  };
}

// Data Models
interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Note extends Entity {
  title: string;
  content: NoteContent;
  tags: string[];
  links: NoteLink[];
}

interface NoteContent {
  html?: string;
  geojson?: GeoJSON;
  drawing?: Drawing;
  plainText?: string;
}

interface GeoJSON {
  type: string;
  features: Array<any>;
}

interface Drawing {
  elements: Array<any>;
  appState: any;
}

interface NoteLink {
  targetId: string;
  type: string;
  metadata?: any;
}

interface Tag extends Entity {
  name: string;
  color?: string;
  description?: string;
}