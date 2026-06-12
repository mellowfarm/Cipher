import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const CATEGORY_COLORS = {
  Food: '#FF6B6B', Groceries: '#FF9F43', Transport: '#FFD93D',
  Shopping: '#6BCB77', Entertainment: '#4D96FF', Health: '#9B5DE5',
  Subscriptions: '#F15BB5', Utilities: '#00BBF9', Others: '#999999',
};

function CalendarTab({ user, currentMonth, onMonthChange }) {
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [importStatus, setImportStatus] = useState(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  useEffect(() => { fetchTransactions(); }, [currentMonth]);

  async function fetchTransactions() {
    try {
      const token = localStorage.getItem('cipher_token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/transactions?month=${month + 1}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) { console.error(err); }
  }

  const txByDate = {};
  transactions.forEach(tx => {
    if (!txByDate[tx.date]) txByDate[tx.date] = [];
    txByDate[tx.date].push(tx);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const todayStr = new Date().toISOString().split('T')[0];
  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const selectedTxs = selectedDate ? (txByDate[selectedDate] || []) : [];
  const monthName = currentMonth.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });

  // pie chart data
  const categoryTotals = {};
  transactions.forEach(tx => {
    const cat = tx.predicted_category || tx.category || 'Others';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount;
  });
  const pieData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setImportStatus('loading');
    try {
      const token = localStorage.getItem('cipher_token');
      if (file.name.endsWith('.pdf')) {
        const formData = new FormData();
        formData.append('file', file);
        const parseRes = await fetch(`${process.env.REACT_APP_API_URL}/parse-pdf`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const parseData = await parseRes.json();
        if (parseData.error) {
          setImportStatus(parseData.error.includes('already') ? 'duplicate' : 'error');
          setTimeout(() => setImportStatus(null), 3000);
          return;
        }
        await fetch(`${process.env.REACT_APP_API_URL}/transactions/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ transactions: parseData.transactions })
        });
        setImportStatus('success');
        await fetchTransactions();
        setTimeout(() => setImportStatus(null), 3000);
      }
    } catch {
      setImportStatus('error');
      setTimeout(() => setImportStatus(null), 3000);
    }
  }

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
          <p className="page-subtitle">${totalSpent.toFixed(2)} spent this month</p>
        </div>

        {/* import button */}
        <div>
          <button
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: importStatus === 'loading' ? 0.5 : 1 }}
            onClick={() => document.getElementById('pdf-upload-cal').click()}
            disabled={importStatus === 'loading'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {importStatus === 'loading' ? 'Importing...' :
             importStatus === 'success' ? '✓ Imported!' :
             importStatus === 'duplicate' ? 'Already imported' :
             'Import PDF'}
          </button>
          <input id="pdf-upload-cal" type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleImport} />
        </div>
      </div>

      {/* two column: calendar + sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* calendar */}
        <div className="card">
          <div className="cal-grid" style={{ marginBottom: '8px' }}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} className="cal-day-header">{d}</div>
            ))}
          </div>
          <div className="cal-grid">
            {Array(startOffset).fill(null).map((_, i) => <div key={`e-${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayTxs = txByDate[dateStr] || [];
              const dayTotal = dayTxs.reduce((s, tx) => s + tx.amount, 0);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={day}
                  className={`cal-day${isToday ? ' today' : isSelected ? ' selected' : ''}`}
                  onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                >
                  <span style={{ fontSize: '15px', color: isToday ? 'white' : '#1A1A1A' }}>{day}</span>
                  {dayTotal > 0 && (
                    <span style={{ fontSize: '12px', color: isToday ? 'white' : '#D4537E', fontWeight: '500', marginTop: '2px' }}>
                      ${dayTotal.toFixed(0)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* right panel */}
        <div>
          {/* spending breakdown — below calendar, horizontal layout */}
          {pieData.length > 0 && (
            <div className="card" style={{ display: 'flex', gap: '32px', alignItems: 'center', padding: '28px 24px' }}>
              <p className="card-title" style={{ margin: 0, flexShrink: 0 }}>Spending breakdown</p>
              <div style={{ width: '120px', height: '120px', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={36} outerRadius={58} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#999'} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', flex: 1 }}>
                {pieData.slice(0, 6).map((cat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CATEGORY_COLORS[cat.name] || '#999', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: '#666' }}>{cat.name}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A1A' }}>${cat.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* selected day */}
          {selectedDate && (
            <div className="card">
              <p className="card-title">{formatDate(selectedDate)}</p>
              {selectedTxs.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#999', padding: '8px 0' }}>No transactions this day.</p>
              ) : (
                selectedTxs.map((tx, i) => (
                  <div key={i} className="tx-row" style={{ cursor: 'default' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="tx-icon" style={{ background: (CATEGORY_COLORS[tx.predicted_category] || '#999') + '20' }}>
                        {getCatIcon(tx.predicted_category)}
                      </div>
                      <div>
                        <p className="tx-desc">{tx.description}</p>
                        <p className="tx-cat">{tx.predicted_category || tx.category}</p>
                      </div>
                    </div>
                    <span className="tx-amount">-${tx.amount.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getCatIcon(cat) {
  const icons = { Food: '🍜', Groceries: '🛒', Transport: '🚌', Shopping: '🛍️', Entertainment: '🎮', Health: '💊', Subscriptions: '📱', Utilities: '💡', Others: '📦' };
  return icons[cat] || '📦';
}

export default CalendarTab;