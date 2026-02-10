# 🎤 AI Karaoke Maker

An AI-powered web application that separates music tracks into stems (drums, bass, vocals, and others) and automatically "glues" the instrumental parts back together for a perfect karaoke experience.

## 🚀 Features
* **AI Stem Separation:** Uses Meta's Demucs (`mdx_extra_q` model) for high-quality audio splitting.
* **Auto-Mixing:** Integrated FFmpeg logic to combine drums, bass, and "other" tracks into a high-quality 320k MP3 instrumental.
* **Asynchronous Processing:** Backend handles heavy AI tasks in the background so the UI stays responsive.
* **Polling System:** Real-time status updates from the frontend until your file is ready for download.
* **Forced Downloads:** Custom API headers to ensure files download directly to your computer instead of opening in a browser player.

---

## 🛠️ Tech Stack

### Frontend
* **React.js:** UI library for a responsive dashboard.
* **Vite:** Next-generation frontend tooling for fast development.
* **Axios:** For handling API requests and file uploads.
* **Lucide-React:** Beautiful, lightweight icons.
* **Tailwind CSS / CSS Modules:** For modern styling.

### Backend
* **FastAPI:** High-performance Python framework for the API.
* **Demucs (Meta AI):** Deep learning model for music source separation.
* **FFmpeg:** The "Swiss army knife" for audio processing and mixing.
* **SQLAlchemy:** SQL toolkit and Object Relational Mapper for history tracking.
* **Pydantic:** Data validation and settings management.

---

## ⚙️ Installation & Setup

### Prerequisites
* Python 3.9+
* Node.js (v18+)
* FFmpeg installed on your system PATH.

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload