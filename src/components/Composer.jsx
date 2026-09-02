import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectActiveDraft,
  selectIsDraftDirty,
  selectSavedDrafts,
  updateDraftField,
  resetDraft,
  saveLocalSnapshot,
  restoreSnapshot,
  removeSnapshot,
} from '../store/slices/draftsSlice';
import { selectAllPlatforms } from '../store/slices/platformsSlice';
import { createPost, updatePost, fetchPosts } from '../store/slices/postsSlice';
import {
  showNotification,
  selectProfilerEnabled,
  recordComponentRender,
} from '../store/slices/uiSlice';
import {
  Send,
  Save,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Trash2,
  Calendar,
} from 'lucide-react';

export const Composer = () => {
  const dispatch = useDispatch();
  const draft = useSelector(selectActiveDraft);
  const isDirty = useSelector(selectIsDraftDirty);
  const savedSnapshots = useSelector(selectSavedDrafts);
  const platforms = useSelector(selectAllPlatforms);
  const profilerEnabled = useSelector(selectProfilerEnabled);

  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  useEffect(() => {
    dispatch(recordComponentRender('Composer'));
  });

  // Find active platform details
  const currentPlatform = platforms.find((p) => p.id === draft.platform) || platforms[0];
  const charLimit = currentPlatform?.maxCharacters || 2200;
  const currentLength = (draft.content || '').length;
  const isOverLimit = currentLength > charLimit;

  const handleChange = (field, value) => {
    dispatch(updateDraftField({ field, value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) {
      dispatch(showNotification({ message: 'Title and content are required.', type: 'error' }));
      return;
    }

    if (isOverLimit) {
      dispatch(showNotification({ message: `Content exceeds ${currentPlatform.name} limit (${charLimit} chars).`, type: 'error' }));
      return;
    }

    const payload = {
      title: draft.title.trim(),
      content: draft.content.trim(),
      platform: draft.platform,
      scheduledAt: draft.scheduledAt ? new Date(draft.scheduledAt).toISOString() : null,
      mediaUrl: draft.mediaUrl.trim() || null,
      tags: draft.tags
        ? draft.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    };

    try {
      if (draft.id) {
        await dispatch(updatePost({ id: draft.id, updates: payload })).unwrap();
        dispatch(showNotification({ message: 'Post updated in Redux store and persisted.', type: 'success' }));
      } else {
        await dispatch(createPost(payload)).unwrap();
        dispatch(showNotification({ message: 'New post created and normalized in Redux store.', type: 'success' }));
      }
      dispatch(resetDraft());
    } catch (err) {
      dispatch(showNotification({ message: String(err), type: 'error' }));
    }
  };

  const handleClear = () => {
    dispatch(resetDraft());
    dispatch(showNotification({ message: 'Draft cleared.', type: 'info' }));
  };

  const handleSnapshot = () => {
    dispatch(saveLocalSnapshot());
    dispatch(showNotification({ message: 'Draft snapshot saved to Redux buffer.', type: 'success' }));
  };

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: 16, marginBottom: 16 }}>
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>EXP 1.2.1 STATE DISPATCH</span>
            {profilerEnabled && (
              <span className="render-badge">
                renders: {renderCountRef.current}
              </span>
            )}
          </div>
          <h2>{draft.id ? 'Edit Post' : 'Post Composer'}</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
            Centralized draft buffering in Redux <code>draftsSlice</code> with character validation and snapshot caching.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {isDirty && (
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={handleSnapshot}
              title="Save temporary draft snapshot in Redux state"
            >
              <Save size={13} />
              Save Redux Snapshot
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="post-title">Post Title</label>
          <input
            id="post-title"
            type="text"
            placeholder="E.g., Q3 Product Announcement or Redux Architecture Guide"
            required
            value={draft.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="post-platform">Publishing Channel</label>
            <select
              id="post-platform"
              value={draft.platform}
              onChange={(e) => handleChange('platform', e.target.value)}
            >
              {platforms.map((plat) => (
                <option key={plat.id} value={plat.id}>
                  {plat.name} (Max {plat.maxCharacters} chars)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="post-schedule">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} /> Schedule for (Optional)
              </span>
            </label>
            <input
              id="post-schedule"
              type="datetime-local"
              value={draft.scheduledAt}
              onChange={(e) => handleChange('scheduledAt', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="post-media">Media URL (Optional)</label>
          <input
            id="post-media"
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            value={draft.mediaUrl}
            onChange={(e) => handleChange('mediaUrl', e.target.value)}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <label htmlFor="post-content" style={{ margin: 0 }}>Content Body</label>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: isOverLimit ? '#d9674b' : 'var(--muted)',
                fontWeight: isOverLimit ? 700 : 400,
              }}
            >
              {currentLength} / {charLimit} chars
            </span>
          </div>
          <textarea
            id="post-content"
            placeholder="Compose your post copy here. Redux Toolkit will manage the state lifecycle and normalize the final entity..."
            required
            value={draft.content}
            onChange={(e) => handleChange('content', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="post-tags">Tags (Comma-separated)</label>
          <input
            id="post-tags"
            type="text"
            placeholder="react, reduxtoolkit, reselect, webdev"
            value={draft.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="submit" className="btn-primary">
            <Send size={15} />
            {draft.id ? 'Update Post' : draft.scheduledAt ? 'Schedule Post' : 'Save as Draft'}
          </button>

          <button type="button" className="btn-ghost" onClick={handleClear}>
            <RotateCcw size={15} />
            Clear
          </button>

          {isDirty && (
            <span style={{ fontSize: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} /> Unsaved edits in Redux draft buffer
            </span>
          )}
        </div>
      </form>

      {savedSnapshots.length > 0 && (
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line-subtle)' }}>
          <div className="eyebrow">Redux Draft Snapshots Buffer ({savedSnapshots.length})</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {savedSnapshots.map((snap) => (
              <div
                key={snap.snapshotId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#f4f7f5',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 12,
                }}
              >
                <span
                  style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--teal-dark)' }}
                  onClick={() => dispatch(restoreSnapshot(snap.snapshotId))}
                  title="Click to restore this snapshot into active draft"
                >
                  <FileText size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {snap.title || 'Untitled'} ({snap.platform})
                </span>
                <button
                  type="button"
                  style={{ padding: 2, background: 'transparent', color: '#a33a25' }}
                  onClick={() => dispatch(removeSnapshot(snap.snapshotId))}
                  title="Remove snapshot"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
