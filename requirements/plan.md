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
   - For multi-sprint phases:
     - Create an epic branch from `main` named `epic/phase-X` (e.g., `epic/phase-5`)
     - Create feature branches for each sprint from the epic branch using the naming convention: `feature/phase-X.Y-description` (e.g., `feature/phase-5.1-state-management`)
     - Merge feature branches into the epic branch at the end of each sprint
     - Merge the epic branch back into `main` only when the entire phase is completed and tested
   - For single-sprint phases:
     - Create feature branches directly from `main` using the naming convention: `feature/short-description`
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

## Project Setup (Phase 0) ✅ COMPLETED

1. Initialize project structure ✅

   - Set up Electron with React ✅
   - Configure TypeScript ✅
   - Set up testing framework ✅
   - Configure ESLint and Prettier ✅
   - Add required React libraries (Allotment, react-accessible-treeview, Material Design Icons, etc.) ✅

2. Create initial database schema and migration system ✅
   - Implement SQLite connection ✅
   - Set up the database schema as defined in requirements ✅

## Development Phases

### Phase 1: Core Database Functionality (MVP 1) ✅ COMPLETED

**Goal:** Create the database package with essential CRUD operations for notes ✅

**Features:**

- Database connection and initialization ✅
- Note creation, reading, updating, and deletion ✅
- Basic tag functionality (create, read) ✅
- Simple database tests ✅

**Deliverables:**

- Database initialization script ✅
- Note model and repository ✅
- Tag model and repository ✅
- Unit tests for database operations ✅

### Phase 2: Tag System and Relationships (MVP 2) ✅ COMPLETED

**Goal:** Expand the tag system and establish relationships between notes and tags ✅

**Features:**

- Complete tag CRUD operations ✅
- Hierarchical tag structure ✅
- Note-tag relationships ✅
- Tag filtering for notes ✅

**Deliverables:**

- Complete tag repository with hierarchical operations ✅
- Methods to add/remove tags from notes ✅
- Hierarchical tag querying (ancestors, descendants) ✅
- Tag filtering methods (findNotesByTags, findNotesByAllTags, findNotesByAnyTags) ✅
- Test suite for tag operations ✅

### Phase 3: Note Components Basic Implementation (MVP 3) ✅ COMPLETED

**Goal:** Implement the component system for notes ✅

**Features:**

- Note component creation and management ✅
- Component versioning system ✅
- Generic content storage and retrieval ✅

**Deliverables:**

- Component model and repository ✅
- Version tracking system ✅
- Basic content storage ✅
- Tests for component operations ✅

**Note:** Markup-specific functionality has been postponed to Phase 9 since both Lexical and TipTap (potential editors) use their own JSON formats rather than HTML directly. This allows for a cleaner separation between storage and UI layers.

### Phase 4: Basic UI - Navigation Structure (MVP 4) ✅ COMPLETED

**Goal:** Create the basic UI framework with navigation capabilities ✅

**Features:**

- Electron app shell ✅
- Tab bar with icons ✅
- Resizable sidebar ✅
- Simple note listing (placeholder implementation) ✅

**Deliverables:**

- Electron main process configuration ✅
- Basic React component structure ✅
- Navigation UI components ✅
- Sidebar implementation with Allotment ✅
- Component tests for UI elements ✅

### Phase 5: Note Manager View (MVP 5)

**Goal:** Implement the note manager view functionality and enable basic note management through the UI

**Features:**

- Note creation, editing, and deletion from UI
- Note attributes panel
- Simple component listing
- Basic component viewing

**Detailed Implementation Plan:**

#### Sprint 5.1: Foundation & State Management ✅ COMPLETED

**Goal:** Set up the foundation for the Note Manager View and implement state management

**Tasks:**

- Set up React Context for note state management ✅
- Create the UI skeleton for Note Manager View with empty and selected states ✅
- Create a state provider to manage currently selected note ✅
- Set up communication with the database layer ✅
- Implement note selection functionality ✅
- Create unit tests for state management ✅
- Add close button to selected note view ✅
- Create placeholder note listing in Search View ✅

**Deliverables:**

- React Context implementation for note state ✅
- Empty and selected state UI skeletons ✅
- Database communication layer ✅

#### Sprint 5.2: Note Attributes Panel

**Goal:** Implement the Note Attributes Panel functionality

**Tasks:**

- Design and implement note creation form ✅
- Implement note title editing functionality ✅
- Create tag selection component with ability to add/remove tags ✅
- Set up date display for creation and modification timestamps ✅
- Implement note deletion with confirmation dialog ✅
- Add error handling for database operations ✅
- Create unit tests for Note Attributes Panel

**Deliverables:**

- Note creation form ✅
- Note editing functionality ✅
- Tag selection component ✅
- Date display components ✅
- Deletion confirmation dialog ✅

#### Sprint 5.3: Component Listing Panel

**Goal:** Implement the Component Listing Panel functionality

**Tasks:**

- Design and implement component list with type icons
- Create component creation form with type selection
- Implement component renaming functionality
- Add component deletion with confirmation
- Implement last edit date display
- Set up event handling for component selection
- Create unit tests for Component Listing Panel

**Deliverables:**

- Component list implementation
- Component creation form
- Component renaming functionality
- Component deletion functionality
- Event handlers for component selection

#### Sprint 5.4: Main Content Area - Component Viewing

**Goal:** Implement basic component viewing in the main content area

**Tasks:**

- Design and implement component viewing panel
- Create specific viewers for different component types (placeholder implementations)
- Implement component header with name, close button, and edit button
- Create basic version selector dropdown
- Set up communication between Navigator and Main Content Area
- Implement component state tracking
- Create unit tests for component viewing

**Deliverables:**

- Component viewing panel
- Type-specific component viewers (placeholders)
- Component header implementation
- Version selector
- Main content state management

#### Sprint 5.5: Integration & Testing

**Goal:** Integrate all components and perform comprehensive testing

**Tasks:**

- Integrate Note Attributes Panel with Component Listing Panel
- Connect Note Manager View with Main Content Area
- Implement comprehensive error handling
- Perform end-to-end testing of note creation, editing, and deletion
- Test component creation, selection, and viewing
- Fix any integration issues or bugs
- Optimize performance if needed

**Deliverables:**

- Fully integrated Note Manager View
- End-to-end tests
- Bug fixes and optimizations
- Documentation for the Note Manager View functionality

**Technical Considerations:**

- Use React hooks for state management
- Implement proper error handling for database operations
- Ensure responsive design for all components
- Follow accessibility guidelines for forms and controls
- Use TypeScript interfaces for all component props and state

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

- Tag tree view using react-accessible-treeview
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

### Phase 10: Component Types - TLDraw Integration (MVP 10)

**Goal:** Implement TLDraw component type for drawings

**Features:**

- TLDraw integration for drawing components
- Component specific editing
- Version comparison

**Deliverables:**

- TLDraw integration
- Drawing component handlers
- Version management for drawings

### Phase 11: Component Types - GeoJSON (MVP 11)

**Goal:** Implement GeoJSON component type

**Features:**

- Leaflet integration for GeoJSON components
- Component specific editing
- Version comparison

**Deliverables:**

- GeoJSON viewer/editor
- Component type handlers
- Enhanced version management

### Phase 12: Multi-panel Component Viewing (MVP 12)

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

### Phase 13: Finalization and Polish (MVP 13)

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
