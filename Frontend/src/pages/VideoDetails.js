import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const languageCodeMap = {
  English: "en",
  Hindi: "hi",
  Kannada: "kn",
};

const VideoDetails = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comment, setComment] = useState("");
  const [language, setLanguage] = useState("English");

  const [activeTab, setActiveTab] = useState("transcription");
  const [transcription, setTranscription] = useState("");
  const [translation, setTranslation] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/videos/${id}`);
        setVideo(res.data);
        setTranscription(res.data.transcription || "");
      } catch (err) {
        console.error("Failed to load video", err);
      }
    };
    fetchVideo();
  }, [id, API_URL]);

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
    try {
      const res = await axios.post(`${API_URL}/api/videos/${id}/like`);
      setVideo(res.data);
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleDislike = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/videos/${id}/dislike`);
      setVideo(res.data);
    } catch (err) {
      console.error("Dislike failed", err);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/api/videos/${id}/comment`, {
        text: comment,
      });
      setVideo(res.data);
      setComment("");
    } catch (err) {
      console.error("Comment failed", err);
    }
  };

  if (!video) return <p className="text-white text-center">Loading...</p>;

  return (
    <div className="app-container">
      <div className="video-details-card container mt-4">
        <h2>{video.title}</h2>
        <video src={video.url} controls className="w-100" />

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

        <div className="mt-3">
          <button className="btn btn-success me-2" onClick={handleLike}>
            👍 {video.likes || 0}
          </button>
          <button className="btn btn-danger me-2" onClick={handleDislike}>
            👎 {video.dislikes || 0}
          </button>
        </div>

        <div className="mt-4">
          <h5>Comments</h5>
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
          <ul className="list-group mt-3">
            {(video.comments || []).map((c, i) => (
              <li key={i} className="list-group-item">
                {c.text}
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
