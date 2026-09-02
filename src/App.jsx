import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from './store/slices/authSlice';
import {
  selectActiveView,
  selectNotification,
  clearNotification,
} from './store/slices/uiSlice';
import { fetchPosts } from './store/slices/postsSlice';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { Composer } from './components/Composer';
import { PostList } from './components/PostList';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { StateInspector } from './components/StateInspector';
import { AdminPanel } from './components/AdminPanel';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const activeView = useSelector(selectActiveView);
  const notification = useSelector(selectNotification);

  // Load initial posts upon authentication
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPosts())
        .unwrap()
        .catch((err) => {
          if (String(err).toLowerCase().includes('token') || String(err).toLowerCase().includes('session') || String(err).toLowerCase().includes('401')) {
            dispatch(logout());
            dispatch(showNotification({ message: 'Previous session expired. Please sign in again.', type: 'info' }));
          }
        });
    }
  }, [isAuthenticated, dispatch]);

  // Auto-dismiss toast notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div>
      <Navbar />

      <main className="main-content">
        {activeView === 'composer' && (
          <div className="grid-two">
            <Composer />
            <PostList />
          </div>
        )}

        {activeView === 'board' && <PostList />}

        {activeView === 'calendar' && <CalendarView />}

        {activeView === 'analytics' && <AnalyticsView />}

        {activeView === 'inspector' && <StateInspector />}

        {activeView === 'admin' && <AdminPanel />}
      </main>

      {/* Floating Toast Notification */}
      {notification && (
        <div
          className="toast-notice"
          style={{
            borderLeft: `4px solid ${
              notification.type === 'error'
                ? '#ef4444'
                : notification.type === 'info'
                ? '#3b82f6'
                : '#10b981'
            }`,
          }}
        >
          {notification.type === 'error' ? (
            <AlertCircle size={18} color="#ef4444" />
          ) : notification.type === 'info' ? (
            <Info size={18} color="#3b82f6" />
          ) : (
            <CheckCircle2 size={18} color="#10b981" />
          )}

          <span>{notification.message}</span>

          <button
            type="button"
            style={{ background: 'transparent', padding: 2, color: '#9ca3af', marginLeft: 8 }}
            onClick={() => dispatch(clearNotification())}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
