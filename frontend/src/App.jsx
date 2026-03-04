import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, Music, Library, Settings, 
  Play, Download, CheckCircle, Loader2, 
  Search, LogOut, Disc, ListMusic
} from 'lucide-react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null); // For global playback

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/history');
      setHistory(res.data);
    } catch (err) { console.error("Could not fetch history", err); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    const formData = new FormData();
    formData.append('file', file);
    setStatus('uploading');

    try {
      await axios.post('http://127.0.0.1:8000/upload', formData);
      const pollInterval = setInterval(async () => {
        try {
          const res = await axios.get(`http://127.0.0.1:8000/status/${encodeURIComponent(file.name)}`);
          if(res.data.progress) setProgress(res.data.progress);
          if (res.data.status === 'completed') {
            setProgress(100);
            setStatus('success');
            clearInterval(pollInterval);
            fetchHistory();
          }
        } catch (err) { console.error("Polling error", err); }
      }, 1000); // Polling every 1s for smoother updates
    } catch (error) {
      setStatus('idle');
      alert("Upload failed. Is the Backend running?");
    }
  };

  return (
    <div className="dashboard-layout">
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Disc className="logo-icon" size={28} />
          <span>KaraokePro</span>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item active"><Library size={20} /> Library</button>
          <button className="nav-item"><Upload size={20} /> New Process</button>
          <button className="nav-item"><ListMusic size={20} /> Playlists</button>
          <button className="nav-item"><Settings size={20} /> Settings</button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout"><LogOut size={20} /> Sign Out</button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="main-content">
        <header className="content-header">
          <div className="search-wrapper">
            <Search size={18} />
            <input type="text" placeholder="Search instrumentals..." />
          </div>
          <div className="user-badge">
            <span>Premium User</span>
            <div className="avatar">JD</div>
          </div>
        </header>

        <div className="content-scroll">
          {/* UPLOAD HERO SECTION */}
          <section className="hero-section">
            <div className="hero-text">
              <h2>Create Instrumental</h2>
              <p>Upload any song and our AI will separate the vocals for you.</p>
            </div>
            
            <div className="upload-container">
              <div className="upload-input-group">
                <input 
                  type="file" 
                  id="file-input"
                  onChange={(e) => setFile(e.target.files[0])} 
                  hidden
                />
                <label htmlFor="file-input" className="file-label">
                  {file ? file.name : "Select Audio File"}
                </label>
                <button 
                  onClick={handleUpload}
                  disabled={status !== 'idle' || !file}
                  className={`upload-submit ${status !== 'idle' ? 'loading' : ''}`}
                >
                  {status === 'idle' ? <><Upload size={18} /> Process</> : <><Loader2 className="spinner" size={18} /> {progress}%</>}
                </button>
              </div>
              
              {status === 'uploading' && (
                <div className="global-progress-bar">
                  <div className="fill" style={{ width: `${progress}%` }}></div>
                </div>
              )}
            </div>
          </section>

          {/* LIBRARY GRID */}
          <section className="library-section">
            <div className="section-header">
              <h3>Recently Processed</h3>
              <button className="view-all">View All</button>
            </div>

            <div className="track-grid">
              {history.map((song) => (
                <div key={song.id} className={`track-card ${currentTrack?.id === song.id ? 'playing' : ''}`}>
                  <div className="track-icon-box">
                    <Music size={24} />
                  </div>
                  <div className="track-info">
                    <h4>{song.filename}</h4>
                    <span className={`status-tag ${song.status}`}>{song.status}</span>
                  </div>
                  <div className="track-actions">
                    {song.status === 'completed' && (
                      <>
                        <button className="play-circle" onClick={() => setCurrentTrack(song)}>
                          <Play size={20} fill="currentColor" />
                        </button>
                        <a href={song.download_url} download className="download-circle">
                          <Download size={18} />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* 3. GLOBAL PLAYER (PERSISTENT) */}
      {currentTrack && (
        <footer className="player-bar">
          <div className="player-info">
            <Disc className="spinning-logo" />
            <div>
              <p className="player-title">{currentTrack.filename}</p>
              <p className="player-subtitle">Instrumental Version</p>
            </div>
          </div>
          <div className="player-controls">
            <audio 
              src={currentTrack.download_url} 
              controls 
              autoPlay 
              className="custom-audio"
            />
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;