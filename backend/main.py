from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
import shutil
import models
from database import engine, get_db
from test import process_audio

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Mount for internal use
app.mount("/output", StaticFiles(directory="output"), name="output")

# 2. Unified Upload Route
@app.post("/upload")
async def upload_song(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    input_dir = "input"
    os.makedirs(input_dir, exist_ok=True)
    input_path = os.path.join(input_dir, file.filename)
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create DB Record
    new_song = models.Song(filename=file.filename, status="processing")
    db.add(new_song)
    db.commit()
    db.refresh(new_song)
    
    # Start AI processing in background
    background_tasks.add_task(process_audio, file.filename)
    
    return {"status": "started", "filename": file.filename}

# 3. Status Route
@app.get("/status/{filename}")
async def get_status(filename: str, db: Session = Depends(get_db)):
    song_folder = os.path.splitext(filename)[0]
    target_path = os.path.join("output", "mdx_extra_q", song_folder, "instrumental.mp3")
    song = db.query(models.Song).filter(models.Song.filename == filename).first()
    
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    if os.path.exists(target_path):
        return {
            "status": song.status,
            "progress": song.progress, 
            # Pointing to our custom forced-download route
            "download_url": f"http://127.0.0.1:8000/download/mdx_extra_q/{song_folder}/instrumental.mp3"
        }
    return {"status": "processing"}

# 4. FORCED DOWNLOAD ROUTE (The fix for your new window issue)
@app.get("/download/{path:path}")
async def download_file(path: str):
    file_path = os.path.join("output", path)
    if os.path.exists(file_path):
        return FileResponse(
            path=file_path, 
            filename=os.path.basename(file_path), 
            media_type='audio/mpeg'
        )
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/history")
async def get_history(db: Session = Depends(get_db)):
    return db.query(models.Song).all()