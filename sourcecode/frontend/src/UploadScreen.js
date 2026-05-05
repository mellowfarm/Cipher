import { useNavigate } from 'react-router-dom';

function UploadScreen() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <div className="card">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <h2 style={{ color: '#1A1A1A', marginTop: '1rem' }}>Upload your transactions</h2>
        <p style={{ color: '#666', marginTop: '8px' }}>Coming soon</p>
      </div>
    </div>
  );
}

export default UploadScreen;