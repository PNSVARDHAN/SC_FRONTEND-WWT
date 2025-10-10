import { useRef, useState, useEffect } from "react";
import axios from "../../utils/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./VideoCardCarousel.css";
import MultiScheduleModal from "./MultiScheduleModal";
import arrow from "../../assets/right-arrow-next-svgrepo-com.svg";

interface Video {
  videoId: number;
  title: string;
  description: string;
  duration: number;
  uploadedAt: string;
  videoUrl: string;
}

const PUBLIC_BASE_URL = "https://pub-cafffcbfe1b04cb4bc378666a1eefad2.r2.dev";

const VideoCardCarousel: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [scrollAmount, setScrollAmount] = useState(300);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    fetchVideos();
    updateScrollAmount();
    window.addEventListener("resize", updateScrollAmount);
    return () => window.removeEventListener("resize", updateScrollAmount);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, [videos]);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const response = await axios.get("/api/videos/my-videos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedVideos = response.data.map((v: Video) => ({
        ...v,
        videoUrl: v.videoUrl.startsWith("https://")
          ? v.videoUrl
          : `${PUBLIC_BASE_URL}/${v.videoUrl}`,
      }));

      setVideos(updatedVideos);
      generateThumbnails(updatedVideos);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching videos:", err);
      setError(err.response?.data?.msg || "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnails = (videos: Video[]) => {
    videos.forEach((video) => {
      const videoEl = document.createElement("video");
      videoEl.src = video.videoUrl;
      videoEl.crossOrigin = "anonymous";
      videoEl.muted = true;

      videoEl.addEventListener("loadedmetadata", () => {
        const captureTime = Math.min(2, videoEl.duration / 2);
        videoEl.currentTime = captureTime;
      });

      videoEl.addEventListener("seeked", () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = videoEl.videoWidth / 2;
          canvas.height = videoEl.videoHeight / 2;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            setThumbnails((prev) => ({
              ...prev,
              [video.videoId]: canvas.toDataURL("image/jpeg"),
            }));
          }
        } catch (e) {
          console.warn("CORS blocked thumbnail generation:", e);
          setThumbnails((prev) => ({
            ...prev,
            [video.videoId]:
              "https://via.placeholder.com/300x150.png?text=Video+Preview",
          }));
        }
        videoEl.remove();
      });
    });
  };

  const updateScrollAmount = () => {
    if (window.innerWidth < 768) setScrollAmount(200);
    else if (window.innerWidth < 1200) setScrollAmount(400);
    else setScrollAmount(600);
  };

  const scrollLeft = () => carouselRef.current?.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  const scrollRight = () => carouselRef.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });

  const checkScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDownload = (video: Video) => {
    const link = document.createElement("a");
    link.href = video.videoUrl;
    link.download = video.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (videoId: number) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`/api/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(videos.filter((v) => v.videoId !== videoId));
    } catch (err) {
      console.error("Error deleting video:", err);
    }
  };

  if (loading) return <div className="loading">Loading videos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="carousel-header">
        <h4>My Videos</h4>
        <button className="btn-schedule" onClick={() => setShowScheduleModal(true)}>
          <span className="plus-symbol">+</span> Create Playlist
        </button>
      </div>

      <div className="carousel-container">
        {showLeft && (
          <button className="scroll-btn left" onClick={scrollLeft}>
            <img src={arrow} alt="left" style={{ transform: "rotate(180deg)", width: "40px" }} />
          </button>
        )}

        <div className="carousel-track" ref={carouselRef}>
          {videos.map((video) => (
            <div className="card position-relative" key={video.videoId}>
              {thumbnails[video.videoId] ? (
                <img className="card-img-top" src={thumbnails[video.videoId]} alt={video.title} />
              ) : (
                <div className="card-img-top" style={{ height: "150px", background: "#ccc", display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}>
                  Loading thumbnail...
                </div>
              )}

              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">{video.title}</h5>
                  {/* Three dots menu beside title */}
                  <div className="dropdown">
                    <button
                      className="btn btn-light btn-sm "
                      type="button"
                      id={`dropdown${video.videoId}`}
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      &#8942;
                    </button>
                    <ul
                      className="dropdown-menu dropdown-menu-end"
                      aria-labelledby={`dropdown${video.videoId}`}
                    >
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleDownload(video)}
                        >
                          Download
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={() => handleDelete(video.videoId)}
                        >
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                <p className="card-text">{video.description}</p>
                <small className="text-muted">
                  Duration: {formatDuration(video.duration)}
                </small>
              </div>

            </div>
          ))}
        </div>

        {showRight && (
          <button className="scroll-btn right" onClick={scrollRight}>
            <img src={arrow} alt="Right" style={{ width: "40px" }} />
          </button>
        )}
      </div>

      {showScheduleModal && (
        <div className="schedule-modal-backdrop" onClick={() => setShowScheduleModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <MultiScheduleModal onClose={() => setShowScheduleModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCardCarousel;
