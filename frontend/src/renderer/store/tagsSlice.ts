import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { prepareForRedux } from '../utils/dateUtils';

interface TagsState {
  tags: Tag[];
  currentTag: Tag | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TagsState = {
  tags: [],
  currentTag: null,
  status: 'idle',
  error: null,
};

// Async Thunks
export const fetchTags = createAsyncThunk('tags/fetchTags', async () => {
  const tags = await window.api.tags.list();
  return prepareForRedux(tags);
});

export const fetchTagById = createAsyncThunk('tags/fetchTagById', async (id: string) => {
  const tag = await window.api.tags.get(id);
  return prepareForRedux(tag);
});

export const createTag = createAsyncThunk(
  'tags/createTag',
  async (tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTag = await window.api.tags.create(tagData);
    return prepareForRedux(newTag);
  }
);

export const updateTag = createAsyncThunk(
  'tags/updateTag',
  async ({ id, tagData }: { id: string; tagData: Partial<Omit<Tag, 'id' | 'createdAt'>> }) => {
    const updatedTag = await window.api.tags.update(id, tagData);
    return prepareForRedux(updatedTag);
  }
);

export const deleteTag = createAsyncThunk('tags/deleteTag', async (id: string) => {
  await window.api.tags.delete(id);
  return id;
});

export const findTagByName = createAsyncThunk('tags/findTagByName', async (name: string) => {
  const tag = await window.api.tags.findByName(name);
  return tag ? prepareForRedux(tag) : null;
});

// Slice
const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    setCurrentTag: (state, action: PayloadAction<Tag | null>) => {
      state.currentTag = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tags
      .addCase(fetchTags.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch tags';
      })
      
      // Fetch tag by ID
      .addCase(fetchTagById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTagById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentTag = action.payload;
      })
      .addCase(fetchTagById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch tag';
      })
      
      // Create tag
      .addCase(createTag.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tags.push(action.payload);
        state.currentTag = action.payload;
      })
      .addCase(createTag.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create tag';
      })
      
      // Update tag
      .addCase(updateTag.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.tags.findIndex((tag) => tag.id === action.payload.id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
        state.currentTag = action.payload;
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update tag';
      })
      
      // Delete tag
      .addCase(deleteTag.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tags = state.tags.filter((tag) => tag.id !== action.payload);
        if (state.currentTag && state.currentTag.id === action.payload) {
          state.currentTag = null;
        }
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete tag';
      })
      
      // Find tag by name
      .addCase(findTagByName.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(findTagByName.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.currentTag = action.payload;
        }
      })
      .addCase(findTagByName.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to find tag by name';
      });
  },
});

export const { setCurrentTag, clearError } = tagsSlice.actions;

export default tagsSlice.reducer;