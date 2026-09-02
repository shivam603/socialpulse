import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { logout } from './authSlice';
import { getApiUrl } from '../../config/api';

// State normalization using createEntityAdapter (EXP 1.2.1)
// Normalizes posts collection into { ids: string[], entities: Record<string, Post> }
export const postsAdapter = createEntityAdapter({
  selectId: (post) => post._id || post.id,
  sortComparer: (a, b) => new Date(b.createdAt || b.scheduledAt || 0) - new Date(a.createdAt || a.scheduledAt || 0),
});

const initialState = postsAdapter.getInitialState({
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedPostId: null,
  activeFilterPlatform: 'All',
  searchQuery: '',
  syncTimestamp: null,
});

// Async Thunks for API Operations
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async (_, { getState, dispatch, rejectWithValue }) => {
  try {
    const { auth } = getState();
    const headers = { 'Content-Type': 'application/json' };
    if (auth.token) {
      headers['Authorization'] = `Bearer ${auth.token}`;
    }
    const response = await fetch(getApiUrl('/api/posts'), { headers });
    const data = await response.json();
    if (response.status === 401) {
      dispatch(logout());
      return rejectWithValue('Session expired. Please sign in again.');
    }
    if (!response.ok) {
      return rejectWithValue(data.message || 'Failed to fetch posts');
    }
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error while fetching posts');
  }
});

export const createPost = createAsyncThunk('posts/createPost', async (newPostData, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState();
    const headers = { 'Content-Type': 'application/json' };
    if (auth.token) {
      headers['Authorization'] = `Bearer ${auth.token}`;
    }
    const response = await fetch(getApiUrl('/api/posts'), {
      method: 'POST',
      headers,
      body: JSON.stringify(newPostData),
    });
    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.message || 'Failed to create post');
    }
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error while creating post');
  }
});

export const updatePost = createAsyncThunk('posts/updatePost', async ({ id, updates }, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState();
    const headers = { 'Content-Type': 'application/json' };
    if (auth.token) {
      headers['Authorization'] = `Bearer ${auth.token}`;
    }
    const response = await fetch(getApiUrl(`/api/posts/${id}`), {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.message || 'Failed to update post');
    }
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error while updating post');
  }
});

export const deletePost = createAsyncThunk('posts/deletePost', async (id, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState();
    const headers = { 'Content-Type': 'application/json' };
    if (auth.token) {
      headers['Authorization'] = `Bearer ${auth.token}`;
    }
    const response = await fetch(getApiUrl(`/api/posts/${id}`), {
      method: 'DELETE',
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.message || 'Failed to delete post');
    }
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Network error while deleting post');
  }
});

export const togglePostStatus = createAsyncThunk('posts/togglePostStatus', async (id, { getState, dispatch, rejectWithValue }) => {
  try {
    const state = getState();
    const post = state.posts.entities[id];
    if (!post) throw new Error('Post not found in normalized state');

    const nextStatus = post.status === 'scheduled' ? 'draft' : 'scheduled';
    const nextScheduledAt = nextStatus === 'scheduled' ? (post.scheduledAt || new Date(Date.now() + 86400000).toISOString()) : null;

    return await dispatch(updatePost({
      id,
      updates: {
        status: nextStatus,
        scheduledAt: nextScheduledAt
      }
    })).unwrap();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Normalization CRUD reducers using entity adapter
    postAdded: postsAdapter.addOne,
    postUpdated: postsAdapter.updateOne,
    postRemoved: postsAdapter.removeOne,
    postsReceived: postsAdapter.setAll,
    setSelectedPostId: (state, action) => {
      state.selectedPostId = action.payload;
    },
    clearSelectedPostId: (state) => {
      state.selectedPostId = null;
    },
    resetPostsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchPosts
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.syncTimestamp = Date.now();
        postsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to load posts';
      })
      // createPost
      .addCase(createPost.pending, (state) => {
        state.status = 'saving';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        postsAdapter.addOne(state, action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to create post';
      })
      // updatePost
      .addCase(updatePost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const post = action.payload;
        const id = post._id || post.id;
        postsAdapter.upsertOne(state, post);
        if (state.selectedPostId === id) {
          state.selectedPostId = null;
        }
      })
      // deletePost
      .addCase(deletePost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        postsAdapter.removeOne(state, action.payload);
        if (state.selectedPostId === action.payload) {
          state.selectedPostId = null;
        }
      });
  },
});

export const {
  postAdded,
  postUpdated,
  postRemoved,
  postsReceived,
  setSelectedPostId,
  clearSelectedPostId,
  resetPostsState,
} = postsSlice.actions;

export default postsSlice.reducer;
