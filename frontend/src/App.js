import './App.css';

function App() {
  return (
    <div className="app">
      <div className="card">

        {/* Logo */}
        <div className="logo-container">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
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

        {/* Label */}
        <p className="label">CIPHER · BEHAVIOURAL FINANCE</p>

        {/* Headline */}
        <h1 className="headline">
          Decode your<br/>spending<br/>psychology.
        </h1>

        {/* Tagline */}
        <p className="tagline">
          Upload your transactions and discover what your spending reveals about you — grounded in real science, not a quiz.
        </p>

        {/* Buttons */}
        <div className="buttons">
          <button className="btn-pink">Upload bank CSV</button>
          <button className="btn-green">Add transactions manually</button>
        </div>

        <p className="demo-link">or <span>try a demo →</span></p>

        {/* Stats */}
        <div className="divider" />
        <div className="stats">
          <div className="stat">
            <p className="stat-number pink">6</p>
            <p className="stat-label">archetypes</p>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <p className="stat-number green">15+</p>
            <p className="stat-label">behavioural signals</p>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <p className="stat-number dark">SG</p>
            <p className="stat-label">built for Singapore</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;