# AI‑powered Video Platform

This is a MERN stack application designed to provide a multilingual video experience powered by **AssemblyAI**. The platform allows admins to manage video uploads and users to view videos with transcriptions and translations in multiple languages.

Currently, the project includes signup and login pages for both users and admins, though authentication logic is not yet implemented.

## Current Functionality
### Admin
- Signup / Login (UI only, no authentication implemented yet)
- Upload videos
- View all uploaded videos in **My Uploads**
- Delete uploaded videos

### User
- Signup / Login (UI only, no authentication implemented yet)
- View available videos
- Get transcription for any video
- Get translation of the transcription in selected language (currently supports **English**, **Hindi**, and **Kannada**)
- Like and dislike videos
- Comment on videos
- **Note:** Users cannot delete videos

## Transcription & Translation
- Audio is extracted from uploaded videos
- Transcription is generated using **AssemblyAI**
- Translation is provided based on the selected language from the supported list

## Tech Stack
- **Frontend:** React, CSS
- **Backend:** Node.js, Express, MongoDB
- **Storage:** Cloudinary for videos
- **Transcription & Translation:** AssemblyAI
- **Audio Processing:** FFmpeg## Installation & Setup
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


