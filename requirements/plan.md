# Notes Application Development Plan

This document outlines the incremental development plan for building the Notes application based on the provided requirements. The plan follows an MVP (Minimum Viable Product) approach where features are added incrementally.

## Development Philosophy

- Each development phase will deliver a functional MVP with specific features
- Follow test-driven development where possible
- Use semantic versioning for releases (major.minor.patch)
- Maintain clean architecture and separation of concerns

## Repository Management Guidelines

### Git Workflow

1. **Branch Strategy**

   - `main` branch should always be stable and deployable
   - Create feature branches from `main` using the naming convention: `feature/short-description`
   - Use `bugfix/description` for bug fixes
   - Use `refactor/description` for code cleanup

2. **Commit Strategy**

   - Write meaningful commit messages with a format: `feat|fix|refactor|chore|docs|test(scope): description`
   - Keep commits focused on specific changes
   - Example: `feat(database): implement note creation functionality`

3. **Pull Request Process**

   - Create PR for each feature, bug fix, or refactor
   - Include test coverage
   - Self-review code before submission
   - Merge only when tests pass and requirements are met

4. **Release Management**
   - Tag releases with semantic versions
   - Generate changelog for each release
   - Document known issues

## Project Setup (Phase 0)

1. Initialize project structure

   - Set up Electron with React
   - Configure TypeScript
   - Set up testing framework
   - Configure ESLint and Prettier
   - Add required React libraries (Allotment, react-sortable-tree, Material Design Icons, etc.)

2. Create initial database schema and migration system
   - Implement SQLite connection
   - Set up the database schema as defined in requirements

## Development Phases

### Phase 1: Core Database Functionality (MVP 1)

**Goal:** Create the database package with essential CRUD operations for notes

**Features:**

- Database connection and initialization
- Note creation, reading, updating, and deletion
- Basic tag functionality (create, read)
- Simple database tests

**Deliverables:**

- Database initialization script
- Note model and repository
- Tag model and repository
- Unit tests for database operations

### Phase 2: Tag System and Relationships (MVP 2)

**Goal:** Expand the tag system and establish relationships between notes and tags

**Features:**

- Complete tag CRUD operations
- Hierarchical tag structure
- Note-tag relationships
- Tag filtering for notes

**Deliverables:**

- Complete tag repository
- Methods to add/remove tags from notes
- Hierarchical tag querying
- Test suite for tag operations

### Phase 3: Note Components Basic Implementation (MVP 3)

**Goal:** Implement the component system for notes

**Features:**

- Note component creation and management
- Component versioning system
- Basic markup component type
- Component content storage and retrieval

**Deliverables:**

- Component model and repository
- Version tracking system
- Basic content storage
- Tests for component operations

### Phase 4: Basic UI - Navigation Structure (MVP 4)

**Goal:** Create the basic UI framework with navigation capabilities

**Features:**

- Electron app shell
- Tab bar with icons
- Resizable sidebar
- Simple note listing

**Deliverables:**

- Electron main process configuration
- Basic React component structure
- Navigation UI components
- Sidebar implementation with Allotment

### Phase 5: Note Manager View (MVP 5)

**Goal:** Implement the note manager view functionality

**Features:**

- Note creation, editing, and deletion from UI
- Note attributes panel
- Simple component listing
- Basic component viewing

**Deliverables:**

- Note manager view components
- Forms for note operations
- Component listing UI
- Integration with database layer

### Phase 6: Search Functionality (MVP 6)

**Goal:** Implement the search system for notes

**Features:**

- Basic search panel
- Tag-based filtering
- Simple text search
- Search results display

**Deliverables:**

- Search panel components
- Filter implementation
- Database query builders
- Search result components

### Phase 7: Advanced Search and Filters (MVP 7)

**Goal:** Enhance search with advanced filtering capabilities

**Features:**

- Advanced search panel
- Multiple filter types (Contains, Like, After, Before)
- Combined filtering
- Sorting options

**Deliverables:**

- Enhanced filter components
- Advanced query builders
- Filter combination logic
- UX improvements for search

### Phase 8: Tag Organizer UI (MVP 8)

**Goal:** Build the tag organization interface

**Features:**

- Tag tree view using react-sortable-tree
- Tag creation, editing, and deletion
- Tag color management
- Drag-and-drop organization

**Deliverables:**

- Tag organizer panel
- Tag tree components
- Tag editing UI
- Color picker integration

### Phase 9: Component Types - Markup and Image (MVP 9)

**Goal:** Implement markup and image component types

**Features:**

- Lexical editor integration for markup components
- Image upload and display
- Component version management in UI
- Component editing workflow

**Deliverables:**

- Markup editor integration
- Image handling components
- Version selection UI
- Save/edit workflow

### Phase 10: Component Types - GeoJSON and Excalidraw (MVP 10)

**Goal:** Implement GeoJSON and Excalidraw component types

**Features:**

- Leaflet integration for GeoJSON components
- Excalidraw integration
- Component specific editing
- Version comparison

**Deliverables:**

- GeoJSON viewer/editor
- Excalidraw integration
- Component type handlers
- Enhanced version management

### Phase 11: Multi-panel Component Viewing (MVP 11)

**Goal:** Implement split view functionality for components

**Features:**

- Panel splitting options (left, right, above, below)
- Component opening in specific panels
- Panel management
- Layout persistence

**Deliverables:**

- Panel management system
- Split view UI
- Context menu for splitting options
- Layout state management

### Phase 12: Finalization and Polish (MVP 12)

**Goal:** Finalize the application with performance improvements and polish

**Features:**

- Performance optimization
- Error handling
- UX improvements
- Final testing

**Deliverables:**

- Performance audit report
- Error handling system
- UX enhancements
- Comprehensive test coverage

## Testing Strategy

1. **Unit Tests**

   - Test individual database operations
   - Test UI components in isolation
   - Test utility functions

2. **Integration Tests**

   - Test database and UI integration
   - Test component interactions
   - Test search and filtering

3. **End-to-End Tests**
   - Test complete user workflows
   - Test application startup and initialization
   - Test data persistence

## Debugging Process

1. Identify the issue through error logs or reproduction steps
2. Create isolated test cases to reproduce the issue
3. Use debugging tools (console logs, Chrome DevTools, etc.)
4. Fix the issue with minimal changes
5. Add regression tests to prevent recurrence
6. Document the issue and solution

## Documentation

- Maintain up-to-date API documentation
- Document database schema changes
- Create user guides for each feature
- Document known limitations and workarounds

## Periodic Reviews

- Code quality reviews after each MVP
- Performance reviews at milestones 6 and 11
- UX reviews at milestones 5, 8, and 11
