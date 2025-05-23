# Notes Application Test Documentation

This directory contains tests for the Notes application. The tests are organized by module, with each subdirectory corresponding to a module in the application.

## Database Tests

The database tests verify the functionality of our database repositories, which provide data access and manipulation capabilities for the application.

### Note Repository Tests (`database/note-repository.test.ts`)

These tests verify the CRUD operations for notes in the database:

- **createNote**

  - Successfully creates a note with a title and returns the new note ID
  - Properly handles errors when the database operation fails

- **getNoteById**

  - Returns the correct note when it exists in the database
  - Returns null when a note with the specified ID does not exist
  - Properly handles errors when the database operation fails

- **getAllNotes**

  - Returns all notes in the database
  - Returns an empty array when there are no notes

- **updateNote**

  - Successfully updates a note with new data
  - Returns false when updating a non-existent note

- **deleteNote**
  - Successfully deletes a note by ID
  - Returns false when deleting a non-existent note

The tests use Jest's mocking capabilities to mock the SQLite database, allowing us to test the repository logic without requiring an actual database connection.

### Tag Repository Tests (`database/tag-repository.test.ts`)

These tests verify the functionality of the tag repository, which is responsible for managing the hierarchical tag structure:

- **createTag**

  - Successfully creates a tag with a name and color
  - Successfully creates a tag with a parent tag (for hierarchical structure)
  - Properly handles errors when the database operation fails

- **getTagById**

  - Returns the correct tag when it exists in the database
  - Returns null when a tag with the specified ID does not exist

- **getAllTags**

  - Returns all tags in the database
  - Returns an empty array when there are no tags

- **updateTag**

  - Successfully updates a tag with new data
  - Returns false when updating a non-existent tag

- **deleteTag**

  - Successfully deletes a tag by ID
  - Returns false when deleting a non-existent tag

- **getTagHierarchy**
  - Correctly builds the hierarchical tag tree structure
  - Properly organizes tags into parent-child relationships

### Tag Hierarchy Tests (`database/tag-hierarchy.test.ts`)

These tests verify the hierarchical functionality of the tag repository:

- **getDescendantTags**

  - Returns all descendant tags for a parent tag
  - Returns an empty array when a tag has no descendants

- **getAncestorTags**

  - Returns all ancestor tags for a child tag
  - Returns an empty array when a tag has no ancestors

- **moveTag**
  - Successfully moves a tag to a new parent
  - Throws an error when the move would create a cycle in the hierarchy

### Note-Tag Relationship Tests (`database/note-tag-relationships.test.ts`)

These tests verify the relationship management between notes and tags:

- **TagRepository - Note-Tag Operations**

  - **addTagToNote**: Successfully adds a tag to a note
  - **removeTagFromNote**: Successfully removes a tag from a note
  - **getTagsForNote**: Returns all tags for a specific note
  - **getNotesWithTag**: Returns all notes that have a specific tag

- **NoteRepository - Tag Filtering**
  - **findNotesByTags**: Finds notes that have any of the specified tags
  - **findNotesByAllTags**: Finds notes that have all of the specified tags
  - **findNotesByAnyTags**: Finds notes with any of the specified tags, with optional inclusion of descendant tags

### Component Repository Tests (`database/component-repository.test.ts`)

These tests verify the functionality of the component repository, which manages note components and their versioned content:

- **createComponent**

  - Successfully creates a component with a name, type, and note ID
  - Properly handles errors when the database operation fails

- **getComponentById**

  - Returns the correct component when it exists in the database
  - Returns null when a component with the specified ID does not exist

- **getComponentsByNoteId**

  - Returns all components for a specific note
  - Returns an empty array when no components exist for a note

- **updateComponent**

  - Successfully updates a component with new data
  - Returns false when updating a non-existent component
  - Returns false when no update data is provided

- **deleteComponent**

  - Successfully deletes a component and its versions
  - Returns false when deleting a non-existent component

- **createComponentVersion**

  - Successfully creates a new version for a component
  - Generates a unique version ID based on content and timestamp
  - Updates the component's last modified timestamp

- **getComponentVersions**

  - Returns all versions for a component in descending order by creation date
  - Returns an empty array when no versions exist

- **getComponentVersion**

  - Returns the correct version when it exists in the database
  - Returns null when a version with the specified ID does not exist

- **getLatestComponentVersion**
  - Returns the most recent version for a component
  - Returns null when no versions exist

## UI Component Tests

The UI component tests verify the functionality of our React components, ensuring that they render correctly and handle user interactions as expected.

### TabBar Component Tests (`renderer/components/layout/TabBar.test.tsx`)

These tests verify the functionality of the TabBar component, which provides navigation between different views:

- **Rendering**

  - Successfully renders all tabs (Search Notes, Note Manager, Tag Organizer)
  - Correctly applies the active class to the currently selected tab

- **Interaction**
  - Properly calls the onTabChange callback when a tab is clicked
  - Passes the correct tab ID to the callback function

### App Component Tests (`renderer/App.test.tsx`)

These tests verify the main App component, which integrates the TabBar and navigation views:

- **Rendering**

  - Successfully renders the TabBar and navigator panel
  - Shows the Search view by default when the app first loads

- **Navigation**
  - Properly switches views when different tabs are clicked
  - Shows the Note Manager view when the Note Manager tab is clicked
  - Shows the Tag Organizer view when the Tag Organizer tab is clicked

### NoteManagerView Component Tests (`renderer/components/navigation/NoteManagerView.test.tsx`)

These tests verify the functionality of the NoteManagerView component, which displays the Note Manager interface:

- **Empty State**

  - Renders the "No Note Selected" message when no note is selected
  - Displays a button to create a new note

