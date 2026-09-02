import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectFilteredPosts,
  selectTotalPostsCount,
} from '../store/selectors/postSelectors';
import { selectAllPlatforms } from '../store/slices/platformsSlice';
import {
  selectFilters,
  setSearchQuery,
  setSelectedPlatform,
  setSelectedStatus,
  setSortBy,
  resetFilters,
} from '../store/slices/filtersSlice';
import {
  selectProfilerEnabled,
  recordComponentRender,
} from '../store/slices/uiSlice';
import { PostCard } from './PostCard';
import {
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Sparkles,
  Inbox,
  RotateCcw,
} from 'lucide-react';

export const PostList = () => {
  const dispatch = useDispatch();
  const filteredPosts = useSelector(selectFilteredPosts);
  const totalCount = useSelector(selectTotalPostsCount);
  const platforms = useSelector(selectAllPlatforms);
  const filters = useSelector(selectFilters);
  const profilerEnabled = useSelector(selectProfilerEnabled);

  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  useEffect(() => {
    dispatch(recordComponentRender('PostList'));
  });

  return (
    <div className="panel">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--line)',
          paddingBottom: 16,
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>EXP 1.2.2 MEMOIZED SELECTOR DERIVATION</span>
            {profilerEnabled && (
              <span className="render-badge">
                renders: {renderCountRef.current}
              </span>
            )}
          </div>
          <h2>Post Board ({filteredPosts.length} of {totalCount})</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            Rendered via <code>createSelector(selectFilteredPosts)</code> with memoized cache preservation.
          </p>
        </div>

        {(filters.searchQuery || filters.selectedPlatform !== 'All' || filters.selectedStatus !== 'all' || filters.sortBy !== 'date_desc') && (
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => dispatch(resetFilters())}
          >
            <RotateCcw size={12} />
            Reset Filters
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              top: '50%',
              left: 12,
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search posts by title, body content, or #tag..."
            style={{ paddingLeft: 36 }}
            value={filters.searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 4, background: '#eaf1ee', padding: 3, borderRadius: 8 }}>
            {[
              { id: 'all', label: 'All Posts' },
              { id: 'draft', label: 'Drafts' },
              { id: 'scheduled', label: 'Scheduled' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                className="btn-sm"
                style={{
                  background: filters.selectedStatus === st.id ? '#ffffff' : 'transparent',
                  color: filters.selectedStatus === st.id ? 'var(--teal-dark)' : 'var(--muted)',
                  boxShadow: filters.selectedStatus === st.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
                onClick={() => dispatch(setSelectedStatus(st.id))}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowUpDown size={14} color="var(--muted)" />
            <select
              style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
              value={filters.sortBy}
              onChange={(e) => dispatch(setSortBy(e.target.value))}
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
              <option value="platform">Platform</option>
            </select>
          </div>
        </div>

        {/* Platform Chip Filter Row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
            Channel:
          </span>
          <button
            type="button"
            className="btn-sm"
            style={{
              padding: '4px 8px',
              borderRadius: 999,
              fontSize: 11,
              background: filters.selectedPlatform === 'All' ? 'var(--teal)' : '#eef2f0',
              color: filters.selectedPlatform === 'All' ? '#ffffff' : 'var(--ink)',
            }}
            onClick={() => dispatch(setSelectedPlatform('All'))}
          >
            All Channels
          </button>
          {platforms.map((plat) => (
            <button
              key={plat.id}
              type="button"
              className="btn-sm"
              style={{
                padding: '4px 8px',
                borderRadius: 999,
                fontSize: 11,
                background: filters.selectedPlatform === plat.id ? 'var(--teal)' : '#eef2f0',
                color: filters.selectedPlatform === plat.id ? '#ffffff' : 'var(--ink)',
              }}
              onClick={() => dispatch(setSelectedPlatform(plat.id))}
            >
              {plat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Post List */}
      {filteredPosts.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: '#fafbfb',
            border: '2px dashed var(--line)',
            borderRadius: 10,
          }}
        >
          <Inbox size={36} color="#a0b2ac" style={{ margin: 'auto', marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, color: 'var(--ink)' }}>No posts match current filters</h3>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            Create a new post in the Composer, or reset active search filters.
          </p>
        </div>
      ) : (
        <div className="post-list">
          {filteredPosts.map((post) => (
            <PostCard key={post._id || post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
