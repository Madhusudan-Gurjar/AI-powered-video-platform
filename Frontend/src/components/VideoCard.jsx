import "../styles/VideoCard.css";

const buildPosterUrl = (video) => {
  const directPoster = video?.thumbnailUrl || video?.posterUrl;
  if (directPoster) return directPoster;

  const url = video?.url || "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/video/upload/")) {
    return "";
  }

  return url
    .replace(
      "/video/upload/",
      "/video/upload/so_1.0,w_640,h_360,c_fill,g_auto,f_jpg/"
    )
    .replace(/\.(mp4|mov|webm|mkv|avi)$/i, ".jpg");
};

const VideoCard = ({ video, onClick, showUploader = true, onDelete, className = "" }) => {
  const posterUrl = buildPosterUrl(video);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={`video-card video-card--interactive ${className}`.trim()}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="video-card__thumb">
        {posterUrl ? (
          <img
            className="video-card__poster"
            src={posterUrl}
            alt={video?.title || "Video cover"}
            loading="lazy"
          />
        ) : (
          <div className="video-card__fallback">
            <span className="video-card__play">▶</span>
          </div>
        )}
        <div className="video-card__overlay" />
        <div className="video-card__play-badge">▶</div>
      </div>
      <div className="video-card__body">
        <p className="video-card__title">{video?.title || "Untitled"}</p>
        {showUploader && (
          <p className="video-card__meta">By {video?.uploader || "Unknown"}</p>
        )}
        <div className="video-card__stats">
          <span className="video-card__stat">👍 {video?.likes || 0}</span>
          <span className="video-card__stat">💬 {video?.comments?.length || 0}</span>
        </div>
        {onDelete && (
          <button
            type="button"
            className="btn btn-sm btn-danger video-card__action"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(video._id);
            }}
          >
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
