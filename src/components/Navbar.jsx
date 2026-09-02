import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout, selectIsAdmin } from '../store/slices/authSlice';
import {
  selectActiveView,
  setActiveView,
  selectProfilerEnabled,
  toggleProfiler,
} from '../store/slices/uiSlice';
import { selectTotalPostsCount } from '../store/selectors/postSelectors';
import {
  PenTool,
  LayoutGrid,
  Calendar,
  BarChart3,
  Cpu,
  Shield,
  LogOut,
  Sparkles,
  Activity,
} from 'lucide-react';

export const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  const activeView = useSelector(selectActiveView);
  const totalPosts = useSelector(selectTotalPostsCount);
  const profilerEnabled = useSelector(selectProfilerEnabled);

  return (
    <header className="header-wrapper">
      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-kicker">
            <span>EXP 1.2.1 & 1.2.2 · REDUX TOOLKIT & MEMOIZED SELECTORS</span>
          </div>
          <div className="brand-title">
            <Sparkles size={24} color="#e9b56f" />
            SocialPulse
          </div>
          <div className="brand-subtitle">
            Centralized Normalized State Management · Reselect Optimization · React.memo
          </div>
        </div>

        <div className="user-nav">
          <button
            onClick={() => dispatch(toggleProfiler())}
            className="btn-ghost btn-sm"
            style={{
              background: profilerEnabled ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              color: profilerEnabled ? '#6ee7b7' : '#9ca3af',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
            title="Toggle Performance Profiler Badges"
          >
            <Activity size={14} />
            {profilerEnabled ? 'Profiler: ON' : 'Profiler: OFF'}
          </button>

          {user && (
            <div className="user-badge">
              <span>{user.username || user.email}</span>
              <span className="role-tag">{user.role || 'user'}</span>
            </div>
          )}

          <button
            onClick={() => dispatch(logout())}
            className="btn-ghost btn-sm"
            style={{ color: '#ffb4a2', background: 'rgba(217, 103, 75, 0.2)' }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>

      <div className="tab-bar-container">
        <nav className="tabs-nav">
          <button
            className={`tab-btn ${activeView === 'composer' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveView('composer'))}
          >
            <PenTool size={15} />
            Composer
          </button>

          <button
            className={`tab-btn ${activeView === 'board' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveView('board'))}
          >
            <LayoutGrid size={15} />
            Board
            {totalPosts > 0 && <span className="tab-badge">{totalPosts}</span>}
          </button>

          <button
            className={`tab-btn ${activeView === 'calendar' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveView('calendar'))}
          >
            <Calendar size={15} />
            Calendar
          </button>

          <button
            className={`tab-btn ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveView('analytics'))}
          >
            <BarChart3 size={15} />
            Analytics & Derived Metrics
          </button>

          <button
            className={`tab-btn ${activeView === 'inspector' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveView('inspector'))}
            style={{
              background: activeView === 'inspector' ? '#ffffff' : 'rgba(242, 193, 78, 0.12)',
              color: activeView === 'inspector' ? '#102c2a' : '#b67a18',
              fontWeight: 700,
            }}
          >
            <Cpu size={15} />
            Redux State Inspector
          </button>

          {isAdmin && (
            <button
              className={`tab-btn ${activeView === 'admin' ? 'active' : ''}`}
              onClick={() => dispatch(setActiveView('admin'))}
            >
              <Shield size={15} />
              Admin Panel
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
