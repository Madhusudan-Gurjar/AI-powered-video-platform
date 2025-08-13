


 // new changes madhu


 import { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Dashboard.css";

const AdminDashboard = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!videoFile) return alert("Please select a video to upload");
    if (!videoTitle.trim()) return alert("Please enter a video title");

    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("upload_preset", "my_unsigned_preset"); // Replace with your preset

    setUploading(true);

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dnm9w3upk/video/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message || "Upload failed");

      setUploadUrl(data.secure_url);
      alert("Upload successful!");

      // Save to backend
      const saveResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.secure_url,
          title: videoTitle,
        }),
      });

      if (!saveResponse.ok) throw new Error("Failed to save video metadata");

      alert("Video URL and title saved to database");
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-card glass-box">
        <h2>Welcome, Admin 👋</h2>
        <p className="dashboard-subtitle">Manage your content efficiently</p>
        <div className="dashboard-actions">
          <label className="dashboard-btn btn-blue file-input-label">
            <input type="file" accept="video/*" onChange={handleFileChange} hidden />
            <i className="bi bi-upload"></i> Choose Video
          </label>

          <input
            type="text"
            placeholder="Enter video title"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            className="form-control my-2"
          />

          <button
            className="dashboard-btn btn-green"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </button>

          <Link to="/admin/my-uploads" className="dashboard-btn btn-yellow">
            <i className="bi bi-collection-play"></i> My Uploads
          </Link>

          <Link to="/" className="dashboard-btn btn-red">
            <i className="bi bi-box-arrow-right"></i> Logout
          </Link>
        </div>

        {uploadUrl && (
          <div className="upload-preview">
            <p>Uploaded Video:</p>
            <video src={uploadUrl} controls width="100%" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
