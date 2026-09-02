import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectPostStats,
  selectGroupedPostsByPlatform,
} from '../store/selectors/postSelectors';
import {
  selectProfilerEnabled,
  recordComponentRender,
} from '../store/slices/uiSlice';
import {
  BarChart2,
  PieChart,
  Hash,
  FileText,
  CalendarCheck,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const AnalyticsView = () => {
  const dispatch = useDispatch();
  const stats = useSelector(selectPostStats);
  const platformGroups = useSelector(selectGroupedPostsByPlatform);
  const profilerEnabled = useSelector(selectProfilerEnabled);

  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  useEffect(() => {
    dispatch(recordComponentRender('AnalyticsView'));
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Overview Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Total Workspace Posts
            </span>
            <FileText size={18} color="var(--teal)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--teal-dark)', margin: '8px 0 4px' }}>
            {stats.total}
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Normalized in Redux store</span>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Scheduled Ratio
            </span>
            <CalendarCheck size={18} color="var(--coral)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--coral)', margin: '8px 0 4px' }}>
            {stats.scheduledPercentage}%
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {stats.scheduled} scheduled / {stats.drafts} drafts
          </span>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Avg. Word Count
            </span>
            <TrendingUp size={18} color="var(--gold)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--gold)', margin: '8px 0 4px' }}>
            {stats.averageWordsPerPost}
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>words per post item</span>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Selector Cache Hits
            </span>
            <Sparkles size={18} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#4f46e5', margin: '8px 0 4px' }}>
            Memoized
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Computed via Reselect</span>
        </div>
      </div>

      <div className="grid-two">
        {/* Channel Distribution */}
        <div className="panel">
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>EXP 1.2.2 DERIVED GROUPING</span>
            {profilerEnabled && (
              <span className="render-badge">
                renders: {renderCountRef.current}
              </span>
            )}
          </div>
          <h2>Channel Breakdown</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
            Derived in \(O(N)\) once by <code>selectGroupedPostsByPlatform</code> and cached for zero re-computation.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.keys(platformGroups).length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>No post data available.</div>
            ) : (
              Object.entries(platformGroups).map(([channel, data]) => {
                const percent = stats.total > 0 ? Math.round((data.count / stats.total) * 100) : 0;
                return (
                  <div key={channel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <strong>{channel}</strong>
                      <span style={{ color: 'var(--muted)' }}>
                        {data.count} posts ({percent}%) · {data.scheduledCount} scheduled, {data.draftsCount} drafts
                      </span>
                    </div>
                    <div style={{ height: 8, background: '#eef2f0', borderRadius: 999, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percent}%`,
                          background: 'linear-gradient(90deg, #117a72, #d9674b)',
                          borderRadius: 999,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Hashtag Analytics */}
        <div className="panel">
          <div className="eyebrow">DERIVED TAG AGGREGATIONS</div>
          <h2>Top Hashtags</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
            Frequency extracted from post tag arrays using <code>selectPostStats</code>.
          </p>

          {stats.topTags.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>No tags found in current posts.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.topTags.map(([tag, count], index) => (
                <div
                  key={tag}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f8faf9',
                    borderRadius: 6,
                    border: '1px solid var(--line-subtle)',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--teal-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)', width: 16 }}>#{index + 1}</span>
                    #{tag}
                  </span>
                  <span className="badge">{count} {count === 1 ? 'post' : 'posts'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
