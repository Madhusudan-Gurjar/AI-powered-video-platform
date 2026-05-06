import { useEffect, useState } from "react";
import axios from "axios";
import SharedVideoCard from "../components/VideoCard";
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
      <h2 className="uploads-title">My Uploaded Videos</h2>
      <div className="video-grid">
        {videos.length === 0 ? (
          <p className="uploads-empty">No videos uploaded yet.</p>
        ) : (
          videos.map((video) => (
            <SharedVideoCard
              key={video._id}
              video={video}
              showUploader={false}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MyUploads;
