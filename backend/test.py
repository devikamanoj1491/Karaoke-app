import subprocess
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
INPUT_DIR = BASE_DIR / "input"
OUTPUT_DIR = BASE_DIR / "output"

def process_audio(filename: str):
    input_path = INPUT_DIR / filename
    command = [
        "demucs",
        "-n", "mdx_extra_q",
        str(input_path),
        "--out", str(OUTPUT_DIR)
    ]
    
    try:
        print(f"--- Starting separation for: {filename} ---")
        # Step 1: Run Demucs
        subprocess.run(command, check=True)
        
        # Step 2: Define paths for the glue step
        song_name = Path(filename).stem
        song_folder = OUTPUT_DIR / "mdx_extra_q" / song_name
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
            "-b:a", "320k", 
            str(output_mp3)
        ], check=True)
        
        print(f"--- Success! Instrumental created at: {output_mp3} ---")
        return output_mp3
    
    except subprocess.CalledProcessError as e:
        print(f"Error during processing: {e}")
        return None