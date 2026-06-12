import { useState, useEffect } from 'react';

const UNLOCK_THRESHOLD = 20;

function InsightsTab({ user }) {
  const [activeSubtab, setActiveSubtab] = useState('insights');
  const [insights, setInsights] = useState(null);
  const [txCount, setTxCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [forecasts, setForecasts] = useState([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [anomalies, setAnomalies] = useState([]);
  const [anomalyLoading, setAnomalyLoading] = useState(false);

  const [category, setCategory] = useState('Food');
  const [timePeriod, setTimePeriod] = useState('last month');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const CATEGORIES = ['Food', 'Groceries', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Subscriptions', 'Utilities'];
  const TIME_PERIODS = ['this month', 'last month', 'this year', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  useEffect(() => { fetchInsights(); }, []);

  async function fetchInsights() {
    setLoading(true);
    try {
      const token = localStorage.getItem('cipher_token');
      const res = await fetch('http://localhost:8000/insights', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setTxCount(data.transaction_count || 0);
      if (data.unlocked) setInsights(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function fetchForecasts() {
    setForecastLoading(true);
    try {
      const token = localStorage.getItem('cipher_token');
      const res = await fetch('http://localhost:8000/forecast', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setForecasts(data.forecasts || []);
    } catch (err) { console.error(err); }
    finally { setForecastLoading(false); }
  }

  async function fetchAnomalies() {
    setAnomalyLoading(true);
    try {
      const token = localStorage.getItem('cipher_token');
      const res = await fetch('http://localhost:8000/anomalies', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setAnomalies(data.anomalies || []);
    } catch (err) { console.error(err); }
    finally { setAnomalyLoading(false); }
  }

  async function handleSearch() {
    setSearchLoading(true);
    setSearchResult(null);
    try {
      const token = localStorage.getItem('cipher_token');
      const res = await fetch(`http://localhost:8000/search?category=${encodeURIComponent(category)}&period=${encodeURIComponent(timePeriod)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSearchResult(await res.json());
    } catch (err) { console.error(err); }
    finally { setSearchLoading(false); }
  }

  const subtabs = [
    { id: 'insights', label: 'Archetype' },
    { id: 'ask', label: 'Ask Cipher' },
    { id: 'forecast', label: 'Forecast' },
    { id: 'anomalies', label: 'Anomalies' },
  ];

  return (
    <div className="content-inner">
      <div className="page-header">
        <h1 className="page-title">Insights</h1>
        <p className="page-subtitle">Your spending psychology, decoded.</p>
      </div>

      {/* subtab bar */}
      <div className="subtab-bar">
        {subtabs.map(t => (
          <button
            key={t.id}
            className={`subtab-btn${activeSubtab === t.id ? ' active' : ''}`}
            onClick={() => {
              setActiveSubtab(t.id);
              if (t.id === 'forecast' && forecasts.length === 0) fetchForecasts();
              if (t.id === 'anomalies' && anomalies.length === 0) fetchAnomalies();
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── archetype tab ── */}
      {activeSubtab === 'insights' && loading && (
        <p style={{ color: '#999', fontSize: '13px' }}>Loading...</p>
      )}

      {activeSubtab === 'insights' && !loading && (!insights || txCount < UNLOCK_THRESHOLD) && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <p style={{ fontSize: '18px', fontWeight: '500', color: '#1A1A1A', marginBottom: '8px' }}>Archetype locked</p>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '28px', maxWidth: '360px', margin: '0 auto 28px' }}>
            Add {UNLOCK_THRESHOLD - txCount} more transactions to unlock your spending archetype and behavioural insights.
          </p>
          <div style={{ background: '#F5F5F5', borderRadius: '100px', height: '8px', maxWidth: '300px', margin: '0 auto 8px', overflow: 'hidden' }}>
            <div style={{ background: '#D4537E', height: '100%', width: `${Math.min(txCount / UNLOCK_THRESHOLD, 1) * 100}%`, borderRadius: '100px', transition: 'width 0.3s' }} />
          </div>
          <p style={{ fontSize: '12px', color: '#999' }}>{txCount} / {UNLOCK_THRESHOLD} transactions</p>
        </div>
      )}

      {activeSubtab === 'insights' && !loading && insights && txCount >= UNLOCK_THRESHOLD && (
        <div>
          <div className="archetype-card">
            <p className="archetype-tag">YOUR SPENDING ARCHETYPE</p>
            <p className="archetype-name">{insights.archetype}</p>
            <p className="archetype-desc">{insights.portrait}</p>
          </div>

          <div className="two-col">
            {/* metrics */}
            <div className="card">
              <p className="card-title">Key metrics</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {insights.metrics?.map((m, i) => (
                  <div key={i} style={{ background: '#F8F8F8', borderRadius: '10px', padding: '14px' }}>
                    <p style={{ fontSize: '11px', color: '#999', margin: '0 0 6px' }}>{m.label}</p>
                    <p style={{ fontSize: '22px', fontWeight: '600', color: m.color, margin: 0 }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* insights */}
            <div className="card">
              <p className="card-title">Behavioural insights</p>
              {insights.insights?.map((insight, i) => (
                <div key={i} className="insight-row">
                  <div className="insight-dot" style={{ background: insight.color }} />
                  <p className="insight-text">
                    <span style={{ fontWeight: '500', color: '#1A1A1A' }}>{insight.label}</span>
                    {' — '}{insight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ask cipher tab ── */}
      {activeSubtab === 'ask' && (
        <div style={{ maxWidth: '560px' }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            Query your spending history by category and time period.
          </p>
          <div className="card">
            <p className="card-title">How much did I spend on...</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <select className="input" value={category} onChange={e => { setCategory(e.target.value); setSearchResult(null); }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="input" value={timePeriod} onChange={e => { setTimePeriod(e.target.value); setSearchResult(null); }}>
                {TIME_PERIODS.map(t => <option key={t}>{t}</option>)}
              </select>
              <button
                onClick={searchResult ? () => setSearchResult(null) : handleSearch}
                disabled={searchLoading}
                style={{ padding: '11px 20px', borderRadius: '10px', border: 'none', background: searchResult ? '#E0E0E0' : '#D4537E', color: searchResult ? '#666' : 'white', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >
                {searchLoading ? '...' : searchResult ? 'Clear' : 'Search'}
              </button>
            </div>

            {searchResult && (
              <div>
                <div style={{ background: '#FBEAF0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#D4537E', fontWeight: '500', margin: '0 0 4px' }}>Cipher</p>
                  <p style={{ fontSize: '14px', color: '#1A1A1A', margin: 0, lineHeight: '1.5' }}>{searchResult.answer}</p>
                </div>
                {searchResult.transactions?.length > 0 && (
                  <div>
                    <p style={{ fontSize: '11px', color: '#999', margin: '0 0 8px', letterSpacing: '0.05em' }}>MATCHING TRANSACTIONS</p>
                    {searchResult.transactions.map((tx, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < searchResult.transactions.length - 1 ? '0.5px solid #F0F0F0' : 'none' }}>
                        <div>
                          <p style={{ fontSize: '13px', color: '#1A1A1A', margin: 0 }}>{tx.description}</p>
                          <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{tx.predicted_category} · {tx.date}</p>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#D4537E' }}>-${tx.amount?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!searchResult && !searchLoading && (
              <p style={{ fontSize: '13px', color: '#bbb', textAlign: 'center', padding: '16px 0' }}>Select a category and time period above.</p>
            )}
          </div>
        </div>
      )}

      {/* ── forecast tab ── */}
      {activeSubtab === 'forecast' && (
        <div>
          {forecastLoading && <p style={{ color: '#999', fontSize: '13px' }}>Loading...</p>}
          {!forecastLoading && forecasts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">Not enough data yet</div>
              <div className="empty-state-desc">Add transactions from at least 2 months to see spending forecasts.</div>
            </div>
          )}
          {!forecastLoading && forecasts.length > 0 && (
            <div className="two-col">
              {forecasts.map((f, i) => (
                <div key={i} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A1A', margin: 0 }}>{f.category}</p>
                    <p style={{ fontSize: '14px', color: '#D4537E', fontWeight: '500', margin: 0 }}>${f.predicted} predicted</p>
                  </div>
                  <div className="forecast-bar-bg">
                    <div className="forecast-bar-fill" style={{ width: `${Math.min((f.current_spend / (f.predicted || 1)) * 100, 100)}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#999' }}>${f.current_spend} spent so far</span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {f.current_spend > 0 ? `on track for $${f.projected}` : 'no spend yet'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── anomalies tab ── */}
      {activeSubtab === 'anomalies' && (
        <div style={{ maxWidth: '700px' }}>
          {anomalyLoading && <p style={{ color: '#999', fontSize: '13px' }}>Scanning transactions...</p>}
          {!anomalyLoading && anomalies.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-title">No anomalies detected</div>
              <div className="empty-state-desc">Your spending looks normal. We'll flag unusual charges or duplicates here.</div>
            </div>
          )}
          {!anomalyLoading && anomalies.length > 0 && (
            <div>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                {anomalies.length} flag{anomalies.length > 1 ? 's' : ''} found — review these transactions.
              </p>
              <div className="card" style={{ padding: '0' }}>
                {anomalies.map((a, i) => (
                  <div key={i} style={{ padding: '16px 24px', borderBottom: i < anomalies.length - 1 ? '0.5px solid #F0F0F0' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span className={`anomaly-badge ${a.severity}`}>
                            {a.severity === 'high' ? '⚠ High' : '! Medium'}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>{a.description}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 4px', lineHeight: '1.5' }}>{a.reason}</p>
                        <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{a.category} · {a.date}</p>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#D4537E', marginLeft: '16px', flexShrink: 0 }}>
                        -${a.amount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InsightsTab;