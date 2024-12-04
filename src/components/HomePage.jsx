import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import VirtualTourImage from "../assets/VirtualTour.jpg";
import VirtualTour from "../assets/VirtualTour.mp4"; 
import SpaceImage from "../assets/Space.jpg";
// import videoSpace from "../assets/Space.mp4";
import SkydiveImage from "../assets/Skydive.png";
// import Skydive from "../assets/Skydive.mp4";

export default function HomePage() {
  const navigate = useNavigate();

  const handleClick = (videoPath) => {
    navigate("/player", { state: { videoPath } });
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <img
            src={require("../assets/logo.png")}
            alt="Company Logo"
            className="logo"
          />
        </div>
        <div className="heading-container">
          <h1>Cloud VR Experience Learning Platform</h1>
        </div>
      </header>
      <div className="main-container">
        <main className="main">
          <img
            src={VirtualTourImage}
            alt="Watch Video"
            className="thumbnail"
            onClick={() => handleClick(VirtualTour)}
          />
          <button className="info-text"onClick={() => handleClick(VirtualTour)}>Experience Reality</button>
        </main>
        <main className="main">
          <img
            src={SpaceImage}
            alt="Watch Video"
            className="thumbnail"
            onClick={() => handleClick(VirtualTour)}
          />
          <button 
          className="info-text"
          onClick={() => handleClick(VirtualTour)} >Experience Reality</button>
        </main>
        <main className="main">
          <img
            src={SkydiveImage}
            alt="Watch Video"
            className="thumbnail"
            onClick={() => handleClick(VirtualTour)}
          />
          <button className="info-text"
          onClick={() => handleClick(VirtualTour)}>Experience Reality</button>
        </main>
      </div>
    </div>
  );
}
