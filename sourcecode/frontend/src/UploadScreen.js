import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import './App.css';

function UploadScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  // state for manual entry
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  // state for CSV upload
  const [file, setFile] = useState(null);

  function addTransaction() {
    if (!description || !amount) return;
    const newTransaction = {
      description,
      amount: parseFloat(amount),
      category,
    };
    setTransactions([...transactions, newTransaction]);
    setDescription('');
    setAmount('');
  }

  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  return (
    <div className="app">
      <div className="card">

        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

        {mode === 'csv' ? (
          // CSV MODE
          <div>
            <h2 className="screen-title">Upload your CSV</h2>
            <p className="screen-subtitle">
              Export your transactions from your bank app and upload the file here.
            </p>

            <label className="upload-zone">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V8m0 0-3 3m3-3 3 3" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="3" width="18" height="18" rx="4" stroke="#C8E6C9" strokeWidth="1"/>
              </svg>
              {file ? (
                <p className="upload-filename">{file.name}</p>
              ) : (
                <>
                  <p className="upload-title">Drop your CSV here</p>
                  <p className="upload-hint">or click to browse</p>
                </>
              )}
            </label>

            <button
              className="btn-pink"
              disabled={!file}
              style={{ opacity: file ? 1 : 0.4, width: '100%' }}
              onClick={() => navigate('/results')}
            >
              Analyse my spending →
            </button>
          </div>

        ) : (

          // MANUAL MODE
          <div>
            <h2 className="screen-title">Add transactions</h2>
            <p className="screen-subtitle">
              Add at least 10 transactions for accurate results.
            </p>

            <div className="form-group">
              <input
                className="input"
                placeholder="Description (e.g. McDonald's)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="form-row">
                <input
                  className="input"
                  placeholder="Amount (SGD)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <select
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Shopping</option>
                  <option>Entertainment</option>
                  <option>Health</option>
                  <option>Subscriptions</option>
                  <option>Others</option>
                </select>
              </div>
              <button className="btn-green" onClick={addTransaction}>
                + Add transaction
              </button>
            </div>

            <div className="tx-counter">
              {transactions.length === 0
                ? '0 transactions added — need at least 10'
                : `${transactions.length} transaction${transactions.length > 1 ? 's' : ''} added ${transactions.length < 10 ? `— need ${10 - transactions.length} more` : '✓ ready!'}`
              }
            </div>

            {transactions.length > 0 && (
              <div className="tx-list">
                {transactions.map((tx, index) => (
                  <div key={index} className="tx-item">
                    <div>
                      <p className="tx-desc">{tx.description}</p>
                      <p className="tx-cat">{tx.category}</p>
                    </div>
                    <p className="tx-amount">${tx.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn-pink"
              disabled={transactions.length < 10}
              style={{ opacity: transactions.length >= 10 ? 1 : 0.4, width: '100%', marginTop: '16px' }}
              onClick={() => navigate('/results')}
            >
              Analyse my spending →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default UploadScreen;