# Notes Application

A desktop note-taking application built with Electron and React. This application allows for hierarchical organization of notes with tags, and supports various component types including rich text (Lexical), maps (GeoJSON/Leaflet), and drawings (Excalidraw).

## Features

- Hierarchical tag organization
- Rich text editing with Lexical
- Map components with Leaflet
- Drawing components with Excalidraw
- Component versioning
- Advanced search and filtering capabilities

## Development Setup

### Prerequisites

- Node.js (v16+)
- npm (v7+)

### Installation

1. Clone the repository

   ```
   git clone <repository-url>
   cd notes
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Build the application

   ```
   npm run build
   ```

4. Start the development server
   ```
   npm run dev
   ```

### Project Structure

```
notes/
├── dist/                  # Compiled output
├── requirements/          # Project requirements
├── src/
│   ├── database/          # Database layer
│   │   ├── migrations/    # Database migrations
│   │   └── models/        # Database models
│   ├── main/              # Electron main process
│   └── renderer/          # React frontend
│       ├── components/    # React components
│       ├── pages/         # Page components
│       └── styles/        # CSS styles
└── tests/                 # Unit and integration tests
```

### Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm test` - Run tests
- `npm run lint` - Run linting checks
- `npm run format` - Format code with Prettier
- `npm run package` - Package the application for distribution

## Database Schema

The application uses SQLite to store:

- Notes with title and metadata
- Tags with hierarchical relationships
- Note components of various types
- Component versions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/xyz`)
3. Commit your changes (`git commit -m 'Add xyz feature'`)
4. Push to the branch (`git push origin feature/xyz`)
5. Open a Pull Request
