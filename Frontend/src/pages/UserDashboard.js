import { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/UserDashboard.css";

/* ─── helpers ─────────────────────────────────────────────── */
const getHour = () => new Date().getHours();
const greeting = () => {
  const h = getHour();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

/* localStorage key helpers */
const PROGRESS_KEY = "vidlearn_progress";   // { videoId: { percent, watchedAt } }
const LIKED_KEY    = "vidlearn_liked";       // [videoId, ...]

const loadProgress = () => JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
const loadLiked    = () => JSON.parse(localStorage.getItem(LIKED_KEY)    || "[]");

/* ─── component ───────────────────────────────────────────── */
const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useContext(AuthContext);
  const userName  = user?.name || localStorage.getItem("vidlearn_user_name") || "User";
  const userEmail = user?.email || localStorage.getItem("vidlearn_user_email") || "";

  const [videos,          setVideos]          = useState([]);
  const [likedVideos,     setLikedVideos]     = useState([]);
  const [teacherVideos,   setTeacherVideos]   = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [likedLoading,    setLikedLoading]    = useState(false);
  const [teacherLoading,  setTeacherLoading]  = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
  const [uploading,       setUploading]       = useState(false);
  const [videoTitle,      setVideoTitle]      = useState("");
  const [videoFile,       setVideoFile]       = useState(null);
  const userRole = user?.role || localStorage.getItem("vidlearn_user_role") || "Student";
  const [progress,    setProgress]    = useState(loadProgress());
  const [liked,       setLiked]       = useState(loadLiked());
  const [activeNav,   setActiveNav]   = useState(() => {
    return location.state?.activeNav || localStorage.getItem("activeNav") || "Dashboard";
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalType,   setModalType]   = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const handleProfileOpen = () => setProfileOpen(true);
  const handleProfileClose = () => setProfileOpen(false);

  /* ── fetch videos ── */
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/videos`);
        setVideos(res.data);
      } catch (err) {
        console.error("Failed to fetch videos", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  /* ── fetch liked videos when activeNav is "Liked Videos" ── */
  useEffect(() => {
    if (activeNav === "Liked Videos") {
      const fetchToken = token || localStorage.getItem("token");
      if (!fetchToken) {
        console.warn("⚠️ No token available for fetching liked videos");
        setLikedLoading(false);
        return;
      }
      
      setLikedLoading(true);
      console.log("🔄 Fetching liked videos with token:", fetchToken.slice(0, 20) + "...");
      
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/videos/user/liked`, {
          headers: { Authorization: `Bearer ${fetchToken}` },
        })
        .then((res) => {
          console.log("✅ Liked videos fetched:", res.data.length);
          setLikedVideos(res.data);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch liked videos:", err.response?.data || err.message);
          setModalType("error");
          setModalMessage("Failed to fetch liked videos: " + (err.response?.data?.error || err.message));
          setModalOpen(true);
        })
        .finally(() => {
          setLikedLoading(false);
        });
    }
  }, [activeNav, token]);

  /* ── fetch teacher's videos when activeNav is "My Videos" ── */
  useEffect(() => {
    if (activeNav === "My Videos" && userRole === "Teacher") {
      const fetchToken = token || localStorage.getItem("token");
      if (!fetchToken) {
        console.warn("⚠️ No token available for fetching teacher videos");
        setTeacherLoading(false);
        return;
      }
      
      setTeacherLoading(true);
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/videos/user/uploaded`, {
          headers: { Authorization: `Bearer ${fetchToken}` },
        })
        .then((res) => {
          console.log("✅ Teacher videos fetched:", res.data.length);
          setTeacherVideos(res.data);
          setTeacherLoading(false);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch teacher videos:", err);
          setTeacherLoading(false);
        });
    }
  }, [activeNav, userRole, token]);

  /* ── handle video upload ── */
  const handleUpload = async () => {
    if (!videoFile) {
      setModalType("error");
      setModalMessage("Please select a video to upload");
      setModalOpen(true);
      return;
    }
    if (!videoTitle.trim()) {
      setModalType("error");
      setModalMessage("Please enter a video title");
      setModalOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("upload_preset", "my_unsigned_preset");

    setUploading(true);
    try {
      const uploadResponse = await fetch("https://api.cloudinary.com/v1_1/dnm9w3upk/video/upload", {
        method: "POST",
        body: formData,
      });

      const data = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(data.error.message || "Upload failed");

      const fetchToken = token || localStorage.getItem("token");
      const saveResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/videos`,
        { url: data.secure_url, title: videoTitle },
        { headers: { Authorization: `Bearer ${fetchToken}` } }
      );

      setModalType("success");
      setModalMessage("Video uploaded successfully!");
      setModalOpen(true);
      setVideoFile(null);
      setVideoTitle("");
      setTeacherVideos([saveResponse.data, ...teacherVideos]);
    } catch (error) {
      console.error("Upload failed:", error);
      setModalType("error");
      setModalMessage(`Upload failed: ${error.message}`);
      setModalOpen(true);
    } finally {
      setUploading(false);
    }
  };

  /* ── handle file selection ── */
  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  /* ── persist activeNav to localStorage ── */
  useEffect(() => {
    localStorage.setItem("activeNav", activeNav);
  }, [activeNav]);

  /* ── derived stats ── */
  const totalWatched    = Object.keys(progress).length;
  const totalLiked      = liked.length;
  const totalTranscripts= videos.filter((v) => v.transcription).length;
  const totalComments   = videos.reduce((acc, v) => acc + (v.comments?.length || 0), 0);

  /* ── teacher-specific stats ── */
  const totalUploaded = teacherVideos.length;
  const totalLikesOnTeacherVideos = teacherVideos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const avgLikes = totalUploaded > 0 ? Math.round(totalLikesOnTeacherVideos / totalUploaded) : 0;
  const totalCommentsOnTeacherVideos = teacherVideos.reduce((sum, v) => sum + (v.comments?.length || 0), 0);
  const avgComments = totalUploaded > 0 ? Math.round(totalCommentsOnTeacherVideos / totalUploaded) : 0;

  /* continue-watching: videos that have a saved progress (percent < 100) */
  const continueWatching = videos
    .filter((v) => progress[v._id] && progress[v._id].percent > 0 && progress[v._id].percent < 98)
    .sort((a, b) => new Date(progress[b._id]?.watchedAt) - new Date(progress[a._id]?.watchedAt))
    .slice(0, 3);

  /* most-liked videos for "Your progress" bar chart */
  const topVideos = [...videos].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 4);

  /* recent comments across all videos */
  const recentComments = videos
    .flatMap((v) =>
      (v.comments || []).map((c) => ({ ...c, videoTitle: v.title, videoId: v._id }))
    )
    .slice(-3)
    .reverse();

  const handleLogout = () => {
    localStorage.removeItem("vidlearn_user_name");
    localStorage.removeItem("vidlearn_user_email");
    localStorage.removeItem("vidlearn_user_role");
    navigate("/");
  };

  /* Role-aware sidebar nav — no Languages / Transcripts / Settings */
  const secondMenuItem = userRole === "Student"
    ? { label: "Liked Videos", icon: "❤️" }
    : { label: "My Videos",    icon: "🎬" };

  const navItems = userRole === "Teacher"
    ? [
        { label: "Dashboard", icon: "🏠" },
        secondMenuItem,
      ]
    : [
        { label: "All Videos", icon: "🎥" },
        { label: "Dashboard", icon: "🏠" },
        secondMenuItem,
      ];


  /* ── render ── */
  return (
    <div className="vl-shell">
      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className="vl-sidebar">
        <div className="vl-logo">
          <span className="vl-logo-icon">▶</span>
          <span className="vl-logo-text">VidLearn</span>
        </div>

        <p className="vl-section-label">MENU</p>
        <nav className="vl-nav">
          {navItems.map(({ label, icon }) => (
            <button
              key={label}
              className={`vl-nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => {
                setProfileOpen(false);
                setActiveNav(label);
              }}
            >
              <span className="vl-nav-icon">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <p className="vl-section-label">ACCOUNT</p>
        <nav className="vl-nav">
          <button
            className={`vl-nav-item ${profileOpen ? "active" : ""}`}
            onClick={handleProfileOpen}
          >
            <span className="vl-nav-icon">👤</span>
            Profile
          </button>
        </nav>

        <div className="vl-sidebar-footer">
          <div className="vl-avatar">{getInitials(userName)}</div>
          <div className="vl-user-info">
            <span className="vl-user-name">{userName}</span>
            <span className="vl-user-role">{userRole}</span>
          </div>
        </div>
      </aside>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="vl-main">

        {/* ── Top bar ── */}
        <header className="vl-topbar">
          <div className="vl-topbar-left">
            <h1 className="vl-greeting">
              {greeting()}, {userName.split(" ")[0]}
            </h1>
           
          </div>
          <div className="vl-topbar-right">
            <span className="vl-role-badge">{userRole}</span>
          </div>
        </header>

        {/* ── Stat cards ── */}
        {activeNav === "Dashboard" && (
        <section className="vl-stats">
          {userRole === "Teacher" ? (
            <>
              <StatCard
                label="Total uploaded"
                value={totalUploaded}
                sub={totalUploaded === 1 ? "video" : "videos"}
                accent="#3b82f6"
              />
              <StatCard
                label="Avg likes"
                value={avgLikes}
                sub={`per video`}
                accent="#4ade80"
              />
              <StatCard
                label="Avg comments"
                value={avgComments}
                sub={`per video`}
                accent="#a78bfa"
              />
              <StatCard
                label="Total engagement"
                value={totalLikesOnTeacherVideos + totalCommentsOnTeacherVideos}
                sub={`likes + comments`}
                accent="#facc15"
              />
            </>
          ) : (
            <>
              <StatCard
                label="Videos watched"
                value={totalWatched}
                sub={`${continueWatching.length} in progress`}
                accent="#4ade80"
              />
              <StatCard
                label="Transcripts read"
                value={totalTranscripts}
                sub={`across ${videos.length} videos`}
                accent="#60a5fa"
              />
              <StatCard
                label="Liked videos"
                value={totalLiked}
                sub="saved to profile"
                accent="#facc15"
              />
              <StatCard
                label="Comments posted"
                value={totalComments}
                sub={`on ${videos.filter((v) => v.comments?.length).length} videos`}
                accent="#a78bfa"
              />
            </>
          )}
        </section>
        )}

        {/* ── All Videos, Dashboard or Liked Videos View ── */}
        {activeNav === "All Videos" ? (
          <div style={{ width: "100%", padding: "20px" }}>
            <input
              type="text"
              placeholder="🔍 Search videos by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "8px",
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#e2e8f0",
                fontSize: "15px",
              }}
            />
            {loading ? (
              <p className="vl-placeholder">Loading videos…</p>
            ) : videos.length === 0 ? (
              <p className="vl-placeholder">No videos available.</p>
            ) : (
              <>
                {videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <p className="vl-placeholder">No videos match your search.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
                    {videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase())).map((v) => (
                      <div
                        key={v._id}
                        style={{
                          background: "#1e293b",
                          borderRadius: "8px",
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                        }}
                        onClick={() => navigate(`/videos/${v._id}`)}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        <div style={{ aspectRatio: "16/9", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                          <span style={{ fontSize: "28px" }}>▶️</span>
                        </div>
                        <div style={{ padding: "12px" }}>
                          <p style={{ margin: "0 0 4px 0", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>
                            {v.title}
                          </p>
                          <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            By {v.uploader}
                          </p>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8" }}>
                            <span>👍 {v.likes || 0}</span>
                            <span>💬 {v.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : activeNav === "Dashboard" ? (
          <>
        {userRole === "Teacher" ? (
          <>
            {/* ── Teacher Dashboard: Uploads vs Likes Graph ── */}
            <div className="vl-middle-row">
              <section className="vl-section" style={{ width: "100%" }}>
                <h2>📊 Your uploads vs engagement</h2>
                {teacherVideos.length === 0 ? (
                  <p className="vl-placeholder">No videos uploaded yet. Start uploading to see analytics!</p>
                ) : (
                  <TeacherChart teacherVideos={teacherVideos} />
                )}
              </section>
            </div>
          </>
        ) : (
          <>
        {/* ── Continue watching + Your progress ── */}
        <div className="vl-middle-row">
          {/* Continue watching */}
          <section className="vl-section vl-continue">
            <div className="vl-section-header">
              <h2>Continue watching</h2>
              {continueWatching.length > 1 && <Link to="#" className="vl-see-all">See all</Link>}
            </div>

            {loading ? (
              <p className="vl-placeholder">Loading videos…</p>
            ) : continueWatching.length === 0 ? (
              <p className="vl-placeholder">
                No videos in progress yet. <Link to="#" onClick={() => setActiveNav("My Videos")}>Browse videos</Link> and start watching!
              </p>
            ) : (
              continueWatching.map((v) => (
                <VideoRow
                  key={v._id}
                  video={v}
                  progressPct={progress[v._id]?.percent || 0}
                  onClick={() => navigate(`/videos/${v._id}`)}
                />
              ))
            )}

            {/* Show all videos as a browseable list when no in-progress */}
            {!loading && continueWatching.length === 0 && videos.length > 0 && (
              <div className="vl-all-videos">
                {videos.slice(0, 3).map((v) => (
                  <VideoRow
                    key={v._id}
                    video={v}
                    progressPct={0}
                    onClick={() => navigate(`/videos/${v._id}`)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Your progress */}
          <section className="vl-section vl-progress-panel">
            <h2>Your progress</h2>
            {loading ? (
              <p className="vl-placeholder">Loading…</p>
            ) : topVideos.length === 0 ? (
              <p className="vl-placeholder">No videos yet.</p>
            ) : (
              topVideos.map((v) => (
                <ProgressBar
                  key={v._id}
                  label={v.title || "Untitled"}
                  value={progress[v._id]?.percent || 0}
                />
              ))
            )}
          </section>
        </div>

        {/* ── Recent comments + Available languages ── */}
        <div className="vl-bottom-row">
          {/* Recent comments */}
          <section className="vl-section vl-comments">
            <h2>Recent comments</h2>
            {recentComments.length === 0 ? (
              <p className="vl-placeholder">No comments yet.</p>
            ) : (
              recentComments.map((c, i) => (
                <div key={i} className="vl-comment-item">
                  <div className="vl-comment-avatar">{getInitials(userName)}</div>
                  <div className="vl-comment-body">
                    <span className="vl-comment-meta">
                      You · {c.videoTitle || "Video"}
                    </span>
                    <p className="vl-comment-text">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Available languages */}
          <section className="vl-section vl-languages">
            <h2>Available languages</h2>
            <div className="vl-lang-grid">
              {[
                { name: "English", count: videos.length, color: "#f59e0b" },
                { name: "Hindi",   count: Math.floor(videos.length * 0.6), color: "#4ade80" },
                { name: "Kannada", count: Math.floor(videos.length * 0.4), color: "#f59e0b" },
              ].map((lang) => (
                <div key={lang.name} className="vl-lang-card">
                  <span className="vl-lang-dot" style={{ background: lang.color }} />
                  <div>
                    <p className="vl-lang-name">{lang.name}</p>
                    <p className="vl-lang-count">{lang.count} videos</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
          </>
        )}
          </>
        ) : activeNav === "My Videos" && userRole === "Teacher" ? (
          <div style={{ width: "100%", padding: "20px" }}>
            {/* Upload Section */}
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
              <h3 style={{ marginTop: 0, marginBottom: "15px", fontSize: "18px" }}>📤 Upload New Video</h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #334155",
                    background: "#0f172a",
                    color: "#e2e8f0",
                  }}
                />
                <input
                  type="text"
                  placeholder="Video title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #334155",
                    background: "#0f172a",
                    color: "#e2e8f0",
                  }}
                />
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "6px",
                    background: uploading ? "#64748b" : "#3b82f6",
                    color: "white",
                    border: "none",
                    cursor: uploading ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                  }}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>

            {/* Search Section */}
            <input
              type="text"
              placeholder="🔍 Search your videos..."
              value={teacherSearchQuery}
              onChange={(e) => setTeacherSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "8px",
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#e2e8f0",
                fontSize: "15px",
              }}
            />

            {/* Videos Section */}
            {teacherLoading ? (
              <p className="vl-placeholder">Loading your videos…</p>
            ) : teacherVideos.length === 0 ? (
              <p className="vl-placeholder">You haven't uploaded any videos yet.</p>
            ) : (
              <>
                {teacherVideos.filter(v => v.title.toLowerCase().includes(teacherSearchQuery.toLowerCase())).length === 0 ? (
                  <p className="vl-placeholder">No videos match your search.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
                    {teacherVideos.filter(v => v.title.toLowerCase().includes(teacherSearchQuery.toLowerCase())).map((v) => (
                      <div
                        key={v._id}
                        style={{
                          background: "#1e293b",
                          borderRadius: "8px",
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                        }}
                        onClick={() => navigate(`/videos/${v._id}`)}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        <div style={{ aspectRatio: "16/9", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                          <span style={{ fontSize: "28px" }}>▶️</span>
                        </div>
                        <div style={{ padding: "12px" }}>
                          <p style={{ margin: "0 0 4px 0", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>
                            {v.title}
                          </p>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8" }}>
                            <span>👍 {v.likes || 0}</span>
                            <span>💬 {v.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <section className="vl-section" style={{ padding: "20px", marginBottom: "20px", marginLeft: "30px", marginRight: "30px" }}>
            <h2 style={{ marginTop: 0, marginBottom: "12px", fontSize: "18px" }}>Your Liked Videos</h2>
            {likedLoading ? (
              <p className="vl-placeholder">Loading liked videos…</p>
            ) : likedVideos.length === 0 ? (
              <p className="vl-placeholder">You haven't liked any videos yet.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px" }}>
                {likedVideos.map((v) => (
                  <div
                    key={v._id}
                    style={{
                      background: "#1e293b",
                      borderRadius: "6px",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                    }}
                    onClick={() => navigate(`/videos/${v._id}`, { state: { from: 'liked' } })}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <div style={{ aspectRatio: "16/9", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                      <span style={{ fontSize: "20px" }}>▶️</span>
                    </div>
                    <div style={{ padding: "6px" }}>
                      <p style={{ margin: "0 0 2px 0", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "9px" }}>
                        {v.title}
                      </p>
                      <p style={{ margin: "0 0 2px 0", fontSize: "8px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        By {v.uploader}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", color: "#94a3b8" }}>
                        <span>👍 {v.likes || 0}</span>
                        <span>💬 {v.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* ── Profile slide-in panel ── */}
      {profileOpen && (
        <>
          <div className="vl-overlay-bg" onClick={handleProfileClose} />
          <div className="vl-profile-panel">
            <button className="vl-panel-close" onClick={() => setProfileOpen(false)}>✕</button>

            {/* Avatar + name */}
            <div className="vl-panel-hero">
              <div className="vl-panel-avatar">{getInitials(userName)}</div>
              <h2 className="vl-panel-name">{userName}</h2>
              <span className="vl-panel-role-badge">{userRole}</span>
            </div>

            {/* Info rows */}
            <div className="vl-panel-info">
              <div className="vl-panel-row">
                <span className="vl-panel-key">📧 Email</span>
                <span className="vl-panel-val">{userEmail || "—"}</span>
              </div>
              {userRole !== "Teacher" && (
                <>
                  <div className="vl-panel-row">
                    <span className="vl-panel-key">🎬 Videos watched</span>
                    <span className="vl-panel-val">{Object.keys(progress).length}</span>
                  </div>
                  <div className="vl-panel-row">
                    <span className="vl-panel-key">❤️ Liked videos</span>
                    <span className="vl-panel-val">{liked.length}</span>
                  </div>
                  <div className="vl-panel-row">
                    <span className="vl-panel-key">💬 Comments</span>
                    <span className="vl-panel-val">{totalComments}</span>
                  </div>
                </>
              )}
              <div className="vl-panel-row">
                <span className="vl-panel-key">🕐 Member since</span>
                <span className="vl-panel-val">{new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
              </div>
            </div>

            {/* Logout */}
            <button className="vl-panel-logout" onClick={handleLogout}>
              ⎋ &nbsp;Sign out
            </button>
          </div>
        </>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            background: "#1e293b",
            border: `2px solid ${modalType === "success" ? "#10b981" : modalType === "error" ? "#ef4444" : "#f59e0b"}`,
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "400px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}>
            <p style={{ fontSize: "20px", marginBottom: "10px" }}>
              {modalType === "success" ? "✅" : modalType === "error" ? "❌" : "⚠️"}
            </p>
            <p style={{ fontSize: "16px", color: "#e2e8f0", margin: "0 0 20px 0", lineHeight: "1.5" }}>
              {modalMessage}
            </p>
            <button
              onClick={() => setModalOpen(false)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                background: modalType === "success" ? "#10b981" : modalType === "error" ? "#ef4444" : "#f59e0b",
                color: "white",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════ Sub-components ═══════ */

const StatCard = ({ label, value, sub, accent }) => (
  <div className="vl-stat-card">
    <p className="vl-stat-label">{label}</p>
    <p className="vl-stat-value" style={{ color: accent }}>{value}</p>
    <p className="vl-stat-sub">{sub}</p>
  </div>
);

const VideoRow = ({ video, progressPct, onClick }) => {
  const pct = Math.round(progressPct);
  return (
    <div className="vl-video-row" onClick={onClick} title={video.title}>
      <div className="vl-video-thumb">
        <span className="vl-play-icon">▶</span>
      </div>
      <div className="vl-video-info">
        <p className="vl-video-title">{video.title || "Untitled"}</p>
        <p className="vl-video-meta">
          {video.uploadedAt
            ? `Uploaded ${new Date(video.uploadedAt).toLocaleDateString()}`
            : ""}
          {pct > 0 ? ` · ${pct}% watched` : ""}
        </p>
        {pct > 0 && (
          <div className="vl-mini-bar">
            <div className="vl-mini-fill" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
      {video.transcription && (
        <span className="vl-lang-badge">Transcript</span>
      )}
    </div>
  );
};

const ProgressBar = ({ label, value }) => (
  <div className="vl-prog-item">
    <p className="vl-prog-label">{label}</p>
    <div className="vl-prog-track">
      <div
        className="vl-prog-fill"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  </div>
);

const TeacherChart = ({ teacherVideos }) => {
  if (!teacherVideos || teacherVideos.length === 0) {
    return <p style={{ color: "#94a3b8", textAlign: "center" }}>No data available</p>;
  }

  const maxLikes = Math.max(...teacherVideos.map((v) => v.likes || 0), 1);
  const chartWidth = 1000;
  const chartHeight = 300;
  const margin = { top: 24, right: 24, bottom: 72, left: 56 };
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - 24;
  const slotWidth = plotWidth / teacherVideos.length;
  const barWidth = Math.max(26, Math.min(64, slotWidth * 0.58));
  const yTicks = [0, Math.ceil(maxLikes / 4), Math.ceil(maxLikes / 2), Math.ceil((maxLikes * 3) / 4), maxLikes];

  return (
    <div style={{ width: "100%", overflowX: "auto", paddingBottom: "12px" }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + 88}`}
        width="100%"
        height="auto"
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="teacherBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>

        {/* Y-axis labels */}
        {yTicks.map((val, idx) => {
          const y = margin.top + plotHeight - (idx * plotHeight) / 4;
          return (
            <text
              key={`y-label-${idx}`}
              x={margin.left - 12}
              y={y + 4}
              fontSize="12"
              fill="#94a3b8"
              textAnchor="end"
            >
              {val}
            </text>
          );
        })}

        {/* Horizontal grid lines */}
        {[0, 1, 2, 3, 4].map((idx) => (
          <line
            key={`grid-${idx}`}
            x1={margin.left}
            y1={margin.top + plotHeight - (idx * plotHeight) / 4}
            x2={margin.left + plotWidth}
            y2={margin.top + plotHeight - (idx * plotHeight) / 4}
            stroke="#334155"
            strokeDasharray="5,6"
            strokeWidth="1"
          />
        ))}

        {/* X-axis */}
        <line
          x1={margin.left}
          y1={margin.top + plotHeight}
          x2={margin.left + plotWidth}
          y2={margin.top + plotHeight}
          stroke="#64748b"
          strokeWidth="2"
        />

        {/* Y-axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + plotHeight}
          stroke="#64748b"
          strokeWidth="2"
        />

        {/* Bars */}
        {teacherVideos.map((video, idx) => {
          const likes = video.likes || 0;
          const barHeight = (likes / maxLikes) * plotHeight;
          const xCenter = margin.left + idx * slotWidth + slotWidth / 2;
          const x = xCenter - barWidth / 2;
          const y = margin.top + plotHeight - barHeight;
          const label = video.title?.length > 14 ? `${video.title.slice(0, 14)}...` : (video.title || "Untitled");

          return (
            <g key={`bar-${idx}`} style={{ cursor: "pointer" }}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="url(#teacherBarGradient)"
                rx="10"
                ry="10"
              />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="rgba(255,255,255,0.04)"
                rx="10"
                ry="10"
              />
              {likes > 0 && (
                <text
                  x={xCenter}
                  y={Math.max(margin.top + 16, y + 18)}
                  fontSize="12"
                  fontWeight="700"
                  fill="#eff6ff"
                  textAnchor="middle"
                >
                  {likes}
                </text>
              )}
              <text
                x={xCenter}
                y={margin.top + plotHeight + 28}
                fontSize="11"
                fill="#cbd5e1"
                textAnchor="middle"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g>
          <rect x={margin.left} y={chartHeight + 36} width={12} height={12} fill="#2563eb" rx="3" />
          <text x={margin.left + 18} y={chartHeight + 46} fontSize="12" fill="#cbd5e1">
            Likes per video
          </text>
        </g>
      </svg>
    </div>
  );
};

export default UserDashboard;
