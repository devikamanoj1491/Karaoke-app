import subprocess
import os
from pathlib import Path
import re
from sqlalchemy.orm import Session
from database import SessionLocal
import models

BASE_DIR = Path(__file__).parent
INPUT_DIR = BASE_DIR / "input"
OUTPUT_DIR = BASE_DIR / "output"

def process_audio(filename: str):
    input_path = INPUT_DIR / filename
    db = SessionLocal()
    song = db.query(models.Song).filter(models.Song.filename == filename).first()
    output_dir = Path("output")
    command = [
        "demucs",
        "-n", "htdemucs",
        "--shifts", "0",    # Disables re-processing the song 4+ times
        "--overlap", "0.1", # Reduces redundant calculations
        "-j", "4",          # Uses 4 CPU cores (increase if you have more)
        str(input_path),
        "--out", str(OUTPUT_DIR)
    ]
    
    try:
        print(f"--- Starting separation for: {filename} ---")
        process = subprocess.Popen(
            command,
            stdout = subprocess.PIPE,
            stderr = subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        for line in iter(process.stdout.readline, ""):
            print(line, end="")
            match = re.search(r"(\d+)%", line)
            if match:
                percent = int(match.group(1))
                song.progress = int(percent*0.9)
                db.commit()
        process.wait()
        # Step 1: Run Demucs
        subprocess.run(command, check=True)
        # Step 2: Define paths for the glue step
        song_name = Path(filename).stem
        song_folder = OUTPUT_DIR / "htdemucs" / song_name
        output_mp3 = song_folder / "instrumental.mp3"

        print(f"--- Creating instrumental (gluing) for: {song_name} ---")

        # Step 3: Run FFmpeg to mix drums, bass, and other
        # Using .wav inputs from Demucs to create the .mp3 output
        subprocess.run([
            "ffmpeg", "-y", 
            "-i", str(song_folder / "drums.wav"), 
            "-i", str(song_folder / "bass.wav"), 
            "-i", str(song_folder / "other.wav"), 
            "-filter_complex", "amix=inputs=3:duration=first", 
            "-b:a", "192k", 
            str(output_mp3)
        ], check=True)
        song.progress = 100
        song.status = "completed"
        db.commit()
        print(f"--- Success! Instrumental created at: {output_mp3} ---")
        return output_mp3
    
    except subprocess.CalledProcessError as e:
        print(f"Error during processing: {e}")
        song.status = "failed"
        db.commit()
        return None
    finally:
        db.close()