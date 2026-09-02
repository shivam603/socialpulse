import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, selectAuth, clearAuthError } from '../store/slices/authSlice';
import { Lock, Mail, User, Sparkles, AlertCircle } from 'lucide-react';

export const AuthModal = () => {
  const dispatch = useDispatch();
  const { status, error } = useSelector(selectAuth);

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      dispatch(registerUser({ username, email, password }));
    } else {
      dispatch(loginUser({ email, password }));
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    dispatch(clearAuthError());
  };

  return (
    <div style={{ maxWidth: 440, margin: '60px auto', padding: '0 20px' }}>
      <div className="panel" style={{ position: 'relative', overflow: 'hidden', padding: 32 }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            background: 'linear-gradient(90deg, #d9674b 0%, #e9b56f 50%, #117a72 100%)',
          }}
        />

        <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} color="#117a72" />
          Redux State Architecture Demo
        </div>

        <h2 style={{ fontSize: '1.6rem', margin: '8px 0 16px' }}>
          {isRegister ? 'Create Account' : 'Sign in to SocialPulse'}
        </h2>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              background: '#fff0eb',
              color: '#a33a25',
              fontSize: 13,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label htmlFor="auth-username">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <User size={13} /> Username
                </span>
              </label>
              <input
                id="auth-username"
                type="text"
                placeholder="Shivam"
                required={isRegister}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Mail size={13} /> Email address
              </span>
            </label>
            <input
              id="auth-email"
              type="email"
              placeholder="user@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="auth-password">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Lock size={13} /> Password
              </span>
            </label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: 20, padding: 12 }}
            disabled={status === 'loading'}
          >
            {status === 'loading'
              ? 'Authenticating...'
              : isRegister
              ? 'Create Workspace Account'
              : 'Sign In to Workspace'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            type="button"
            className="btn-ghost"
            style={{ width: '100%' }}
            onClick={toggleMode}
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </button>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 8,
            background: '#f4f7f5',
            fontSize: 12,
            color: '#64717a',
            border: '1px solid var(--line)',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
            ⚡ Quick 1-Click Credentials for Lab Testing:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <button
              type="button"
              className="btn-ghost btn-sm"
              style={{ fontSize: 11, padding: '4px 8px' }}
              onClick={() => {
                setIsRegister(false);
                setEmail('admin@contentdeck.local');
                setPassword('Admin@12345');
                dispatch(loginUser({ email: 'admin@contentdeck.local', password: 'Admin@12345' }));
              }}
            >
              Sign in as Admin
            </button>
            <button
              type="button"
              className="btn-ghost btn-sm"
              style={{ fontSize: 11, padding: '4px 8px' }}
              onClick={() => {
                setIsRegister(true);
                setUsername('Shivam');
                setEmail('shivam@test.local');
                setPassword('Test@12345');
              }}
            >
              Fill Demo User Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
