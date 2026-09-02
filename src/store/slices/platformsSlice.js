import { createSlice } from '@reduxjs/toolkit';

// Platforms Slice (EXP 1.2.1)
// Centralized state for social media channels, configuration, character constraints and badges
const initialPlatforms = [
  {
    id: 'Instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#e1306c',
    bgLight: '#fdf2f4',
    maxCharacters: 2200,
    supportsMedia: true,
    enabled: true,
    description: 'Visual stories, reels, carousels and lifestyle narratives',
  },
  {
    id: 'Facebook',
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877f2',
    bgLight: '#f0f5fe',
    maxCharacters: 63206,
    supportsMedia: true,
    enabled: true,
    description: 'Community updates, long-form discussion and media shares',
  },
  {
    id: 'X',
    name: 'X (Twitter)',
    icon: 'twitter',
    color: '#111827',
    bgLight: '#f3f4f6',
    maxCharacters: 280,
    supportsMedia: true,
    enabled: true,
    description: 'Bite-sized updates, tech commentary, hashtags and real-time news',
  },
  {
    id: 'Reddit',
    name: 'Reddit',
    icon: 'reddit',
    color: '#ff4500',
    bgLight: '#fff2ed',
    maxCharacters: 40000,
    supportsMedia: true,
    enabled: true,
    description: 'Deep discussions, AMAs, subreddits and community engagement',
  },
  {
    id: 'Quora',
    name: 'Quora',
    icon: 'quora',
    color: '#b92b27',
    bgLight: '#fdf0ef',
    maxCharacters: 15000,
    supportsMedia: true,
    enabled: true,
    description: 'Expert Q&A, knowledge sharing and thought leadership',
  },
  {
    id: 'LinkedIn',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0a66c2',
    bgLight: '#f0f6fc',
    maxCharacters: 3000,
    supportsMedia: true,
    enabled: true,
    description: 'Professional insights, hiring, engineering milestones and careers',
  },
  {
    id: 'YouTube',
    name: 'YouTube Community',
    icon: 'youtube',
    color: '#ff0000',
    bgLight: '#fef2f2',
    maxCharacters: 5000,
    supportsMedia: true,
    enabled: true,
    description: 'Video announcements, audience polls, community teasers',
  },
  {
    id: 'Other',
    name: 'Other Channel',
    icon: 'share-2',
    color: '#4b5563',
    bgLight: '#f3f4f6',
    maxCharacters: 10000,
    supportsMedia: true,
    enabled: true,
    description: 'Custom newsletters, internal blogs or alternative webhooks',
  },
];

const platformsSlice = createSlice({
  name: 'platforms',
  initialState: {
    items: initialPlatforms,
    selectedPlatformId: 'All',
  },
  reducers: {
    selectPlatform: (state, action) => {
      state.selectedPlatformId = action.payload;
    },
    togglePlatformEnabled: (state, action) => {
      const platform = state.items.find((p) => p.id === action.payload);
      if (platform) {
        platform.enabled = !platform.enabled;
      }
    },
    updatePlatformLimit: (state, action) => {
      const { id, maxCharacters } = action.payload;
      const platform = state.items.find((p) => p.id === id);
      if (platform && maxCharacters > 0) {
        platform.maxCharacters = maxCharacters;
      }
    },
  },
});

export const { selectPlatform, togglePlatformEnabled, updatePlatformLimit } = platformsSlice.actions;

export const selectAllPlatforms = (state) => state.platforms.items;
export const selectActivePlatformFilter = (state) => state.platforms.selectedPlatformId;

export default platformsSlice.reducer;
