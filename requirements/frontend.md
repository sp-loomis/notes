# Notes Application Frontend Specification

## Overview

The Notes application is an Electron-based desktop application with a React frontend providing an interface for managing notes, components, and tags.

## Technology Stack

### Core Technologies

- **Electron**: Desktop application framework
- **React**: UI component library
- **TypeScript**: Typed JavaScript for development

### Required Libraries

| Library                   | Purpose               | Source                                                                                           |
| ------------------------- | --------------------- | ------------------------------------------------------------------------------------------------ |
| Allotment                 | Panel management      | [GitHub](https://github.com/johnwalley/allotment)                                                |
| react-accessible-treeview | Tree views for tags   | [npm](https://www.npmjs.com/package/react-accessible-treeview)                                   |
| @mdi/react                | Material Design Icons | [npm](https://www.npmjs.com/package/@mdi/react)                                                  |
| Lexical                   | Rich text editor      | [GitHub](https://github.com/facebook/lexical)                                                    |
| Leaflet/react-leaflet     | GeoJSON visualization | [GitHub](https://github.com/Leaflet/Leaflet), [npm](https://www.npmjs.com/package/react-leaflet) |

> **Note:** Drawing component with Excalidraw will be integrated in a later phase due to compatibility issues with the current React version.

## Application Layout

The application follows a three-panel structure:

```
┌───┬───────────────┬──────────────────────────┐
│   │               │                          │
│ T │               │                          │
│ A │               │                          │
│ B │   Navigator   │      Main Content        │
│   │    Panel      │         Area             │
│ B │               │                          │
│ A │               │                          │
│ R │               │                          │
│   │               │                          │
└───┴───────────────┴──────────────────────────┘
```

1. **Tab Bar**: Vertical icon bar for switching navigator views
2. **Navigator Panel**: Resizable sidebar with 3 possible views
3. **Main Content Area**: Displays note components, can be split into multiple panels

## Tab Bar

The vertical tab bar contains three main icon buttons:

- Search Notes: Switches navigator to search interface
- Note Manager: Switches navigator to note management interface
- Tag Organizer: Switches navigator to tag organization interface

The tab bar remains visible even when the navigator is collapsed.

## Navigator Panel Views

### 1. Search Notes View

This view is split into two vertical panels:

#### Search Panel

Can toggle between two states:

- **Basic**: Contains tag multiselect only
- **Advanced**: Adds configurable filters with:
  - Filter type dropdown (Contains, Like, After, Before)
  - Content type multiselect
  - Filter value input (text field or datetime picker)

#### Search Results Panel

- Displays notes matching search criteria
- Includes sort controls (by creation or modification date)
- Each note shows:
  - Title
  - First 3 tags
  - Created date
  - Last modified date
- Clicking a note opens it in Note Manager view

### 2. Note Manager View

Has two possible states:

#### No Selected Note

- Shows a button to create a new note

#### Selected Note

Split into two vertical panels:

1. **Note Attributes Panel**

   - Shows note title, dates, tags
   - Has Edit and Delete buttons
   - Edit mode allows changing title and tags

2. **Note Components Panel**
   - Lists components with name, type icon, last edit date
   - Click to open in main area
   - Right-click menu:
     - Open Left/Right/Above/Below (for split views)
     - Rename Component
     - Delete Component

### 3. Tag Organizer View

- Displays tags in a sortable tree view
- Shows tag color and name
- Add button creates new tag
- Right-click menu:
  - Add Child Tag
  - Rename Tag
  - Change Tag Color (with color picker)
  - Delete Tag (with confirmation)

## Main Content Area

- Displays note components
- Can be subdivided into multiple panels
- Reset when a new note is selected
- Each component panel includes:
  - Component name
  - Close button
  - Edit button
  - Version selector dropdown
  - Content appropriate to component type

### Component Panel Modes

#### View Mode

- Displays component content based on type
- Shows version selector dropdown
- Edit button to switch to edit mode

#### Edit Mode

- Shows editor appropriate to component type (Lexical, Excalidraw, etc.)
- Save button replaces edit button
- Saving creates a new version

### Panel Splitting

Components can be opened in split views:

- Left split
- Right split
- Top split
- Bottom split

Each newly opened component properly sizes within its panel.

## Component Type Rendering

### Markup Component

- Uses Lexical editor
- Displays formatted HTML

### Image Component

- Displays images with proper scaling
- Provides basic image controls

### GeoJSON Component

- Uses Leaflet for map display
- Provides map controls

### Excalidraw Component

- Integrates Excalidraw for drawing
- Full drawing capabilities
