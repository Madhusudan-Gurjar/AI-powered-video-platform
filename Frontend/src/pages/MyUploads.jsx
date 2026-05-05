import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/MyUploads.css";

const MyUploads = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/videos`);
        setVideos(res.data);
      } catch (err) {
        console.error("Failed to fetch videos", err);
      }
    };

    fetchVideos();
  }, []);

  const handleDelete = async (videoId) => {
    console.log("Attempting to delete video ID:", videoId);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/videos/${videoId}`);
      setVideos((prev) => prev.filter((video) => video._id !== videoId));
    } catch (err) {
      console.error("Failed to delete video", err);
    }
  };

  return (
    <div className="my-uploads-page">
      <h2 className="uploads-title">📹 My Uploaded Videos</h2>
      <div className="videos-grid">
        {videos.length === 0 ? (
          <p>No videos uploaded yet.</p>
        ) : (
          videos.map((video) => (
            <div key={video._id} className="video-card">
              <video src={video.url} controls width="100%" />
              <p className="video-title">{video.title || "Untitled Video"}</p>
              <button
                className="delete-button"
                onClick={() => handleDelete(video._id)}
              >
                🗑️ Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyUploads;
