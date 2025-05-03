# Notes Application database package requirements

The purpose of the database is to track notes. Each note may contain several component of various
types (specified later), and notes may be organized by adding tags. Tags can be hierarchical,
allowing one to search all child tags (and associated notes) using recursive queries.

The database should be implemented with SQLite and the .db file should be stored in the top
directory of this project. Interacting with the database will be through a typescript library which
implements the CRUD operations described below.

The package should be constructed with the philosophy that new note component types will be added
over time, so it should be easy to add code related to these components to the package as this
occurrs.

## Schema

- Table: 'notes'
  - column: note_id (int) (primary key)
  - column: title (str)
  - column: created_datetime (datetime)
  - column: last_modified_datetime (datetime)
- Table: 'tags'
  - column: tag_id (int) (primary key)
  - column: parent_tag_id (int)
  - column: name (str)
  - column: color (str, hex encoding)
  - column: created_datetime (datetime)
  - column: last_modified_datetime (datetime)
- Table: 'note_tags'
  - column: note_id (int)
  - column: tag_id (int)
  - column: created_datetime (datetime)
- Table: 'note_components'
  - column: component_id (int) (primary_key)
  - column: note_id (int)
  - column: name (str)
  - column: type (str)
  - column: created_datetime (datetime)
- Table: 'component_versions'
  - column: version_id (hash of other column values) (primary key)
  - column: component_id (int)
  - column: content (str)
  - column: version_datetime (datetime)

### Essential CRUD operations

- Notes
  - Create Note
  - Update Note (Title)
  - Search Notes by Filters
  - Delete Note
- Tags
  - Create Tag
  - Update Tag (Name, Parent)
  - Get All Tags
  - Get Child Tags of Tag
  - Delete Tag
- Notes & Tags
  - Add Tag to Note
  - Remove Tag from Note
- Note Components
  - Create Component
  - Update Component (content)
    - Updating components creates a new version rather than overwriting old content
  - Delete Component

### Filters

The search functionality of the app will potentially combine a number of filters. The package should
therefore handle the creation & combining of the main filter types to dynamically create queries.
The main filter type is tag filtering. In this case, for every tag passed, all notes must either
have that tag or one of its descendants.

Main content filter types:

- Contains
  - Applicable fields: Title, Markup component, Excalidraw component
  - Checks that the string contains the given substring
  - widget: text field
- Like
  - Applicable fields: Title, Markup component, Excalidraw component
  - Checks that the string contains the given pattern
  - widget: text field
- After
  - Applicable fields: Create datetime, Last modified datetime
  - Checks that the relevant datetime is after the given one. Last modified should be _latest_ of
    the note entry's last modified datetime and the latest last modified datetime of its
    components.
  - widget: datetime selector
- Before
  - Applicable fields: Create datetime, Last modified datetime
  - Checks that the relevant datetime is before the given one. Last modified should be _latest_ of
    the note entry's last modified datetime and the latest last modified datetime of its
    components.
  - widget: datetime selector

## Note component types

- Markup
  - Content format is a string with HTML code
- Image
  - Content format is byte-encoded string
- GeoJSON
  - Content format is a GeoJSON string
- Excalidraw
  - Content format is a .excalidraw json file as a string
