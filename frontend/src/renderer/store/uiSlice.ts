import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// The sidebar has different "modes" or "views"
type SidebarMode = 'notes' | 'tags' | 'search' | 'links';

// Editor modes
export type EditorMode = 'view' | 'edit' | 'create' | 'createTag' | 'editTag' | 'createLink';

interface UiState {
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  sidebarMode: SidebarMode;
  editorMode: EditorMode;
  searchQuery: string;
  theme: 'dark' | 'light';
}

const initialState: UiState = {
  sidebarWidth: 250,
  sidebarCollapsed: false,
  sidebarMode: 'notes',
  editorMode: 'view',
  searchQuery: '',
  theme: 'dark',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarWidth: (state, action: PayloadAction<number>) => {
      // Determine if sidebar should be collapsed based on width
      const COLLAPSE_THRESHOLD = 60;
      
      if (action.payload < COLLAPSE_THRESHOLD) {
        state.sidebarCollapsed = true;
      } else {
        state.sidebarCollapsed = false;
        state.sidebarWidth = action.payload;
      }
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarMode: (state, action: PayloadAction<SidebarMode>) => {
      state.sidebarMode = action.payload;
    },
    setEditorMode: (state, action: PayloadAction<EditorMode>) => {
      state.editorMode = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
  },
});

export const { 
  setSidebarWidth, 
  toggleSidebar, 
  setSidebarMode, 
  setEditorMode,
  setSearchQuery, 
  toggleTheme 
} = uiSlice.actions;

export default uiSlice.reducer;