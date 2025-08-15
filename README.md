
# AI‑powered Video Platform

This is a MERN stack application where users can upload videos and watch them in different languages. The platform uses **AssemblyAI** for transcription and translation.

## Features
### User
- Login / Signup
- Search videos
- Watch videos
- Like, dislike, comment
- Download videos

### Admin
- Login / Signup
- Upload videos
- View account details

### Transcription & Translation
- Audio extracted from uploaded video
- Transcription using **AssemblyAI**
- Translation of transcript to selected language

## Tech Stack
- **Frontend:** React, CSS
- **Backend:** Node.js, Express, MongoDB
- **Storage:** Cloudinary for videos
- **Transcription & Translation:** AssemblyAI
- **Audio Processing:** FFmpeg

## Installation & Setup

### Clone the repository
```bash
git clone https://github.com/Madhusudan-Gurjar/AI-powered-video-platform.git
cd AI-powered-video-platform
```

### Install backend dependencies

```bash
cd Backend
npm install
```
### Install frontend dependencies
```bash
cd ../Frontend
npm install
```


## Running the Project


### Start backend
```bash
cd Backend
npm start
```
### Start frontend
```bash
cd ../Frontend
npm start
```


## Transcription Workflow

1. Admin uploads a video.
2. Backend extracts audio using FFmpeg.
3. `transcribe.py` sends audio to AssemblyAI.
4. Transcript and translation are stored and served to the frontend.


