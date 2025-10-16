import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import "./VideoList.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

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

  if (loading) return <div className="loading">Loading videos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <div className="carousel-header">
        <h4>Upcoming Videos</h4>
      </div>

      <div id="carouselExampleAutoplaying" className="carousel slide main" data-bs-ride="carousel">
        <div className="carousel-inner">
          {videos.length > 0 ? (
            videos.map((video, index) => (
              <div
                key={video.videoId}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
              >
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
            ))
          ) : (
            <div className="carousel-item active">
              <p className="text-center">No upcoming videos available</p>
            </div>
          )}
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleAutoplaying"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>

        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleAutoplaying"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </>
  );
};

export default VideoList;
