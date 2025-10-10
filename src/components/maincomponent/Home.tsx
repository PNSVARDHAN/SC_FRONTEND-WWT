// import React, { useEffect, useState } from "react";
import VideoList from "../videos/VideoList"; 
import VideoCardCarousel from "../videos/VideoCardCarousel"
import "./Home.css"
import NextVideoCarousel from "../videos/NextVideoCarousel"

const VideosPage: React.FC = () => {


  return (
    <div className="videos-page">
      <div>
        <h4>Recent Cast</h4>
        <VideoList/>
      </div>

      <div>
        <VideoCardCarousel/>
        <NextVideoCarousel/>
      </div>
    </div>
  );
};

export default VideosPage;
