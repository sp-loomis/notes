# Notes Application frontend interface requirements

The Notes application is to be an Electron app using a handful of React libraries to render an
interactive interface for the Notes database.

## React libraries

- For handling panels within the app, use the Allotment library (repository:
  https://github.com/johnwalley/allotment)
- For handling of tree views (mainly the tag view) use the react-sortable-tree library (repository:
  https://github.com/frontend-collective/react-sortable-tree?tab=readme-ov-file) with the
  react-sortable-tree-theme-file-explorer theme
  (https://github.com/frontend-collective/react-sortable-tree-theme-file-explorer)
- For icons, use the Material Design Icon library (@mdi/react, npm:
  https://www.npmjs.com/package/@mdi/react)
- For editing Markup note components, use Lexical editor (github:
  https://github.com/facebook/lexical)
- For viewing & editing Excalidraw, use Excalidraw react library (github:
  https://github.com/excalidraw/excalidraw)
- For viewing & editing GeoJSONs, use Leaflet library (Leaflet.js github:
  https://github.com/Leaflet/Leaflet), (react library: https://www.npmjs.com/package/react-leaflet)

## Layout

The main layout of the app will work as follows:

- A thin, vertical "tab bar" with icons that can be selected to change the view in the sidebar. The
  tab bar is always visible even when the sidebar is closed. There are three main tabs: Search
  Notes, Note Manager, and Tag Organizer.
- A sidebar which can be resized but which can be snapped closed. This will provide the navigation
  functionality, allowing searching & navigating both notes and tags as well as selecting note
  components. This sidebar will henceforth be called the "navigator."
- A main body which will be used to display note components when opened. This can be further
  subdivided into panels dynamically depending on user options for how to open components and split
  the views.

## Search Notes navigator view

When the navigator is in "Search Notes" mode, it is split vertically into two resizable panels:
the Search panel and the Search Results panel. The Search panel itself can be in two states: Basic
and Advanced, controlled by a collapsing button which expands/contracts between the two states when
toggled. When in basic mode, previously entered filters are dropped.

### Basic Search Panel

The basic search panel includes a Tag multiselect box for searching and selecting tags.

### Advanced Search Panel

In the advanced state, beneath the Tag multiselect there is a button for adding filters. Each filter
shows as three widgets: drop-down for choosing the filter type (see options in database.md), a
multiselect for choosing which content types the filter will be applied to (see valid options in
database.md), and a widget based on the filter type for the filter pattern.

### Search Results Panel

In the search results, a SQL query should be run on the notes database applying the filters.
When there are no filters and no tags selected, all notes are shown. In the header of this panel
there should be a button for sorting by create datetime and last modified datetime. Each note is
shown with the title of the note and beneath it the first 3 tags, the create datetime and the last
modified datetime. Clicking on the note opens the Note Manager navigator view with that note
selected.

## Note Manager navigator view

In the note manager view, if no note is selected, we are in "No Selected Note" mode, and if a note
is selected (this is a global state which can be reset by the search results panel), we are in the
"Selected Note" mode. In "Selected Note" mode, the navigator is split vertically into two panels:
Note Attributes and Note Components.

### No Selected Note mode

If there is no selected note, there is a button to create a note. When this is chosen, a new note is
created and the new note becomes selected.

### Note Attributes panel

In the Note Attributes panel, we see the note title, created & last edited dates, and the note tags.
These are not editable by default, but in the panel header there are a "Edit" and "Delete" button.
Delete deletes the node and its components from the database (and should have a confirmation
prompt). Edit switches to edit mode, where the title and tags are editable as a text field and a
multiselect respectively. In edit mode, the edit button is replaced with a save button.

### Note Components panel

In the Note Components panel, we see a list of note components with name and last edit date
displayed (and the component type displayed by an icon). Selecting on a component opens it,
occupying the full body. Alternatively, the user may right-click on a component with several
options:

- Open Left (splits the body with a new panel to the left showing the component)
- Open Right (splits the body with a new panel to the right)
- Open Above (splits the body with a new panel on top)
- Open Below (splits the body with a new panel on the bottom)
- Rename Component (Allows in-line editing of the component name)
- Delete Component (deletes the component and all its versions after a confirmation box)

## Tag Organizer panel

The tag organizer panel is the simplest. All tags are displayed using the sortable tree view. In the
header there is a button to add tags. For each tag you should see an icon with the color and the
name of the tag. Clicking this should create a new tag, visualized in the tree
view in an "editable" state where the user can type the name. Upon hitting enter, the tag is saved
to the database. The new tag is a child of whatever tag was selected when the add button was
clicked. Clicking away from the tags in the panel should deselect the tag. Right-clicking on a tag
gives the options:

- Add Child Tag (same as clicking on this tag and clicking the add button)
- Rename Tag
- Change Tag Color (opens a floating color picker to change the color)
- Delete Tag (again, pops up a confirmation before deleting)

## Main Body

As mentioned above, the main body will display Note Components, potentially divided into many
subpanels depending on user choice. Each time a new note is selected, the body resets to empty; if a
component is directly selected from the note manager, the body resets to one panel showing only that
component.

Each component panel has a header with a close button and the name of the component (left-aligned) and, right-aligned,
an Edit button next to a dropdown showing the versions by date. Whichever version is selected is
that displayed in the component body. Clicking edit goes into edit mode, using whatever editor is
appropriate for the component, and the edit button is replaced by a save button and the version
selector disappears. Clicking the save
button creates a new version with the current content and switches the view to that version.
