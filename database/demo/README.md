# Notes App Demo Interface

This is a simple web interface to interact with the Redis graph database layer. It demonstrates the functionality of the database CRUD operations.

## Setup and Running

1. Start Redis server (in a separate terminal):
   ```
   redis-server
   ```

2. Compile the database package:
   ```
   cd /Users/samlikesphysics/Documents/Code/notes/database
   npm run build
   ```

3. Install demo dependencies (if not already done):
   ```
   cd /Users/samlikesphysics/Documents/Code/notes/database/demo
   npm install
   ```

4. Start the demo server:
   ```
   npm start
   ```

5. Open http://localhost:3000 in your browser

## Features

- **Notes Management**
  - Create new notes with title and content
  - View a list of all notes
  - View individual note details
  - Edit existing notes
  - Delete notes

- **Tags Management**
  - Create new tags with name, color, and description
  - View a list of all tags
  - Filter notes by tag
  - Delete tags

- **Data Structures**
  - Notes contain title, content, tags, and links
  - Tags contain name, color, and description

This demo provides a simple way to verify the Redis graph database functionality before proceeding with the full application development.