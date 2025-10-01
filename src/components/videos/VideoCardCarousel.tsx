import { useRef, useState, useEffect } from "react";
import axios from "../../utils/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./VideoCardCarousel.css";
import MultiScheduleModal from "./MultiScheduleModal";

interface Video {
  videoId: number;
  title: string;
  description: string;
  duration: number;
  uploadedAt: string;
  videoUrl: string;
}

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
      setVideos(response.data);
      generateThumbnails(response.data);
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
      videoEl.src = `${import.meta.env.VITE_API_URL}/api${video.videoUrl}`;
      videoEl.crossOrigin = "anonymous";
      videoEl.muted = true;

      videoEl.addEventListener("loadedmetadata", () => {
        const captureTime = Math.min(2, videoEl.duration / 2);
        videoEl.currentTime = captureTime;
      });

      videoEl.addEventListener("seeked", () => {
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
        videoEl.remove(); // cleanup
      });
    });
  };

  const updateScrollAmount = () => {
    if (window.innerWidth < 768) setScrollAmount(200);
    else if (window.innerWidth < 1200) setScrollAmount(400);
    else setScrollAmount(600);
  };

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

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

  if (loading) return <div className="loading">Loading videos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      {/* Header with Schedule Button */}
      <div className="carousel-header">
        <h4>My Videos</h4>
        <button
          className="btn-schedule"
          onClick={() => setShowScheduleModal(true)}
        >
          <span className="plus-symbol">+</span> Create Playlist
        </button>
      </div>

      {/* Carousel */}
      <div className="carousel-container">
        {showLeft && (
          <button className="scroll-btn left" onClick={scrollLeft}>
            <img
              src="https://www.nicepng.com/png/detail/758-7586854_arrow-png-transparent-icon-right-arrow-in-circle.png"
              alt="Left"
              style={{ transform: "rotate(180deg)", width: "40px" }}
            />
          </button>
        )}

        <div className="carousel-track" ref={carouselRef}>
          {videos.map((video) => (
            <div className="card" key={video.videoId}>
              {thumbnails[video.videoId] ? (
                <img
                  src={thumbnails[video.videoId]}
                  className="card-img-top"
                  alt={video.title}
                />
              ) : (
                <div
                  className="card-img-top"
                  style={{ height: "150px", background: "#ccc" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{video.title}</h5>
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
            <img
              src="https://www.nicepng.com/png/detail/758-7586854_arrow-png-transparent-icon-right-arrow-in-circle.png"
              alt="Right"
              style={{ width: "40px" }}
            />
          </button>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div
          className="schedule-modal-backdrop"
          onClick={() => setShowScheduleModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <MultiScheduleModal onClose={() => setShowScheduleModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCardCarousel;
