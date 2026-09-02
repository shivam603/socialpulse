import { createSlice } from '@reduxjs/toolkit';

// Filters Slice (EXP 1.2.1 & EXP 1.2.2)
// Decouples filter state from entity collections to enable high-performance memoized derived views
const initialState = {
  searchQuery: '',
  selectedPlatform: 'All',
  selectedStatus: 'all', // 'all' | 'draft' | 'scheduled'
  selectedTag: 'all',
  sortBy: 'date_desc', // 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc' | 'platform'
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedPlatform: (state, action) => {
      state.selectedPlatform = action.payload;
    },
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload;
    },
    setSelectedTag: (state, action) => {
      state.selectedTag = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setSearchQuery,
  setSelectedPlatform,
  setSelectedStatus,
  setSelectedTag,
  setSortBy,
  resetFilters,
} = filtersSlice.actions;

export const selectFilters = (state) => state.filters;
export const selectSearchQuery = (state) => state.filters.searchQuery;
export const selectFilterPlatform = (state) => state.filters.selectedPlatform;
export const selectFilterStatus = (state) => state.filters.selectedStatus;
export const selectFilterTag = (state) => state.filters.selectedTag;
export const selectSortBy = (state) => state.filters.sortBy;

export default filtersSlice.reducer;
