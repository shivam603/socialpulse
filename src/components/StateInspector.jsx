import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectPostIds,
  selectPostEntities,
  selectAllPosts,
  selectFilteredPosts,
} from '../store/selectors/postSelectors';
import {
  selectRenderStats,
  selectActionLog,
  resetRenderStats,
  clearActionLog,
} from '../store/slices/uiSlice';
import {
  Database,
  Layers,
  Cpu,
  Activity,
  Trash2,
  CheckCircle,
  Zap,
  Code2,
} from 'lucide-react';

export const StateInspector = () => {
  const dispatch = useDispatch();
  const rawState = useSelector((state) => state);
  const postIds = useSelector(selectPostIds);
  const postEntities = useSelector(selectPostEntities);
  const allPosts = useSelector(selectAllPosts);
  const filteredPosts = useSelector(selectFilteredPosts);
  const renderStats = useSelector(selectRenderStats);
  const actionLog = useSelector(selectActionLog);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="panel" style={{ background: '#102c2a', color: '#ffffff', borderColor: '#194945' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: '#e9b56f' }}>
              LAB EVALUATION & ARCHITECTURE DASHBOARD
            </div>
            <h2 style={{ color: '#ffffff', margin: '4px 0' }}>
              Redux Toolkit Normalized State & Reselect Profiler
            </h2>
            <p style={{ color: '#a8c1bc', fontSize: 13, maxWidth: 800 }}>
              This inspector provides live inspection into the normalized Redux store tree, demonstrates Reselect memoization cache mechanics, and logs real-time component re-render counters.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn-ghost btn-sm"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
              onClick={() => dispatch(resetRenderStats())}
            >
              <RotateIcon size={12} />
              Reset Render Counters
            </button>
            <button
              type="button"
              className="btn-ghost btn-sm"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
              onClick={() => dispatch(clearActionLog())}
            >
              <Trash2 size={12} />
              Clear Action Stream
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Normalization vs Re-render stats */}
      <div className="grid-two">
        {/* Normalized State Structure Card */}
        <div className="panel">
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Database size={13} />
            EXP 1.2.1 · NORMALIZED STATE PATTERN
          </div>
          <h2>Normalized Entity Store</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>
            Data is organized into <code>ids</code> (ordered index) and <code>entities</code> (lookup dictionary) via <code>createEntityAdapter</code>:
          </p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 12 }}>
            <span className="badge" style={{ background: '#eef2ff', color: '#4338ca' }}>
              Total Entity IDs: {postIds.length}
            </span>
            <span className="badge" style={{ background: '#ecfdf5', color: '#047857' }}>
              Dictionary Keys: {Object.keys(postEntities).length}
            </span>
            <span className="badge" style={{ background: '#fffbeb', color: '#b45309' }}>
              Lookup Complexity: O(1)
            </span>
          </div>

          <div className="inspector-card">
            <div style={{ color: '#9ca3af', marginBottom: 8 }}>// Normalized Posts Slice State</div>
            <div>
              <span className="inspector-key">"ids"</span>: [
              {postIds.map((id, i) => (
                <span key={id} className="inspector-val-str">
                  "{id}"{i < postIds.length - 1 ? ', ' : ''}
                </span>
              ))}
              ],
            </div>
            <div style={{ marginTop: 8 }}>
              <span className="inspector-key">"entities"</span>: {'{'}
              {Object.entries(postEntities).map(([id, post]) => (
                <div key={id} style={{ paddingLeft: 16 }}>
                  <span className="inspector-key">"{id}"</span>: {'{'}
                  <div style={{ paddingLeft: 16 }}>
                    <div><span className="inspector-key">title</span>: <span className="inspector-val-str">"{post.title}"</span>,</div>
                    <div><span className="inspector-key">platform</span>: <span className="inspector-val-str">"{post.platform}"</span>,</div>
                    <div><span className="inspector-key">status</span>: <span className="inspector-val-str">"{post.status}"</span>,</div>
                    <div><span className="inspector-key">tags</span>: [{ (post.tags || []).map(t => `"${t}"`).join(', ') }]</div>
                  </div>
                  {'}'},
                </div>
              ))}
              {'}'}
            </div>
          </div>
        </div>

        {/* Component Re-render Performance Telemetry */}
        <div className="panel">
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={13} />
            EXP 1.2.2 · RE-RENDER PROFILER & TELEMETRY
          </div>
          <h2>Component Re-render Counts</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
            Demonstrates how <code>React.memo</code> and normalized state prevent cascade re-renders:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#f4f7f5',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              <span>Total Application Render Cycles</span>
              <span style={{ color: 'var(--teal-dark)', fontFamily: 'var(--font-mono)' }}>
                {renderStats.totalRenders}
              </span>
            </div>

            <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8faf9' }}>
                    <th style={{ padding: '8px 12px' }}>Component Name</th>
                    <th style={{ padding: '8px 12px' }}>Optimization</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Renders</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--line-subtle)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>PostCard (per item)</td>
                    <td style={{ padding: '8px 12px', color: '#059669' }}>
                      <CheckCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                      React.memo (Props Eq)
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {Object.entries(renderStats.componentRenderCounts)
                        .filter(([k]) => k.startsWith('PostCard'))
                        .reduce((sum, [, v]) => sum + v, 0)}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--line-subtle)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>PostList</td>
                    <td style={{ padding: '8px 12px', color: '#059669' }}>
                      <CheckCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Reselect Memoized
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {renderStats.componentRenderCounts['PostList'] || 0}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--line-subtle)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>Composer</td>
                    <td style={{ padding: '8px 12px', color: '#059669' }}>
                      <CheckCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Isolated Draft Slice
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {renderStats.componentRenderCounts['Composer'] || 0}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--line-subtle)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>CalendarView</td>
                    <td style={{ padding: '8px 12px', color: '#059669' }}>
                      <CheckCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Derived Month Matrix
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {renderStats.componentRenderCounts['CalendarView'] || 0}
                    </td>
                  </tr>

                  <tr>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>AnalyticsView</td>
                    <td style={{ padding: '8px 12px', color: '#059669' }}>
                      <CheckCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Derived Stats Selector
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {renderStats.componentRenderCounts['AnalyticsView'] || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ fontSize: 12, color: 'var(--muted)', background: '#fafaf8', padding: 10, borderRadius: 6 }}>
              ✨ <strong>Observation Guide:</strong> When you edit a post in Composer or change a single item, notice how other <code>PostCard</code> render counts do NOT increment!
            </div>
          </div>
        </div>
      </div>

      {/* Dispatched Redux Action Stream */}
      <div className="panel">
        <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={13} color="#f59e0b" />
          EXP 1.2.1 · LIVE REDUX ACTION STREAM
        </div>
        <h2>Dispatched Action Log</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>
          Intercepted in real-time by custom Redux middleware:
        </p>

        <div className="inspector-card" style={{ maxHeight: 220 }}>
          {actionLog.length === 0 ? (
            <div style={{ color: '#9ca3af' }}>No actions logged yet. Interact with the application to generate action stream.</div>
          ) : (
            actionLog.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '4px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div>
                  <span style={{ color: '#fbbf24', fontWeight: 600 }}>{act.type}</span>
                  {act.payload !== undefined && (
                    <span style={{ color: '#93c5fd', marginLeft: 8 }}>
                      payload: {typeof act.payload === 'object' ? JSON.stringify(act.payload) : String(act.payload)}
                    </span>
                  )}
                </div>
                <span style={{ color: '#6b7280', fontSize: 11 }}>{act.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const RotateIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
