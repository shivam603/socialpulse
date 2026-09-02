import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setEditingDraft } from '../store/slices/draftsSlice';
import { deletePost, togglePostStatus } from '../store/slices/postsSlice';
import {
  setActiveView,
  showNotification,
  selectProfilerEnabled,
  recordComponentRender,
} from '../store/slices/uiSlice';
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Tag,
  Share2,
  CheckCircle2,
  Check,
  ExternalLink,
} from 'lucide-react';

// Memoized Post Card Component (EXP 1.2.2 - React.memo)
// Demonstrates how normalized state combined with React.memo prevents unnecessary re-renders of unaffected items
export const PostCard = React.memo(({ post }) => {
  const dispatch = useDispatch();
  const profilerEnabled = useSelector(selectProfilerEnabled);

  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  useEffect(() => {
    dispatch(recordComponentRender(`PostCard:${post._id || post.id}`));
  });

  const postId = post._id || post.id;
  const isScheduled = post.status === 'scheduled';
  const scheduledDate = post.scheduledAt
    ? new Date(post.scheduledAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Not scheduled (Draft)';

  const handleEdit = () => {
    dispatch(setEditingDraft(post));
    dispatch(setActiveView('composer'));
    dispatch(showNotification({ message: `Editing post "${post.title}" in Composer.`, type: 'info' }));
  };

  const handleDelete = () => {
    if (window.confirm(`Delete post "${post.title}"?`)) {
      dispatch(deletePost(postId));
      dispatch(showNotification({ message: 'Post removed from normalized Redux store.', type: 'info' }));
    }
  };

  const handleToggleStatus = () => {
    dispatch(togglePostStatus(postId));
  };

  return (
    <article className={`post-card ${isScheduled ? 'scheduled' : ''}`}>
      <div className="post-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`badge ${isScheduled ? 'badge-scheduled' : ''}`}>
              {isScheduled ? <Clock size={11} /> : <CheckCircle2 size={11} />}
              {post.status || 'draft'}
            </span>

            <span className="badge badge-channel">
              <Share2 size={11} />
              {post.platform}
            </span>

            {profilerEnabled && (
              <span className="render-badge" title="Number of times this individual PostCard has re-rendered">
                renders: {renderCountRef.current}
              </span>
            )}
          </div>

          <h3 className="post-title" style={{ marginTop: 4 }}>{post.title}</h3>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={handleEdit}
            title="Edit this post"
          >
            <Edit2 size={12} />
            Edit
          </button>
          <button
            type="button"
            className="btn-danger btn-sm"
            onClick={handleDelete}
            title="Delete post"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: isScheduled ? '#8c6014' : 'var(--muted)',
          background: isScheduled ? 'var(--gold-light)' : '#f4f7f5',
          padding: '4px 8px',
          borderRadius: 6,
          marginBottom: 8,
          width: 'fit-content',
        }}
      >
        <Calendar size={12} />
        <span>{scheduledDate}</span>
      </div>

      <p className="post-content">{post.content}</p>

      {post.mediaUrl && (
        <div style={{ marginBottom: 10 }}>
          <a
            href={post.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: 'var(--teal)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={12} />
            Attached Media Source
          </a>
        </div>
      )}

      <div className="post-footer">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(post.tags || []).map((tag, idx) => (
            <span
              key={idx}
              style={{
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 4,
                background: '#eef2f1',
                color: 'var(--teal-dark)',
                fontWeight: 600,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={handleToggleStatus}
          className="btn-ghost btn-sm"
          style={{ fontSize: 11, padding: '4px 8px' }}
          title="Toggle status between draft and scheduled"
        >
          {isScheduled ? 'Mark as Draft' : 'Schedule for Publishing'}
        </button>
      </div>
    </article>
  );
});

PostCard.displayName = 'PostCard';
