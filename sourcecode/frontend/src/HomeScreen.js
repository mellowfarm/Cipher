import { useState } from 'react';
import CalendarTab from './CalendarTab';
import TransactionsTab from './TransactionsTab';
import InsightsTab from './InsightsTab';
import ProfileTab from './ProfileTab';
import './App.css';

const NAV_ITEMS = [
  {
    id: 'calendar',
    label: 'Calendar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

function HomeScreen({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('calendar');
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  function triggerRefresh() {
    setRefreshKey(k => k + 1);
    setShowAddModal(false);
  }

  return (
    <div className="app">
      <div className="shell">

        {/* ── sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
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
              <div className="sidebar-logo-text">Cipher</div>
              <div className="sidebar-logo-sub">BEHAVIOURAL FINANCE</div>
            </div>
          </div>

          <p className="nav-section-label">MENU</p>

          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item${activeTab === item.id ? ' active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          <p className="nav-section-label" style={{ marginTop: '16px' }}>ACTIONS</p>
          <button
            className="nav-item"
            onClick={() => setShowAddModal(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Add transaction
          </button>

          <div className="sidebar-bottom">
            <div className="sidebar-user">
              <div className="sidebar-avatar">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="sidebar-email">{user?.email}</div>
                <button className="sidebar-logout" onClick={onLogout}>Log out</button>
              </div>
            </div>
          </div>
        </aside>

        {/* ── main content ── */}
        <main className="content">
          {activeTab === 'calendar' && (
            <CalendarTab key={refreshKey} user={user} currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
          )}
          {activeTab === 'transactions' && (
            <TransactionsTab key={refreshKey} user={user} onRefresh={triggerRefresh} currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
          )}
          {activeTab === 'insights' && <InsightsTab user={user} />}
          {activeTab === 'profile' && <ProfileTab user={user} onLogout={onLogout} />}
        </main>
      </div>

      {showAddModal && (
        <AddModal onClose={() => setShowAddModal(false)} onAdded={triggerRefresh} user={user} />
      )}
    </div>
  );
}

function AddModal({ onClose, onAdded }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!description || !amount) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('cipher_token');
      await fetch('http://localhost:8000/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ description, amount: parseFloat(amount), category, date })
      });
      onAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add transaction</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="form-group">
          <input className="input" placeholder="Description (e.g. Grab Food)" value={description} onChange={e => setDescription(e.target.value)} />
          <div className="form-row">
            <input className="input" placeholder="Amount (SGD)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
            <option>Food</option><option>Transport</option><option>Shopping</option>
            <option>Groceries</option><option>Entertainment</option><option>Health</option>
            <option>Subscriptions</option><option>Utilities</option><option>Others</option>
          </select>
        </div>
        <button className="btn-pink" onClick={handleAdd} disabled={loading}>
          {loading ? 'Adding...' : 'Add transaction'}
        </button>
      </div>
    </div>
  );
}

export default HomeScreen;