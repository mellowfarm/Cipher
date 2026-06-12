import { useState, useEffect } from 'react';

const CATEGORY_COLORS = {
  Food: '#FF6B6B', Groceries: '#FF9F43', Transport: '#FFD93D',
  Shopping: '#6BCB77', Entertainment: '#4D96FF', Health: '#9B5DE5',
  Subscriptions: '#F15BB5', Utilities: '#00BBF9', Others: '#999999',
};

const CATEGORY_ICONS = {
  Food: '🍜', Groceries: '🛒', Transport: '🚌', Shopping: '🛍️',
  Entertainment: '🎮', Health: '💊', Subscriptions: '📱', Utilities: '💡', Others: '📦',
};

function TransactionsTab({ user, onRefresh, currentMonth, onMonthChange }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTx, setExpandedTx] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [filterCat, setFilterCat] = useState('All');

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  useEffect(() => { fetchTransactions(); }, [currentMonth]);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const token = localStorage.getItem('cipher_token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions?month=${month + 1}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleDelete(txId) {
    try {
      const token = localStorage.getItem('cipher_token');
      await fetch(`${process.env.REACT_APP_API_URL}/transactions/${txId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setExpandedTx(null);
      fetchTransactions();
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
  }

  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const monthName = currentMonth.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });

  const filtered = filterCat === 'All'
    ? transactions
    : transactions.filter(tx => (tx.predicted_category || tx.category) === filterCat);

  const grouped = {};
  filtered.forEach(tx => {
    if (!grouped[tx.date]) grouped[tx.date] = [];
    grouped[tx.date].push(tx);
  });
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // category summary for top bar
  const catTotals = {};
  transactions.forEach(tx => {
    const cat = tx.predicted_category || tx.category || 'Others';
    catTotals[cat] = (catTotals[cat] || 0) + tx.amount;
  });
  const topCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="content-inner">
      {/* header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <button onClick={() => onMonthChange(new Date(year, month - 1, 1))} style={{ background: 'none', border: 'none', color: '#D4537E', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>‹</button>
            <h1 className="page-title" style={{ margin: 0 }}>{monthName}</h1>
            <button onClick={() => onMonthChange(new Date(year, month + 1, 1))} style={{ background: 'none', border: 'none', color: '#D4537E', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>›</button>
          </div>
          <p className="page-subtitle">${totalSpent.toFixed(2)} total · {transactions.length} transactions</p>
        </div>
      </div>

      {/* stat strip */}
      {topCats.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {topCats.map(([cat, amount]) => (
            <div key={cat} className="card" style={{ flex: 1, padding: '14px 16px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CATEGORY_COLORS[cat] || '#999', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A' }}>${amount.toFixed(0)}</div>
                <div style={{ fontSize: '11px', color: '#999' }}>{cat}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* filter bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['All', 'Food', 'Groceries', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Subscriptions', 'Utilities', 'Others'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            style={{
              padding: '5px 12px', borderRadius: '20px', border: '0.5px solid',
              borderColor: filterCat === cat ? '#D4537E' : '#E0E0E0',
              background: filterCat === cat ? '#FBEAF0' : 'white',
              color: filterCat === cat ? '#D4537E' : '#666',
              fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.1s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* transaction list */}
      <div className="card" style={{ padding: '0' }}>
        {loading && (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px', fontSize: '13px' }}>Loading...</p>
        )}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">No transactions</div>
            <div className="empty-state-desc">
              {filterCat !== 'All' ? `No ${filterCat} transactions this month.` : 'Add one or import your bank statement.'}
            </div>
          </div>
        )}

        {!loading && sortedDates.map((date, di) => (
          <div key={date}>
            <div style={{ padding: '10px 24px', background: '#FAFAFA', borderBottom: '0.5px solid #F0F0F0', borderTop: di > 0 ? '0.5px solid #F0F0F0' : 'none' }}>
              <span style={{ fontSize: '11px', color: '#999', letterSpacing: '0.05em', fontWeight: '500' }}>
                {new Date(date).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
              </span>
            </div>
            <div style={{ padding: '0 24px' }}>
              {grouped[date].map((tx, i) => {
                const cat = tx.predicted_category || tx.category || 'Others';
                const isExpanded = expandedTx === tx.id;
                return (
                  <div key={tx.id || i}>
                    <div
                      className="tx-row"
                      onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="tx-icon" style={{ background: (CATEGORY_COLORS[cat] || '#999') + '20' }}>
                          {CATEGORY_ICONS[cat] || '📦'}
                        </div>
                        <div>
                          <p className="tx-desc">{tx.description}</p>
                          <p className="tx-cat">{cat}{tx.time ? ` · ${tx.time}` : ''}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="tx-amount">-${tx.amount.toFixed(2)}</span>
                        <span style={{ color: '#ccc', fontSize: '12px' }}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ display: 'flex', gap: '8px', padding: '8px 0 12px' }}>
                        <button
                          onClick={() => setEditingTx(tx)}
                          style={{ padding: '7px 16px', background: '#F5F5F5', border: 'none', borderRadius: '8px', fontSize: '13px', color: '#1A1A1A', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          style={{ padding: '7px 16px', background: '#FBEAF0', border: 'none', borderRadius: '8px', fontSize: '13px', color: '#D4537E', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {editingTx && (
        <EditModal
          tx={editingTx}
          onClose={() => setEditingTx(null)}
          onSaved={() => { setEditingTx(null); setExpandedTx(null); fetchTransactions(); if (onRefresh) onRefresh(); }}
        />
      )}
    </div>
  );
}

function EditModal({ tx, onClose, onSaved }) {
  const [description, setDescription] = useState(tx.description);
  const [amount, setAmount] = useState(tx.amount);
  const [category, setCategory] = useState(tx.category || tx.predicted_category || 'Food');
  const [date, setDate] = useState(tx.date);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const token = localStorage.getItem('cipher_token');
      await fetch(`${process.env.REACT_APP_API_URL}/transactions/${tx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ description, amount: parseFloat(amount), category, date })
      });
      onSaved();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Edit transaction</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="form-group">
          <input className="input" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <div className="form-row">
            <input className="input" placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
            <option>Food</option><option>Transport</option><option>Shopping</option>
            <option>Groceries</option><option>Entertainment</option><option>Health</option>
            <option>Subscriptions</option><option>Utilities</option><option>Others</option>
          </select>
        </div>
        <button className="btn-pink" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

export default TransactionsTab;