- **Loading State**

  - Shows a loading indicator when data is being fetched

- **Error State**

  - Displays an error message when an error occurs
  - Provides a retry button to attempt the operation again

- **Note Creation**

  - Displays a note creation form when the create button is clicked
  - Successfully calls the createNote function with the correct data when the form is submitted
  - Selects the newly created note after creation

- **Selected Note View**
  - Properly displays the selected note's details
  - Shows a close button to return to the empty state
  - Returns to the empty state when the close button is clicked

These tests use Jest's mocking capabilities to mock the NotesContext and ComponentsContext, allowing us to test the component's behavior with different state configurations.

### Note Attributes Panel Tests (`renderer/components/noteManager/NoteAttributesPanel.test.tsx`)

These tests verify the functionality of the NoteAttributesPanel component, which displays and allows editing of note attributes:

- **Rendering**

  - Successfully renders note title and dates in display mode
  - Shows edit and delete buttons
  - Displays tags associated with the note

- **Edit Mode**

  - Switches to edit mode when the edit button is clicked
  - Allows editing of note title
  - Shows tag selector to add/remove tags
  - Updates the note when changes are saved
  - Properly cancels editing when the cancel button is clicked

- **Deletion**
  - Shows a confirmation dialog before deleting a note
  - Successfully calls the deleteNote function when deletion is confirmed
  - Cancels deletion when the cancel button is clicked

### Component Listing Panel Tests (`renderer/components/noteManager/ComponentListingPanel.test.tsx`)

These tests verify the functionality of the ComponentListingPanel component, which displays the list of components for a note and provides component management features:

- **Empty State**

  - Renders the "No components yet" message when no components exist
  - Displays a button to create a new component

- **Loading State**

  - Shows a loading indicator when data is being fetched

- **Error State**

  - Displays an error message when an error occurs

- **Component Listing**

  - Correctly displays all components with their names and types
  - Shows type-specific icons for different component types (Markup, Image, GeoJSON, TLDraw)
  - Displays formatted date for last modification
  - Highlights the currently selected component

- **Component Selection**

  - Properly calls the selectComponent function when a component is clicked

- **Component Creation**

  - Shows the component creation form when the add button is clicked
  - Allows specification of component name and type
  - Creates appropriate initial content based on component type
  - Selects the newly created component after creation

- **Component Renaming**

  - Enables inline editing of component names
  - Successfully updates component names when editing is saved
  - Properly cancels editing when the cancel button is clicked

- **Component Deletion**
  - Shows a confirmation dialog before deletion
  - Successfully deletes components when confirmed
  - Cancels deletion when the cancel button is clicked

### Component Header Tests (`renderer/components/componentViewer/ComponentHeader.test.tsx`)

These tests verify the functionality of the ComponentHeader component, which provides controls for viewing and editing components:

- **Rendering**
  - Successfully renders the component name
  - Shows the edit/save button, close button, and version selector
  - Correctly displays the component in view mode by default

- **Interaction**
  - Toggles between edit and view mode when the edit/save button is clicked
  - Properly calls the onClose handler when the close button is clicked
  - Calls the onVersionSelect handler with the correct version ID when a version is selected

### Component Viewer Tests (`renderer/components/componentViewer/ComponentViewer.test.tsx`)

These tests verify the functionality of the ComponentViewer component, which displays component content based on type:

- **Empty State**
  - Shows a placeholder when no component is selected

- **Rendering**
  - Correctly renders the component header
  - Displays content based on component type (Markup, Image, GeoJSON, TLDraw)
  - Shows the appropriate viewer for each component type

- **Interaction**
  - Toggles between edit and view mode 
  - Saves content when in edit mode
  - Properly calls the selectComponent function when the close button is clicked
  - Loads different versions when selected from the version dropdown

## Testing Approach

### Mocking Strategy

We use Jest's mocking capabilities to mock database interactions:

- The SQLite `Database` object is mocked to avoid actual database operations
- Methods like `run`, `get`, and `all` are mocked to return predefined results
- The `Date` constructor is mocked to provide consistent timestamps for testing
- Repository methods are sometimes mocked to test their interactions

### Test Setup for UI Components

For testing UI components, we use:

- `@testing-library/react` for rendering components and simulating user interactions
- `@testing-library/jest-dom` for enhanced assertions about the DOM state
- Custom mock implementations for third-party components like Allotment

### Test Coverage

Test coverage is tracked using Jest's built-in coverage tool. As of the current implementation, we have:

- Good coverage of core CRUD operations for notes and tags
- Strong testing of tag hierarchy functionality
- Comprehensive testing of note-tag relationships
- Complete coverage of the TabBar component (100%)
- Strong coverage of navigation functionality in the App component
- Good coverage of the ComponentViewer and ComponentHeader components
- Strong coverage of UI components for note management

## Future Test Expansion

Future tests will include:

1. ✅ Component repository tests - Implemented
2. ✅ Component versioning functionality - Implemented
3. ✅ Navigation component tests - Implemented (NoteManagerView, TabBar)
4. ✅ Note management UI tests - Implemented (NoteAttributesPanel, ComponentListingPanel)
5. ✅ Component viewing and editing tests - Implemented (ComponentViewer, ComponentHeader)
6. Search and filtering functionality tests
7. Tag Organizer UI comprehensive tests
8. Advanced component type viewers (GeoJSON, TLDraw)
9. Integration tests between repositories and UI
10. End-to-end tests for complete workflows

## Running Tests

To run the tests, use the following command:

```
npm test
```

To run specific test categories:

```
npm test -- --testPathPattern=database  # Run only database tests
npm test -- --testPathPattern=renderer  # Run only UI/renderer tests
```

To run tests with coverage information:

```
npm test -- --coverage
```
