import { createSlice } from '@reduxjs/toolkit';

// Drafts Slice (EXP 1.2.1)
// Centralized state management for composer draft buffering, field validation, and temporary working data
const initialDraftState = {
  activeDraft: {
    id: null, // null for new draft, or post ID when editing
    title: '',
    content: '',
    platform: 'Instagram',
    scheduledAt: '',
    mediaUrl: '',
    tags: '',
  },
  savedDrafts: [], // array of local draft snapshots
  isDirty: false,
  lastAutoSaved: null,
};

const draftsSlice = createSlice({
  name: 'drafts',
  initialState: initialDraftState,
  reducers: {
    updateDraftField: (state, action) => {
      const { field, value } = action.payload;
      state.activeDraft[field] = value;
      state.isDirty = true;
    },
    setEditingDraft: (state, action) => {
      const post = action.payload;
      if (!post) {
        state.activeDraft = { ...initialDraftState.activeDraft };
        state.isDirty = false;
        return;
      }
      state.activeDraft = {
        id: post._id || post.id,
        title: post.title || '',
        content: post.content || '',
        platform: post.platform || 'Instagram',
        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
        mediaUrl: post.mediaUrl || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
      };
      state.isDirty = false;
    },
    resetDraft: (state) => {
      state.activeDraft = { ...initialDraftState.activeDraft };
      state.isDirty = false;
    },
    saveLocalSnapshot: (state) => {
      if (!state.activeDraft.title && !state.activeDraft.content) return;
      const snapshot = {
        ...state.activeDraft,
        savedAt: new Date().toISOString(),
        snapshotId: 'draft_' + Date.now(),
      };
      state.savedDrafts.unshift(snapshot);
      if (state.savedDrafts.length > 5) state.savedDrafts.pop();
      state.lastAutoSaved = Date.now();
      state.isDirty = false;
    },
    restoreSnapshot: (state, action) => {
      const snapshot = state.savedDrafts.find((s) => s.snapshotId === action.payload);
      if (snapshot) {
        state.activeDraft = { ...snapshot };
        state.isDirty = true;
      }
    },
    removeSnapshot: (state, action) => {
      state.savedDrafts = state.savedDrafts.filter((s) => s.snapshotId !== action.payload);
    },
  },
});

export const {
  updateDraftField,
  setEditingDraft,
  resetDraft,
  saveLocalSnapshot,
  restoreSnapshot,
  removeSnapshot,
} = draftsSlice.actions;

export const selectActiveDraft = (state) => state.drafts.activeDraft;
export const selectIsDraftDirty = (state) => state.drafts.isDirty;
export const selectSavedDrafts = (state) => state.drafts.savedDrafts;

export default draftsSlice.reducer;
