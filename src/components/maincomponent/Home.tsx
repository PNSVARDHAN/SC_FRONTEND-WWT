// import React, { useEffect, useState } from "react";
import VideoList from "../videos/VideoList"; 
import VideoCardCarousel from "../videos/VideoCardCarousel"
import "./Home.css"

// interface Video {
//   videoId: number;
//   title: string;
//   description: string;
//   videoUrl: string;
// }

const VideosPage: React.FC = () => {
  // const [videos, setVideos] = useState<Video[]>([]);


  return (
    <div className="videos-page">
      <div>
        <h4>Recent Cast</h4>
        <VideoList/>
      </div>

      <div>
        <VideoCardCarousel/>
      </div>
    </div>
  );
};

export default VideosPage;
