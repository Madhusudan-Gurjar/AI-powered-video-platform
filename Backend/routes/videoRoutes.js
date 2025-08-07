
// changes rishabh
import express from 'express';
import Video from '../models/Video.js';
import { transcribeAudioFromVideo } from '../utils/transcriber.js';

import { translate } from '@vitalets/google-translate-api';


const router = express.Router();

// Get all videos
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadedAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error("Failed to fetch videos:", err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// Get single video by ID + transcribe it if not done yet
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    if (!video.transcription) {
      console.log(" Transcribing video with ID:", video._id);

      const transcription = await transcribeAudioFromVideo(video.url);
      video.transcription = transcription;
      await video.save();

      console.log(" Transcription saved");
    }

    res.json(video);
  } catch (err) {
    console.error("Failed to fetch or transcribe video:", err);
    res.status(500).json({ error: "Failed to fetch or transcribe video" });
  }
});

// Upload video only (no transcription)
router.post("/", async (req, res) => {
  const { url, title } = req.body;

  if (!url) {
    console.log(" No URL received");
    return res.status(400).json({ error: "Video URL is required" });
  }

  try {
    console.log(" Saving new video to DB...");
    const newVideo = new Video({ url, title });
    await newVideo.save();

    console.log(" Video saved");
    res.status(201).json(newVideo);
  } catch (err) {
    console.error(" Error saving video:", err);
    res.status(500).json({ error: "Failed to save video" });
  }
});


router.post("/:id/translate", async (req, res) => {
  const { targetLanguage } = req.body;

  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    if (!video.transcription)
      return res.status(400).json({ error: "No transcription found to translate" });

    const result = await translate(video.transcription, { to: targetLanguage.toLowerCase() });

    res.json({ translatedText: result.text });
  } catch (err) {
    console.error("Translation error:", err);
    res.status(500).json({ error: "Failed to translate transcription" });
  }
});



// Like a video
router.post("/:id/like", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    video.likes = (video.likes || 0) + 1;
    await video.save();

    res.json(video);
  } catch (err) {
    console.error("Failed to like video:", err);
    res.status(500).json({ error: "Failed to like video" });
  }
});

// Dislike a video
router.post("/:id/dislike", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    video.dislikes = (video.dislikes || 0) + 1;
    await video.save();

    res.json(video);
  } catch (err) {
    console.error("Failed to dislike video:", err);
    res.status(500).json({ error: "Failed to dislike video" });
  }
});

// Add comment
router.post("/:id/comment", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Comment text is required" });

    video.comments = video.comments || [];
    video.comments.push({ text });

    await video.save();

    res.json(video);
  } catch (err) {
    console.error("Failed to add comment:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Delete a video by ID
//  Add this to your videoRoutes.js if missing:
router.delete("/:id", async (req, res) => {
  console.log(" DELETE request for video ID:", req.params.id); // <--- Debug log

  try {
    const deletedVideo = await Video.findByIdAndDelete(req.params.id);
    if (!deletedVideo) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    console.error(" Failed to delete video:", err);
    res.status(500).json({ error: "Server error deleting video" });
  }
});


export default router;
