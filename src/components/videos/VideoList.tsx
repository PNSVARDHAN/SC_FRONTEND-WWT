import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import "./VideoList.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

interface Video {
  videoId: number;
  title: string;
  description: string;
  duration: number;
  uploadedAt: string;
  videoUrl: string;
}

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const response = await axios.get("/api/videos/my-videos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVideos(response.data);
      console.log(response)
      setError(null);
    } catch (err: any) {
      console.error("Error fetching videos:", err);
      setError(err.response?.data?.msg || "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading videos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <div id="carouselExampleAutoplaying" className="carousel slide main" data-bs-ride="carousel">
        <div className="carousel-inner">
          {videos.length > 0 ? (
            videos.map((video, index) => (
              <div key={video.videoId} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                <video
                  className="d-block w-100"
                  src={video.videoUrl} 
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls={false} // optional: hide controls
                />
              </div>
            ))
          ) : (
            <div className="carousel-item active">
              <p className="text-center">No videos available</p>
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
