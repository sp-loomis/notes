import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// The sidebar has different "modes" or "views"
type SidebarMode = 'notes' | 'tags' | 'search' | 'links';

interface UiState {
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  sidebarMode: SidebarMode;
  searchQuery: string;
  theme: 'dark' | 'light';
}

const initialState: UiState = {
  sidebarWidth: 250,
  sidebarCollapsed: false,
  sidebarMode: 'notes',
  searchQuery: '',
  theme: 'dark',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebarWidth = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarMode: (state, action: PayloadAction<SidebarMode>) => {
      state.sidebarMode = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
  },
});

export const { setSidebarWidth, toggleSidebar, setSidebarMode, setSearchQuery, toggleTheme } = uiSlice.actions;

export default uiSlice.reducer;