import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Dashboard.css";

const UserDashboard = () => {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

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

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-heading">Welcome to User Dashboard</h2>
      <div className="dashboard-buttons mb-4">
        <Link to="/" className="btn btn-danger">Logout</Link>
      </div>
      <div className="videos-grid">
        {videos.length === 0 ? (
          <p>No videos available.</p>
        ) : (
          videos.map((video) => (
            <div
              key={video._id}
              className="video-glass-container"
              onClick={() => navigate(`/videos/${video._id}`)}
            >
              <video src={video.url} controls />
              <p className="video-title">{video.title}</p>
              <p className="video-date">{new Date(video.uploadedAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
