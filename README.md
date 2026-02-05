# Karaoke Generator App

This is a small project which aims to auto-generate karaoke tracks of any chosen song using AI-based audio separation.

## What it does
-Takes an audio file as input
-Uses **Demucs** to separate vocals, drums, bass and other stems.
-Uses **FFmpeg** to merge non-vocal stems into a karaoke track.

## Tech Stack
-Python
-Demucs
-FFmpeg
-Powershell(Windows)

## Current Status
-Backend/CLI based processing works
-Karaoke audio generation is functional
-Web interfaces and optimizations planned

## Notes
-Generated audio files and virtual environments are ignored in Git
-FFmpeg must be installed and available in path