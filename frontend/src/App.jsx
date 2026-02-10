import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Music, CheckCircle, Loader2 } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, success
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    
    const formData = new FormData();
    formData.append('file', file);

    setStatus('uploading');
    setDownloadUrl(null); 

    try {
      // 1. Trigger the upload and background processing
      await axios.post('http://127.0.0.1:8000/upload', formData);
      
      // 2. Start polling the status endpoint every 5 seconds
      const pollInterval = setInterval(async () => {
        try {
          const res = await axios.get(`http://127.0.0.1:8000/status/${file.name}`);
          
          if (res.data.status === 'completed') {
      // Use the actual URL returned by your backend status endpoint
      setDownloadUrl(res.data.download_url); 
      setStatus('success');
      clearInterval(pollInterval);
    }
  } catch (err) {
    console.error("Polling error", err);
  }
      }, 5000);

    } catch (error) {
      console.error("Upload failed", error);
      setStatus('idle');
      alert("Upload failed. Is the Backend running?");
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>🎤 KaraokePro</h1>
      
      <div style={{ border: '2px dashed #444', padding: '20px', textAlign: 'center', borderRadius: '12px', backgroundColor: '#2a2a2a' }}>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          style={{ marginBottom: '20px' }}
        />
        
        <button 
          onClick={handleUpload}
          disabled={status !== 'idle'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%',
            padding: '10px', backgroundColor: status === 'idle' ? '#007bff' : '#444', 
            color: 'white', border: 'none', borderRadius: '8px', cursor: status === 'idle' ? 'pointer' : 'not-allowed'
          }}
        >
          {status === 'idle' && <><Upload size={20} /> &nbsp; Upload Song</>}
          {status === 'uploading' && <><Loader2 className="animate-spin" /> &nbsp; Processing AI Stems...</>}
          {status === 'success' && <><CheckCircle size={20} /> &nbsp; Done!</>}
        </button>
      </div>

      {status === 'uploading' && (
        <p style={{ textAlign: 'center', color: '#aaa', marginTop: '10px' }}>
          This usually takes 1-2 minutes depending on song length.
        </p>
      )}

      {status === 'success' && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#064e3b', borderRadius: '8px', border: '1px solid #059669' }}>
          <p><strong>Success!</strong> Your instrumental is ready for download.</p>
        </div>
      )}

      {downloadUrl && (
  <div style={{ marginTop: '20px' }}>
    <a 
      href={downloadUrl} 
      // This tells the browser: "Don't play this, save it as instrumental.mp3"
      download="instrumental.mp3" 
      style={{
        display: 'block', 
        padding: '15px', 
        backgroundColor: '#059669', 
        color: 'white', 
        textAlign: 'center', 
        textDecoration: 'none', 
        borderRadius: '8px', 
        fontWeight: 'bold'
      }}
    >
      ⬇️ Click to Download Instrumental
    </a>
  </div>
)}
    </div>
  );
}

export default App;