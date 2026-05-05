import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

/* ── progress helpers (shared with UserDashboard) ── */
const PROGRESS_KEY = "vidlearn_progress";
const LIKED_KEY    = "vidlearn_liked";

const saveProgress = (videoId, percent) => {
  const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  all[videoId] = { percent: Math.round(percent), watchedAt: new Date().toISOString() };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
};

const toggleLiked = (videoId) => {
  const liked = JSON.parse(localStorage.getItem(LIKED_KEY) || "[]");
  const idx = liked.indexOf(videoId);
  if (idx === -1) liked.push(videoId);
  else liked.splice(idx, 1);
  localStorage.setItem(LIKED_KEY, JSON.stringify(liked));
  return idx === -1; // true = now liked
};

const languageCodeMap = {
  English: "en",
  Hindi: "hi",
  Kannada: "kn",
};

const VideoDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const isTeacher = user?.role === "Teacher" || localStorage.getItem("vidlearn_user_role") === "Teacher";
  const [video, setVideo] = useState(null);
  const [comment, setComment] = useState("");
  const [language, setLanguage] = useState("English");

  const [activeTab, setActiveTab] = useState("transcription");
  const [transcription, setTranscription] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const videoRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;

  /* restore liked state */
  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem(LIKED_KEY) || "[]");
    setIsLiked(liked.includes(id));
  }, [id]);

  /* track playback progress */
  const handleTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    const pct = (el.currentTime / el.duration) * 100;
    saveProgress(id, pct);
  }, [id]);

  /* mark as 100% when ended */
  const handleEnded = useCallback(() => {
    saveProgress(id, 100);
  }, [id]);

  /* restore playback position */
  const handleLoadedMetadata = useCallback(() => {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}")[id];
    if (saved && saved.percent > 0 && saved.percent < 98 && videoRef.current) {
      videoRef.current.currentTime =
        (saved.percent / 100) * videoRef.current.duration;
    }
  }, [id]);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/videos/${id}`);
        setVideo(res.data);
        setTranscription(res.data.transcription || "");
        
        // Check if user already liked or disliked this video
        if (token && user) {
          const userLiked = res.data.likedBy?.some(likedId => 
            likedId === user.id || likedId?.toString() === user.id?.toString()
          ) || false;
          const userDisliked = res.data.dislikedBy?.some(dislikedId => 
            dislikedId === user.id || dislikedId?.toString() === user.id?.toString()
          ) || false;
          console.log("👍 Video liked by user:", userLiked, "User ID:", user.id, "LikedBy:", res.data.likedBy);
          console.log("👎 Video disliked by user:", userDisliked, "DislikedBy:", res.data.dislikedBy);
          setIsLiked(userLiked);
          setIsDisliked(userDisliked);
        }
      } catch (err) {
        console.error("Failed to load video", err);
      }
    };
    fetchVideo();
  }, [id, API_URL, token, user]);

  const handleTabSwitch = async (tab) => {
    setActiveTab(tab);

    if (tab === "translation") {
      setTranslation("");
      try {
        const langCode = languageCodeMap[language] || "en";
        const res = await axios.post(`${API_URL}/api/videos/${id}/translate`, {
          targetLanguage: langCode,
        });
        setTranslation(res.data.translatedText || "Translation not available");
      } catch (err) {
        console.error("Failed to translate transcription:", err);
        setTranslation("Failed to fetch translation.");
      }
    }
  };

  const handleLike = async () => {
    if (isTeacher) return;
    if (!token) {
      alert("Please login to like this video");
      return;
    }
    try {
      const res = await axios.post(
        `${API_URL}/api/videos/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVideo(res.data);
      setIsLiked(!isLiked);
      if (isDisliked) setIsDisliked(false);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to like video";
      alert(errorMsg);
    }
  };

  const handleDislike = async () => {
    if (isTeacher) return;
    if (!token) {
      alert("Please login to dislike this video");
      return;
    }
    try {
      const res = await axios.post(
        `${API_URL}/api/videos/${id}/dislike`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVideo(res.data);
      setIsDisliked(!isDisliked);
      if (isLiked) setIsLiked(false);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to dislike video";
      alert(errorMsg);
    }
  };

  const handleComment = async () => {
    if (isTeacher) return;
    if (!comment.trim()) return;
    if (!token) {
      alert("Please login to comment");
      return;
    }
    try {
      const res = await axios.post(
        `${API_URL}/api/videos/${id}/comment`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVideo(res.data);
      setComment("");
    } catch (err) {
      console.error("Comment failed", err);
      alert("Failed to post comment");
    }
  };

  if (!video) return <p className="text-white text-center">Loading...</p>;

  const handleGoBack = () => {
    if (location.state?.from === 'liked') {
      navigate('/dashboard', { state: { activeNav: 'Liked Videos' } });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="app-container">
      <div className="video-details-card container mt-4">
        <button 
          className="btn btn-secondary mb-3" 
          onClick={handleGoBack}
          style={{ marginBottom: '15px' }}
        >
          ← Back
        </button>
        <h2>{video.title}</h2>
        <video
          ref={videoRef}
          src={video.url}
          controls
          className="w-100"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleLoadedMetadata}
        />

        <div className="mt-3">
          <label htmlFor="language-select" className="form-label">
            Select Language:
          </label>
          <select
            id="language-select"
            className="form-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="Kannada">Kannada</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
          </select>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button
            className={`btn ${activeTab === "transcription" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleTabSwitch("transcription")}
          >
            Transcription
          </button>
          <button
            className={`btn ${activeTab === "translation" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleTabSwitch("translation")}
          >
            Translation
          </button>
        </div>

        <div className="mt-3">
          <label htmlFor="text-area" className="form-label">
            {activeTab === "transcription" ? "Transcription" : "Translation"} 
          </label>
          <textarea
            id="text-area"
            className="form-control"
            rows={6}
            value={activeTab === "transcription" ? transcription : translation}
            onChange={(e) =>
              activeTab === "transcription"
                ? setTranscription(e.target.value)
                : setTranslation(e.target.value)
            }
            placeholder={`Enter ${activeTab} in ${language}`}
          />
        </div>

        {!isTeacher && (
          <div className="mt-3 d-flex gap-2 align-items-center">
            <button
              className={`btn ${isLiked ? "btn-warning" : "btn-outline-success"} me-2`}
              onClick={handleLike}
              title={isLiked ? "Unlike this video" : "Like this video"}
            >
              👍 {video?.likedBy?.length || 0} {isLiked ? "(Liked)" : ""}
            </button>
            <button 
              className={`btn ${isDisliked ? "btn-danger" : "btn-outline-danger"} me-2`}
              onClick={handleDislike}
              title={isDisliked ? "Remove dislike" : "Dislike this video"}
            >
              👎 {video?.dislikedBy?.length || 0} {isDisliked ? "(Disliked)" : ""}
            </button>
          </div>
        )}

        <div className="mt-4">
          <h5>Comments</h5>
          {!isTeacher ? (
            <>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleComment}>
                Post Comment
              </button>
            </>
          ) : (
            <p className="text-muted mb-2">Teachers can view comments but cannot add reactions or post new comments.</p>
          )}
          <ul className="list-group mt-3">
            {(video.comments || []).map((c, i) => (
              <li key={i} className="list-group-item">
                <strong>{c.userName || "Anonymous"}</strong>: {c.text}
                <small className="text-muted d-block">
                  {new Date(c.createdAt).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;
