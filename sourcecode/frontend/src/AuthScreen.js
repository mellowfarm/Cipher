import { useState } from 'react';
import './App.css';

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) { setError(data.detail || 'Something went wrong'); return; }
      localStorage.setItem('cipher_token', data.token);
      localStorage.setItem('cipher_user_id', data.user_id);
      localStorage.setItem('cipher_email', data.email);
      onLogin(data);
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">

        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ width: '44px', height: '44px', background: 'white', borderRadius: '12px', border: '0.5px solid #E8D5DC', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(212,83,126,0.1)', flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <rect x="2" y="30" width="7" height="14" rx="2" fill="#C8E6C9"/>
              <rect x="11" y="22" width="7" height="22" rx="2" fill="#81C784"/>
              <rect x="20" y="14" width="7" height="30" rx="2" fill="#2E7D32"/>
              <rect x="29" y="18" width="7" height="26" rx="2" fill="#81C784"/>
              <rect x="38" y="26" width="7" height="18" rx="2" fill="#C8E6C9"/>
              <circle cx="24" cy="8" r="7" fill="#D4537E"/>
              <circle cx="21.5" cy="7" r="1.3" fill="white"/>
              <circle cx="26.5" cy="7" r="1.3" fill="white"/>
              <path d="M21.5 10.5 Q24 12.5 26.5 10.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#1A1A1A' }}>Cipher</div>
            <div style={{ fontSize: '10px', color: '#999', letterSpacing: '0.08em' }}>BEHAVIOURAL FINANCE</div>
          </div>
        </div>

        <p className="label">
          {mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1A1A1A', lineHeight: '1.2', marginBottom: '8px' }}>
          {mode === 'login' ? 'Log in to Cipher' : 'Create your account'}
        </h1>
        <p style={{ fontSize: '14px', color: '#999', lineHeight: '1.6', marginBottom: '28px' }}>
          {mode === 'login'
            ? 'Track your spending and discover what it reveals about you.'
            : 'Understand your spending psychology, grounded in behavioural science.'}
        </p>

        <div className="form-group">
          <input
            className="input"
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKey}
          />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="btn-pink" onClick={handleSubmit} disabled={loading} style={{ marginBottom: '14px' }}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Log in →' : 'Create account →'}
        </button>

        <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', marginBottom: '28px' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
            style={{ color: '#D4537E', cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </span>
        </p>

        <div className="divider" />

        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[
            { value: '6', label: 'archetypes', color: '#D4537E' },
            { value: '15+', label: 'behavioural signals', color: '#2E7D32' },
            { value: 'SG', label: 'built for Singapore', color: '#1A1A1A' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '600', color: s.color, marginBottom: '2px' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#999' }}>{s.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default AuthScreen;