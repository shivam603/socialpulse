import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/uiSlice';
import { fetchPosts } from '../store/slices/postsSlice';
import { getApiUrl } from '../config/api';
import { Shield, Users, FileText, CheckCircle, Trash2, UserCheck } from 'lucide-react';

export const AdminPanel = () => {
  const dispatch = useDispatch();
  const { token, user: currentUser } = useSelector(selectAuth);

  const [summary, setSummary] = useState({ users: 0, posts: 0, scheduled: 0 });
  const [users, setUsers] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const [sumRes, usersRes, postsRes] = await Promise.all([
        fetch(getApiUrl('/api/admin/summary'), { headers }).then((r) => r.json()),
        fetch(getApiUrl('/api/admin/users'), { headers }).then((r) => r.json()),
        fetch(getApiUrl('/api/admin/posts'), { headers }).then((r) => r.json()),
      ]);
      setSummary(sumRes || {});
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setAllPosts(Array.isArray(postsRes) ? postsRes : []);
    } catch (err) {
      dispatch(showNotification({ message: 'Failed to load admin data: ' + err.message, type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [token]);

  const handleRoleChange = async (userId, nextRole) => {
    try {
      const response = await fetch(getApiUrl(`/api/admin/users/${userId}/role`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      });
      if (!response.ok) throw new Error('Failed to change user role');
      dispatch(showNotification({ message: `User role updated to ${nextRole}.`, type: 'success' }));
      loadAdminData();
    } catch (err) {
      dispatch(showNotification({ message: err.message, type: 'error' }));
    }
  };

  const handleAdminDeletePost = async (postId) => {
    if (!window.confirm('Moderate/delete this post from workspace?')) return;
    try {
      const response = await fetch(getApiUrl(`/api/admin/posts/${postId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete post');
      dispatch(showNotification({ message: 'Post moderated and deleted.', type: 'info' }));
      loadAdminData();
      dispatch(fetchPosts());
    } catch (err) {
      dispatch(showNotification({ message: err.message, type: 'error' }));
    }
  };

  if (loading) {
    return <div className="panel" style={{ textAlign: 'center', padding: 40 }}>Loading administrative data...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Total Users
            </span>
            <Users size={18} color="var(--teal)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--teal-dark)', margin: '8px 0 4px' }}>
            {summary.users}
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Total Posts
            </span>
            <FileText size={18} color="var(--coral)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--coral)', margin: '8px 0 4px' }}>
            {summary.posts}
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Scheduled Queue
            </span>
            <CheckCircle size={18} color="var(--gold)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--gold)', margin: '8px 0 4px' }}>
            {summary.scheduled}
          </div>
        </div>
      </div>

      <div className="grid-two">
        {/* User Management */}
        <div className="panel">
          <div className="eyebrow">WORKSPACE ACCOUNTS</div>
          <h2>User Governance</h2>
          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 6px' }}>User</th>
                  <th style={{ padding: '8px 6px' }}>Role</th>
                  <th style={{ padding: '8px 6px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id || u._id} style={{ borderBottom: '1px solid var(--line-subtle)' }}>
                    <td style={{ padding: '10px 6px' }}>
                      <div style={{ fontWeight: 600 }}>{u.username}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '10px 6px' }}>
                      <span className="badge" style={{ textTransform: 'uppercase' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '10px 6px' }}>
                      {u.id !== currentUser.id ? (
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          onClick={() => handleRoleChange(u.id || u._id, u.role === 'admin' ? 'user' : 'admin')}
                        >
                          Make {u.role === 'admin' ? 'user' : 'admin'}
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>Current session</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Post Moderation */}
        <div className="panel">
          <div className="eyebrow">MODERATION WORKFLOW</div>
          <h2>All Posts ({allPosts.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16, maxHeight: 400, overflowY: 'auto' }}>
            {allPosts.map((p) => (
              <div
                key={p.id || p._id}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  padding: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className="badge">{p.platform}</span>
                    <span className="badge">{p.status}</span>
                  </div>
                  <strong style={{ display: 'block', fontSize: 14, margin: '4px 0 2px' }}>{p.title}</strong>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Author ID: {p.author}</div>
                </div>
                <button
                  type="button"
                  className="btn-danger btn-sm"
                  onClick={() => handleAdminDeletePost(p.id || p._id)}
                  title="Moderate post"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
