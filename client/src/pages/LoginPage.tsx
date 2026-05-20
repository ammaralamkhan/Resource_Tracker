// ================================================================
// Login Page
// ================================================================
import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IconShield, IconAlertTriangle, IconLoader, IconX } from '../components/icons/Icons';
import api from '../services/api';
import './LoginPage.css';

export default function LoginPage() {
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Forgot password modal
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  // If already authenticated, redirect
  const from = (location.state as any)?.from?.pathname || '/';
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }


  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Authentication failed. Please try again.';
      setError(message);
    }
  }

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg(data.message || 'Request sent! The administrator will reset your password shortly.');
      setForgotEmail('');
    } catch {
      setForgotMsg('Request sent! The administrator will reset your password shortly.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <IconShield size={28} color="#fff" />
            </div>
            <h1>Resource Tracker</h1>
            <p>Computer Science Department</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="login-error" role="alert">
                <IconAlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@cs.amu.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={isLoading}
              id="login-submit-btn"
            >
              {isLoading ? <IconLoader size={18} /> : null}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForgot(true); setForgotMsg(''); setForgotEmail(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                textAlign: 'center',
                width: '100%',
                padding: 'var(--space-2) 0',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Forgot password?
            </button>
          </form>

          <div className="login-footer">
            Contact your administrator if you need an account.
          </div>


        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="modal-overlay" onClick={() => setShowForgot(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2>Forgot Password</h2>
              <button className="btn-ghost" onClick={() => setShowForgot(false)}><IconX size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Enter your registered email address. A password reset request will be sent to the system administrator who will reset your password.
              </p>
              {forgotMsg && (
                <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
                  {forgotMsg}
                </div>
              )}
              <form onSubmit={handleForgotPassword}>
                <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
                  <label htmlFor="forgot-email">Email Address</label>
                  <input 
                    id="forgot-email" 
                    type="email" 
                    placeholder="you@cs.amu.ac.in"
                    value={forgotEmail} 
                    onChange={e => setForgotEmail(e.target.value)} 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? <IconLoader size={16} /> : 'Send Reset Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
