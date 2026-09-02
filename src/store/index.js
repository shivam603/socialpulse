import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './slices/postsSlice';
import platformsReducer from './slices/platformsSlice';
import draftsReducer from './slices/draftsSlice';
import filtersReducer from './slices/filtersSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import { actionLoggerMiddleware } from './middleware/actionLoggerMiddleware';

// Redux Store Configuration (EXP 1.2.1)
// Centralized store unifying all domain slices
export const store = configureStore({
  reducer: {
    posts: postsReducer,
    platforms: platformsReducer,
    drafts: draftsReducer,
    filters: filtersReducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore date objects in draft form buffer if any
        ignoredActions: ['drafts/setEditingDraft', 'ui/setCalendarDate'],
      },
    }).concat(actionLoggerMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
