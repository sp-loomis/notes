# Notes App Frontend

Electron-based frontend for the Notes application, providing a VS Code-like interface for managing notes, tags, and links.

## Features

- **Note Management**
  - Create, read, update, and delete notes
  - Plain text content editing
  - Tagging system for organizing notes
  - Linking between notes with relationship types

- **Tag Management**
  - Create, edit, and delete tags
  - Assign colors to tags for visual organization
  - Filter notes by tag

- **Search Functionality**
  - Full-text search across notes and tags
  - Highlighted search results

- **User Interface**
  - VS Code-inspired interface
  - Dark and light themes
  - Collapsible sidebar with multiple views
  - Resizable panels

## Technology Stack

- **Electron**: Cross-platform desktop application framework
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Redux**: State management
- **Styled Components**: CSS-in-JS styling
- **Redis**: Backend database via @notes/database

## Getting Started

1. Make sure Redis is running:
   ```bash
   redis-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development environment:
   ```bash
   npm run dev
   ```

4. Build the production version:
   ```bash
   npm run build
   ```

5. Run the production build:
   ```bash
   npm start
   ```

## Project Structure

- `src/main`: Electron main process code
- `src/renderer`: React application code
  - `components`: UI components
  - `store`: Redux store and slices
  - `styles`: Global styles
  - `utils`: Utility functions
  - `types.d.ts`: TypeScript type definitions

## Future Enhancements

This is Phase 2 of the project. In Phase 3, we'll integrate:
- Lexical for rich text editing
- Leaflet for map/GeoJSON support
- Excalidraw for drawings