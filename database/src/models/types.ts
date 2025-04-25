/**
 * Core data models for the note-taking application
 */

// Base interface for all entities
export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Note entity representing a single note
export interface Note extends Entity {
  title: string;
  content: NoteContent;
  tags: string[];
  links: NoteLink[];
}

// Different types of content a note can contain
export interface NoteContent {
  html?: string;        // Lexical editor content
  geojson?: GeoJSON;    // Leaflet map data
  drawing?: Drawing;    // Excalidraw drawing
  plainText?: string;   // Plain text content
}

// GeoJSON structure for map data
export interface GeoJSON {
  type: string;
  features: Array<any>; // GeoJSON feature collection
}

// Drawing data structure
export interface Drawing {
  elements: Array<any>; // Excalidraw elements
  appState: any;        // Excalidraw app state
}

// Link between notes
export interface NoteLink {
  targetId: string;     // ID of the target note
  type: string;         // Type of relationship
  metadata?: any;       // Additional metadata about the link
}

// Tag entity
export interface Tag extends Entity {
  name: string;
  color?: string;
  description?: string;
}