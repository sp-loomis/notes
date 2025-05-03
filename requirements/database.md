# Notes Application Database Specification

## Overview

The database package manages notes, their components, and tags in a hierarchical organization system. It will be implemented using SQLite with a TypeScript interface layer providing CRUD operations.

## Design Principles

- Use SQLite with the database file stored in the project root directory
- Design for extensibility, allowing new component types to be added easily
- Implement a clean TypeScript API that abstracts SQL operations
- Support hierarchical tag structures with recursive querying
- Version control for component content

## Database Schema

### Notes Table

| Column                 | Type     | Description                 |
| ---------------------- | -------- | --------------------------- |
| note_id                | INTEGER  | Primary key                 |
| title                  | TEXT     | Note title                  |
| created_datetime       | DATETIME | Creation timestamp          |
| last_modified_datetime | DATETIME | Last modification timestamp |

### Tags Table

| Column                 | Type     | Description                                      |
| ---------------------- | -------- | ------------------------------------------------ |
| tag_id                 | INTEGER  | Primary key                                      |
| parent_tag_id          | INTEGER  | Reference to parent tag (nullable for root tags) |
| name                   | TEXT     | Tag name                                         |
| color                  | TEXT     | Hex color code (e.g., "#FF5733")                 |
| created_datetime       | DATETIME | Creation timestamp                               |
| last_modified_datetime | DATETIME | Last modification timestamp                      |

### Note Tags Table

| Column           | Type     | Description                |
| ---------------- | -------- | -------------------------- |
| note_id          | INTEGER  | Foreign key to notes table |
| tag_id           | INTEGER  | Foreign key to tags table  |
| created_datetime | DATETIME | When tag was added to note |

### Note Components Table

| Column           | Type     | Description                                     |
| ---------------- | -------- | ----------------------------------------------- |
| component_id     | INTEGER  | Primary key                                     |
| note_id          | INTEGER  | Foreign key to notes table                      |
| name             | TEXT     | Component name                                  |
| type             | TEXT     | Component type (Markup, Image, GeoJSON, TLDraw) |
| created_datetime | DATETIME | Creation timestamp                              |

### Component Versions Table

| Column           | Type     | Description                     |
| ---------------- | -------- | ------------------------------- |
| version_id       | TEXT     | Primary key (hash of values)    |
| component_id     | INTEGER  | Foreign key to components table |
| content          | TEXT     | Component content               |
| version_datetime | DATETIME | Version timestamp               |

## Core API Functions

### Note Operations

- `createNote(title: string): Promise<number>` - Create new note, returns note ID
- `updateNote(noteId: number, title: string): Promise<boolean>` - Update note title
- `getNote(noteId: number): Promise<Note>` - Get note by ID
- `searchNotes(filters: Filter[]): Promise<Note[]>` - Search notes using filters
- `deleteNote(noteId: number): Promise<boolean>` - Delete note and its components

### Tag Operations

- `createTag(name: string, color: string, parentTagId?: number): Promise<number>` - Create tag
- `updateTag(tagId: number, data: {name?: string, color?: string, parentTagId?: number}): Promise<boolean>` - Update tag
- `getAllTags(): Promise<Tag[]>` - Get all tags
- `getChildTags(tagId: number): Promise<Tag[]>` - Get direct child tags
- `getTagHierarchy(tagId?: number): Promise<TagTree>` - Get tag hierarchy from specified root
- `deleteTag(tagId: number): Promise<boolean>` - Delete tag

### Note-Tag Operations

- `addTagToNote(noteId: number, tagId: number): Promise<boolean>` - Add tag to note
- `removeTagFromNote(noteId: number, tagId: number): Promise<boolean>` - Remove tag from note
- `getNoteTags(noteId: number): Promise<Tag[]>` - Get all tags for a note

### Component Operations

- `createComponent(noteId: number, name: string, type: string, initialContent: string): Promise<number>` - Create component
- `updateComponentContent(componentId: number, content: string): Promise<string>` - Create new version
- `getComponentVersions(componentId: number): Promise<ComponentVersion[]>` - Get all versions
- `getComponentVersion(versionId: string): Promise<ComponentVersion>` - Get specific version
- `getLatestComponentVersion(componentId: number): Promise<ComponentVersion>` - Get latest version
- `deleteComponent(componentId: number): Promise<boolean>` - Delete component and versions

## Filter System

Filters can be combined to create complex queries for note searches.

### Filter Types

#### Tag Filter

- Filter notes that have specific tags or any of their descendant tags
- Combines hierarchically using recursive queries

#### Content Filters

1. **Contains Filter**

   - Applicable to: Title, Markup component, TLDraw component
   - Checks if field contains a substring
   - UI: Text input field

2. **Like Filter**

   - Applicable to: Title, Markup component, TLDraw component
   - Pattern matching using SQL LIKE syntax
   - UI: Text input field

3. **After Filter**

   - Applicable to: Created datetime, Last modified datetime
   - Checks if datetime is after specified date
   - UI: Datetime selector
   - For last modified, uses latest of note or component modification dates

4. **Before Filter**
   - Applicable to: Created datetime, Last modified datetime
   - Checks if datetime is before specified date
   - UI: Datetime selector
   - For last modified, uses latest of note or component modification dates

## Component Types

### Markup Component

- Content format: HTML string
- Editor: Lexical

### Image Component

- Content format: Base64-encoded string
- Viewer: Native image renderer

### GeoJSON Component

- Content format: GeoJSON string
- Viewer/Editor: Leaflet

### TLDraw Component

- Content format: TLDraw JSON string (.tldr format)
- Viewer/Editor: TLDraw React component
- Note: Will be integrated in a later phase
