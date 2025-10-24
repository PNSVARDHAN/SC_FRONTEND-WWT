import { useState, useEffect, useRef } from "react";
import axios from "../../utils/axios";
import "./VideoList.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Lottie from "lottie-react";
// Animations
import loadingAnim from "../../assets/loading1.json";
import animatedDashboard from "../../assets/Animated Dashboards.json";

interface Video {
  videoId: number;
  title: string;
  description: string;
  duration: number;
  startTime: string;
  endTime: string;
  deviceId: number;
  scheduleGroupId: number;
  videoUrl: string;
  deviceName?: string;
}

const PUBLIC_BASE_URL = "https://pub-cafffcbfe1b04cb4bc378666a1eefad2.r2.dev";

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchScheduledVideos();
  }, []);

  const fetchScheduledVideos = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const response = await axios.get("/api/videos/my-next-videos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure video URLs are absolute
      const updatedVideos = response.data.map((v: Video) => ({
        ...v,
        videoUrl: v.videoUrl.startsWith("https://")
          ? v.videoUrl
          : `${PUBLIC_BASE_URL}/${v.videoUrl}`,
      }));

      setVideos(updatedVideos);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching scheduled videos:", err);
      setError(err.response?.data?.msg || "Failed to fetch scheduled videos");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="video-list-loader">
        <div className="animation-center">
          <Lottie animationData={loadingAnim} loop style={{ width: 220, height: 220 }} />
          <div className="loader-text">Loading videos...</div>
        </div>
      </div>
    );

  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <div className="carousel-header">
        <h4>Upcoming Videos</h4>
      </div>

      {videos.length > 0 ? (
        <div id="carouselExampleAutoplaying" className="carousel slide main carousel-wrapper" data-bs-ride="carousel" ref={carouselRef}>
          <div className="carousel-inner">
            {videos.map((video, index) => (
              <div key={video.videoId} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                <video
                  className="d-block w-100"
                  src={video.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls={true}
                />
                <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-2">
                  <small>
                    <b>Start:</b> {video.startTime} | <b>End:</b> {video.endTime}
                  </small>
                </div>
              </div>
            ))}
          </div>

          {/* Removed centered overlay controls per user request */}

          {/* Corner buttons (small) - appear in the left & right corners of the carousel */}
          <div className="carousel-corner-controls" aria-hidden>
            <div
              className="corner-btn corner-left"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest || !target.closest('.corner-icon')) return;
                const bs = (window as any).bootstrap;
                const el = carouselRef.current;
                if (!el) return;
                try {
                  const inst = bs?.Carousel?.getInstance(el) ?? new bs.Carousel(el);
                  inst.prev();
                } catch (err) {
                  el.querySelector('.carousel-control-prev-icon')?.dispatchEvent(new MouseEvent('click'));
                }
              }}
            >
              <span className="corner-icon carousel-control-prev-icon" aria-hidden="true"></span>
            </div>

            <div
              className="corner-btn corner-right"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest || !target.closest('.corner-icon')) return;
                const bs = (window as any).bootstrap;
                const el = carouselRef.current;
                if (!el) return;
                try {
                  const inst = bs?.Carousel?.getInstance(el) ?? new bs.Carousel(el);
                  inst.next();
                } catch (err) {
                  el.querySelector('.carousel-control-next-icon')?.dispatchEvent(new MouseEvent('click'));
                }
              }}
            >
              <span className="corner-icon carousel-control-next-icon" aria-hidden="true"></span>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-videos">
          <div className="animation-center">
            <Lottie animationData={animatedDashboard} loop style={{ width: 360, height: 360 }} />
            <div className="no-videos-text">No upcoming videos found</div>
            <div className="no-videos-sub">Once you upload videos they'll appear here.</div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoList;
