import { useState } from 'react';

function ProfileTab({ user, onLogout }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ padding: '24px 16px 16px', borderBottom: '0.5px solid #E0E0E0', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FBEAF0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
          <span style={{ fontSize: '20px', fontWeight: '500', color: '#D4537E' }}>
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <p style={{ fontSize: '15px', fontWeight: '500', color: '#1A1A1A', margin: '0 0 2px' }}>{user?.email}</p>
        <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Member since May 2026</p>
      </div>

      <div style={{ padding: '12px 16px' }}>
        <p style={{ fontSize: '11px', color: '#999', letterSpacing: '0.05em', margin: '0 0 8px' }}>ACCOUNT</p>

        <button
          onClick={() => setShowNotifModal(true)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '0.5px solid #E0E0E0', width: '100%', background: 'none', border: 'none', borderBottom: '0.5px solid #E0E0E0', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🔔</span>
            <span style={{ fontSize: '13px', color: '#1A1A1A' }}>Notifications</span>
          </div>
          <span style={{ color: '#999', fontSize: '16px' }}>›</span>
        </button>

        <button
          onClick={() => setShowPasswordModal(true)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', width: '100%', background: 'none', border: 'none', borderBottom: '0.5px solid #E0E0E0', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🔒</span>
            <span style={{ fontSize: '13px', color: '#1A1A1A' }}>Change password</span>
          </div>
          <span style={{ color: '#999', fontSize: '16px' }}>›</span>
        </button>

        <p style={{ fontSize: '11px', color: '#999', letterSpacing: '0.05em', margin: '16px 0 8px' }}>ABOUT</p>

        <button
          onClick={() => setShowPrivacyModal(true)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', width: '100%', background: 'none', border: 'none', borderBottom: '0.5px solid #E0E0E0', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>📋</span>
            <span style={{ fontSize: '13px', color: '#1A1A1A' }}>Privacy policy</span>
          </div>
          <span style={{ color: '#999', fontSize: '16px' }}>›</span>
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '0.5px solid #E0E0E0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>ℹ️</span>
            <span style={{ fontSize: '13px', color: '#1A1A1A' }}>Version 1.0.0</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}
        >
          <span style={{ fontSize: '18px' }}>🚪</span>
          <span style={{ fontSize: '13px', color: '#D4537E' }}>Log out</span>
        </button>
      </div>

      {/* notifications modal */}
      {showNotifModal && (
        <SimpleModal title="Notifications" onClose={() => setShowNotifModal(false)}>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: '0 0 16px' }}>
            Choose what Cipher notifies you about.
          </p>
          {[
            { label: 'Weekly spending summary', defaultOn: true },
            { label: 'Unusual transaction detected', defaultOn: true },
            { label: 'Monthly forecast ready', defaultOn: false },
            { label: 'Archetype update', defaultOn: false },
          ].map((item) => (
            <NotifToggle key={item.label} label={item.label} defaultOn={item.defaultOn} />
          ))}
          <p style={{ fontSize: '11px', color: '#bbb', marginTop: '16px', textAlign: 'center' }}>
            Push notifications coming in a future update.
          </p>
        </SimpleModal>
      )}

      {/* change password modal */}
      {showPasswordModal && (
        <ChangePasswordModal user={user} onClose={() => setShowPasswordModal(false)} />
      )}

      {/* privacy policy modal */}
      {showPrivacyModal && (
        <SimpleModal title="Privacy Policy" onClose={() => setShowPrivacyModal(false)}>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.7' }}>
            <strong style={{ color: '#1A1A1A' }}>Your data stays yours.</strong>
          </p>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.7', marginTop: '10px' }}>
            Cipher stores your transaction data securely in a private database. We never sell, share, or use your financial data to train models or for advertising.
          </p>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.7', marginTop: '10px' }}>
            PDF statements are parsed locally on our server and the raw file is never stored — only the extracted transactions are saved.
          </p>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.7', marginTop: '10px' }}>
            You can delete your account and all associated data at any time by contacting us.
          </p>
          <p style={{ fontSize: '11px', color: '#bbb', marginTop: '16px' }}>Last updated June 2026.</p>
        </SimpleModal>
      )}
    </div>
  );
}

// ── reusable bottom sheet modal ──
function SimpleModal({ title, onClose, children }) {
  return (
    <div
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#FDFAF6', borderRadius: '20px 20px 0 0', padding: '24px', width: '100%', maxHeight: '80%', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1A1A1A', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── notification toggle row ──
function NotifToggle({ label, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid #E0E0E0' }}>
      <span style={{ fontSize: '13px', color: '#1A1A1A' }}>{label}</span>
      <div
        onClick={() => setOn(!on)}
        style={{
          width: '40px', height: '22px', borderRadius: '11px',
          background: on ? '#D4537E' : '#E0E0E0',
          position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: '3px',
          left: on ? '21px' : '3px',
          width: '16px', height: '16px', borderRadius: '50%',
          background: 'white', transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  );
}

// ── change password modal ──
function ChangePasswordModal({ user, onClose }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!current || !next || !confirm) { setError('Please fill in all fields.'); return; }
    if (next.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (next !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      // re-authenticate with current password to verify
      const loginRes = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: current })
      });
      if (!loginRes.ok) { setError('Current password is incorrect.'); setLoading(false); return; }

      const token = localStorage.getItem('cipher_token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ new_password: next })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(onClose, 1500);
      } else {
        setError('Something went wrong. Try again.');
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#FDFAF6', borderRadius: '20px 20px 0 0', padding: '24px', width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1A1A1A', margin: 0 }}>Change password</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>×</button>
        </div>

        {success ? (
          <p style={{ textAlign: 'center', color: '#2E7D32', fontSize: '14px', padding: '16px 0' }}>✓ Password changed!</p>
        ) : (
          <>
            <div className="form-group">
              <input className="input" type="password" placeholder="Current password" value={current} onChange={e => setCurrent(e.target.value)} />
              <input className="input" type="password" placeholder="New password (min 8 chars)" value={next} onChange={e => setNext(e.target.value)} />
              <input className="input" type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            {error && <p style={{ fontSize: '13px', color: '#D4537E', margin: '0 0 12px' }}>{error}</p>}
            <button className="btn-pink" style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Update password'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileTab;