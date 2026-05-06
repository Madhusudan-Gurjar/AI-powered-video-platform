
// changes rishabh
import express from 'express';
import Video from '../models/Video.js';
import { transcribeAudioFromVideo } from '../utils/transcriber.js';
import { protect } from '../middleware/auth.js';
import { translate } from '@vitalets/google-translate-api';


const router = express.Router();

// Get user's liked videos
router.get("/user/liked", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("🔍 Fetching liked videos for user:", userId);
    
    const videos = await Video.find({ likedBy: userId }).sort({ uploadedAt: -1 });
    console.log(`✅ Found ${videos.length} liked videos for user ${userId}`);
    
    res.json(videos);
  } catch (err) {
    console.error("Failed to fetch liked videos:", err);
    res.status(500).json({ error: "Failed to fetch liked videos" });
  }
});

// Get user's uploaded videos (for teachers)
router.get("/user/uploaded", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("🎬 Fetching uploaded videos for user:", userId);
    
    const videos = await Video.find({ uploadedBy: userId }).sort({ uploadedAt: -1 });
    console.log(`✅ Found ${videos.length} uploaded videos for user ${userId}`);
    
    res.json(videos);
  } catch (err) {
    console.error("Failed to fetch uploaded videos:", err);
    res.status(500).json({ error: "Failed to fetch uploaded videos" });
  }
});

// Get user's stats
router.get("/user/stats", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const likedVideos = await Video.find({ likedBy: userId });
    const allVideos = await Video.find();
    
    // Count comments by this user
    let commentsCount = 0;
    allVideos.forEach(video => {
      if (video.comments) {
        commentsCount += video.comments.filter(c => c.userId?.toString() === userId).length;
      }
    });

    res.json({
      likedVideosCount: likedVideos.length,
      commentsCount: commentsCount,
      videosAvailable: allVideos.length,
    });
  } catch (err) {
    console.error("Failed to fetch user stats:", err);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

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
router.post("/", protect, async (req, res) => {
  const { url, title, thumbnailUrl } = req.body;

  if (!url) {
    console.log(" No URL received");
    return res.status(400).json({ error: "Video URL is required" });
  }

  try {
    console.log(" Saving new video to DB...");
    const newVideo = new Video({ 
      url, 
      title,
      thumbnailUrl,
      uploadedBy: req.user.id,
      uploader: req.user.name
    });
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



// Like a video (toggle)
router.post("/:id/like", protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    const userId = req.user.id;
    const userIdStr = userId.toString();
    
    // Check if already liked
    const alreadyLiked = video.likedBy.some(id => id.toString() === userIdStr);
    
    if (alreadyLiked) {
      // Remove the like (unlike)
      video.likedBy = video.likedBy.filter(id => id.toString() !== userIdStr);
      console.log(`👍 User ${userId} unliking video ${video._id}. Total likes: ${video.likedBy.length}`);
    } else {
      // Add the like
      // Remove from disliked if present
      video.dislikedBy = video.dislikedBy.filter(id => id.toString() !== userIdStr);
      // Add to liked
      video.likedBy.push(userId);
      console.log(`👍 User ${userId} liking video ${video._id}. Total likes: ${video.likedBy.length}`);
    }
    
    await video.save();
    res.json(video);
  } catch (err) {
    console.error("Failed to like video:", err);
    res.status(500).json({ error: "Failed to like video" });
  }
});

// Dislike a video (toggle)
router.post("/:id/dislike", protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    const userId = req.user.id;
    const userIdStr = userId.toString();
    
    // Check if already disliked
    const alreadyDisliked = video.dislikedBy.some(id => id.toString() === userIdStr);
    
    if (alreadyDisliked) {
      // Remove the dislike (undislike)
      video.dislikedBy = video.dislikedBy.filter(id => id.toString() !== userIdStr);
      console.log(`👎 User ${userId} removing dislike from video ${video._id}. Total dislikes: ${video.dislikedBy.length}`);
    } else {
      // Add the dislike
      // Remove from liked if present
      video.likedBy = video.likedBy.filter(id => id.toString() !== userIdStr);
      // Add to disliked
      video.dislikedBy.push(userId);
      console.log(`👎 User ${userId} disliking video ${video._id}. Total dislikes: ${video.dislikedBy.length}`);
    }
    
    await video.save();
    res.json(video);
  } catch (err) {
    console.error("Failed to dislike video:", err);
    res.status(500).json({ error: "Failed to dislike video" });
  }
});

// Add comment
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Comment text is required" });

    video.comments = video.comments || [];
    video.comments.push({ 
      text,
      userId: req.user.id,
      userName: req.user.name
    });

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
