# Notes App

A graph-based note-taking application with Electron frontend and Redis backend. Notes can contain HTML (Lexical), GeoJSON (Leaflet), and drawings (Excalidraw).

## Project Structure

This is a monorepo containing:

- **database**: Redis graph database and CRUD library
- **frontend**: Electron application with React UI
- **components**: (Future) Reusable components for Lexical, Leaflet, and Excalidraw integration

## Development Status

### Phase 1: ✅ Complete
- Redis graph database implementation
- CRUD operations for notes and tags
- Link relationships between notes
- Testing infrastructure

### Phase 2: 🔄 In Progress
- Basic Electron frontend
- VS Code-like UI
- Note, tag, and link management
- Search functionality

### Phase 3: 📅 Planned
- Integration of Lexical for rich text editing
- Integration of Leaflet for maps/GeoJSON
- Integration of Excalidraw for drawings
- Comprehensive UI improvements

## Getting Started

### Prerequisites

- Node.js (v16+)
- Redis server

### Database

```bash
cd database
npm install
npm test
```

Also check out the demo web UI for the database:

```bash
cd database/demo
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Features

- Create, edit, and delete notes
- Add tags to notes for organization
- Create links between notes with different relationship types
- Search through notes and tags
- View connected notes as a graph
- Dark and light themes

## License

MIT