import { createSelector } from '@reduxjs/toolkit';
import { postsAdapter } from '../slices/postsSlice';
import {
  selectSearchQuery,
  selectFilterPlatform,
  selectFilterStatus,
  selectFilterTag,
  selectSortBy,
} from '../slices/filtersSlice';
import { selectCalendarDate } from '../slices/uiSlice';

// Adapter base selectors (EXP 1.2.1)
const basePostSelectors = postsAdapter.getSelectors((state) => state.posts);

export const selectAllPosts = basePostSelectors.selectAll;
export const selectPostEntities = basePostSelectors.selectEntities;
export const selectPostIds = basePostSelectors.selectIds;
export const selectTotalPostsCount = basePostSelectors.selectTotal;

// Parametric Selector for O(1) single post lookup from normalized entities
export const selectPostById = (id) => (state) => selectPostEntities(state)[id];

export const selectSelectedPostId = (state) => state.posts.selectedPostId;
export const selectPostsStatus = (state) => state.posts.status;
export const selectPostsError = (state) => state.posts.error;

// ==========================================
// MEMOIZED SELECTORS (EXP 1.2.2 - Reselect)
// ==========================================

/**
 * selectFilteredPosts:
 * Memoized selector that filters and sorts posts based on query, channel, status, tag, and sort criteria.
 * Caches output and avoids recalculation unless underlying collection or filter inputs change.
 */
export const selectFilteredPosts = createSelector(
  [
    selectAllPosts,
    selectSearchQuery,
    selectFilterPlatform,
    selectFilterStatus,
    selectFilterTag,
    selectSortBy,
  ],
  (posts, query, platform, status, tag, sortBy) => {
    const trimmedQuery = query.toLowerCase().trim();

    return posts
      .filter((post) => {
        // Platform filter
        if (platform !== 'All' && post.platform !== platform) {
          return false;
        }

        // Status filter
        if (status !== 'all' && (post.status || 'draft') !== status) {
          return false;
        }

        // Tag filter
        if (tag !== 'all') {
          const tags = Array.isArray(post.tags) ? post.tags : [];
          if (!tags.includes(tag)) return false;
        }

        // Search query filter (matches title, content, or tags)
        if (trimmedQuery) {
          const titleMatch = (post.title || '').toLowerCase().includes(trimmedQuery);
          const contentMatch = (post.content || '').toLowerCase().includes(trimmedQuery);
          const tagsMatch = (post.tags || []).some((t) => t.toLowerCase().includes(trimmedQuery));
          if (!titleMatch && !contentMatch && !tagsMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.createdAt || b.scheduledAt || 0) - new Date(a.createdAt || a.scheduledAt || 0);
        }
        if (sortBy === 'date_asc') {
          return new Date(a.createdAt || a.scheduledAt || 0) - new Date(b.createdAt || b.scheduledAt || 0);
        }
        if (sortBy === 'title_asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'title_desc') {
          return (b.title || '').localeCompare(a.title || '');
        }
        if (sortBy === 'platform') {
          return (a.platform || '').localeCompare(b.platform || '');
        }
        return 0;
      });
  }
);

/**
 * selectGroupedPostsByPlatform:
 * Memoized selector that aggregates posts into platform groupings with metadata.
 */
export const selectGroupedPostsByPlatform = createSelector(
  [selectAllPosts],
  (posts) => {
    const groups = {};
    for (const post of posts) {
      const channel = post.platform || 'Other';
      if (!groups[channel]) {
        groups[channel] = {
          platform: channel,
          count: 0,
          draftsCount: 0,
          scheduledCount: 0,
          posts: [],
        };
      }
      groups[channel].count += 1;
      if (post.status === 'scheduled') {
        groups[channel].scheduledCount += 1;
      } else {
        groups[channel].draftsCount += 1;
      }
      groups[channel].posts.push(post);
    }
    return groups;
  }
);

/**
 * selectPostStats:
 * Memoized selector deriving analytical summary data across the entire workspace.
 */
export const selectPostStats = createSelector(
  [selectAllPosts],
  (posts) => {
    const total = posts.length;
    let scheduled = 0;
    let drafts = 0;
    const platformBreakdown = {};
    const tagFrequency = {};
    let totalWordCount = 0;

    for (const post of posts) {
      if (post.status === 'scheduled') {
        scheduled += 1;
      } else {
        drafts += 1;
      }

      const channel = post.platform || 'Other';
      platformBreakdown[channel] = (platformBreakdown[channel] || 0) + 1;

      if (Array.isArray(post.tags)) {
        for (const tag of post.tags) {
          const clean = tag.trim().toLowerCase();
          if (clean) {
            tagFrequency[clean] = (tagFrequency[clean] || 0) + 1;
          }
        }
      }

      if (post.content) {
        totalWordCount += post.content.trim().split(/\s+/).length;
      }
    }

    const sortedTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const averageWordsPerPost = total > 0 ? Math.round(totalWordCount / total) : 0;

    return {
      total,
      scheduled,
      drafts,
      platformBreakdown,
      tagFrequency,
      topTags: sortedTags,
      averageWordsPerPost,
      scheduledPercentage: total > 0 ? Math.round((scheduled / total) * 100) : 0,
    };
  }
);

/**
 * selectCalendarEventsByMonth:
 * Memoized selector deriving a 42-day calendar month matrix for the selected date.
 */
export const selectCalendarEventsByMonth = createSelector(
  [selectAllPosts, selectCalendarDate],
  (posts, calendarDateStr) => {
    const calendarDate = new Date(calendarDateStr);
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthLabel = calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Map scheduled posts into date string map: YYYY-MM-DD -> Post[]
    const eventsByDate = {};
    for (const post of posts) {
      if (post.scheduledAt) {
        const d = new Date(post.scheduledAt);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = [];
        }
        eventsByDate[dateKey].push(post);
      }
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    const days = [];

    for (let i = 0; i < 42; i++) {
      const dayOffset = i - firstDayIndex + 1;
      const inCurrentMonth = dayOffset > 0 && dayOffset <= daysInMonth;

      let displayDay = dayOffset;
      let cellYear = year;
      let cellMonth = month;

      if (dayOffset <= 0) {
        displayDay = daysInPrevMonth + dayOffset;
        cellMonth = month - 1;
        if (cellMonth < 0) {
          cellMonth = 11;
          cellYear -= 1;
        }
      } else if (dayOffset > daysInMonth) {
        displayDay = dayOffset - daysInMonth;
        cellMonth = month + 1;
        if (cellMonth > 11) {
          cellMonth = 0;
          cellYear += 1;
        }
      }

      const dateKey = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(displayDay).padStart(2, '0')}`;
      const events = eventsByDate[dateKey] || [];

      days.push({
        dayNumber: displayDay,
        dateKey,
        inCurrentMonth,
        isToday: dateKey === todayKey,
        events,
      });
    }

    return {
      year,
      month,
      monthLabel,
      days,
    };
  }
);
