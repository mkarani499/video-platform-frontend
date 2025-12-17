import React, { useState, useEffect } from 'react';
import './App.css';
import PaymentForm from './components/PaymentForm';

// API URL configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://video-platform2-api.onrender.com';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [videos, setVideos] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Test backend connection on startup
  useEffect(() => {
    fetch(`${API_URL}/api/test`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBackendStatus('Connected ✅');
        } else {
          setBackendStatus('Disconnected ❌');
        }
      })
      .catch(err => {
        console.error('Backend connection failed:', err);
        setBackendStatus('Disconnected ❌');
      });
  }, []);

  // Load videos from backend
  useEffect(() => {
    fetch(`${API_URL}/api/videos`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVideos(data);
        }
        setLoadingVideos(false);
      })
      .catch(err => {
        console.error('Failed to load videos:', err);
        setLoadingVideos(false);
      });
  }, []);

  const handleLogin = () => {
    // Temporary mock login
    setUser({
      name: 'Test User',
      email: 'test@example.com',
      id: 'test-user-id'
    });
    alert('Login feature will be implemented next!');
  };

  const handlePayment = (videoId, videoTitle, price) => {
    setSelectedVideo({ id: videoId, title: videoTitle, price });
  };

  const createSampleVideo = () => {
    fetch(`${API_URL}/api/videos/create-sample`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(`✅ Sample video created: ${data.video.title} (KSh ${data.video.price})`);
          // Reload videos
          window.location.reload();
        }
      })
      .catch(err => {
        console.error('Failed to create sample video:', err);
        alert('Failed to create sample video');
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎬 Video Platform</h1>
        <p>Pay with M-Pesa to unlock exclusive videos</p>
        
        <div className="status-card">
          <h3>System Status</h3>
          <p>Frontend: Running ✅ (Vercel)</p>
          <p>Backend: {backendStatus} ({API_URL.replace('https://', '')})</p>
          <p>User: {user ? `Logged in as ${user.name}` : 'Not logged in'}</p>
          <p>Videos: {loadingVideos ? 'Loading...' : `${videos.length} available`}</p>
        </div>

        <div className="auth-section">
          {!user ? (
            <button className="login-btn" onClick={handleLogin}>
              Login / Register
            </button>
          ) : (
            <div className="user-info">
              <span>Welcome, {user.name}!</span>
              <button className="logout-btn" onClick={() => setUser(null)}>
                Logout
              </button>
            </div>
          )}
          
          {/* Admin button to create sample video */}
          <button 
            className="sample-video-btn" 
            onClick={createSampleVideo}
            style={{marginLeft: '15px', background: '#2196F3'}}
          >
            Create Sample Video
          </button>
        </div>

        <div className="video-library">
          <h2>Available Videos</h2>
          
          {loadingVideos ? (
            <p>Loading videos...</p>
          ) : videos.length === 0 ? (
            <div className="no-videos">
              <p>No videos available yet. Click "Create Sample Video" above to add one.</p>
            </div>
          ) : (
            <div className="video-grid">
              {videos.map(video => (
                <div key={video._id} className="video-card">
                  <div className="video-thumbnail">
                    <div className="thumbnail-placeholder">
                      <span>VIDEO PREVIEW</span>
                    </div>
                    <div className="video-price">KSh {video.price}</div>
                  </div>
                  <div className="video-info">
                    <h3>{video.title}</h3>
                    <p>{video.description || 'Exclusive content'}</p>
                    <p className="video-duration">Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</p>
                    <button 
                      className="pay-btn"
                      onClick={() => handlePayment(video._id, video.title, video.price)}
                    >
                      Pay KSh {video.price} with M-Pesa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {selectedVideo && (
          <div className="payment-modal">
            <div className="modal-content">
              <button className="close-btn" onClick={() => setSelectedVideo(null)}>×</button>
              <PaymentForm
                videoId={selectedVideo.id}
                videoTitle={selectedVideo.title}
                price={selectedVideo.price}
                onSuccess={() => {
                  setSelectedVideo(null);
                  alert('🎉 Payment successful! Video unlocked.');
                }}
              />
            </div>
          </div>
        )}

        <div className="next-steps">
          <h3>Project Progress:</h3>
          <ul>
            <li>✅ Backend API Setup</li>
            <li>✅ MongoDB Database</li>
            <li>✅ Frontend Deployment</li>
            <li>✅ Backend Connection</li>
            <li>✅ M-Pesa Integration</li>
            <li>🔲 User Authentication</li>
            <li>🔲 Video Upload System</li>
            <li>🔲 Video Player with Protection</li>
          </ul>
          
          <div className="test-instructions">
            <h4>💰 Test M-Pesa Payment:</h4>
            <ol>
              <li>Click "Create Sample Video" (creates test video)</li>
              <li>Click "Pay with M-Pesa" on any video</li>
              <li>Use test phone: <strong>254708374149</strong></li>
              <li>Amount: <strong>1 KSh</strong> (minimum test amount)</li>
              <li>Simulated payment will succeed automatically</li>
            </ol>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;