import React, { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [progress, setProgress] = useState(0);

  
  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setDownloadUrl(null);
    setProgress(0);
  }

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    const formData = new FormData();
    formData.append('file', file);
    setStatus('uploading');
    setDownloadUrl(null);

    try {
      await axios.post('http://127.0.0.1:8000/upload', formData);
      const pollInterval = setInterval(async () => {
        try {
          const res = await axios.get(`http://127.0.0.1:8000/status/${file.name}`);
          if(res.data.progress) setProgress(res.data.progress);
          if (res.data.status === 'completed') {
            setProgress(100);
            setDownloadUrl(res.data.download_url); 
            setStatus('success');
            clearInterval(pollInterval);
          }
        } catch (err) { console.error("Polling error", err); }
      }, 5000);
    } catch (error) {
      console.error("Upload failed", error);
      setStatus('idle');
      alert("Upload failed. Is the Backend running?");
    }
  };

  return (
    <div className="layout-wrapper">
      <div className="karaoke-card">
        <h1>🎤 KaraokePro</h1>
        
        {/* Replace your current button logic with this */}
      <div className="upload-box">
        {status === 'success' ? (
          <button onClick={handleReset} className="main-button reset-button">
            Upload Another Song
          </button>
        ) : (
          <>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])} 
              className="file-input"
              disabled={status !== 'idle'} 
            />
            <button 
              onClick={handleUpload}
              disabled={status !== 'idle' || !file}
              className={`main-button ${status !== 'idle' ? 'is-loading' : ''}`}
            >
              {status === 'idle' && <><Upload size={20} /> Upload Song</>}
              {status === 'uploading' && <><Loader2 className="spinner" /> Processing...</>}
            </button>
          </>
        )}
      </div>

        {status === 'uploading' && (
          <div className="progress-area">
            <div className="bar-container">
              <div className="bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <p>AI is separating stems: {progress}%</p>
          </div>
        )}

        {status === 'success' && (
          <div className="success-banner">
            <p>Instrumental Ready!</p>
          </div>
        )}

        {downloadUrl && (
          <a href={downloadUrl} download="instrumental.mp3" className="download-cta">
            ⬇️ Download MP3
          </a>
        )}
      </div>
    </div>
  );
}

export default App;