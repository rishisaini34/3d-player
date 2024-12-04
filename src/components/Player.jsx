import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { BsArrowLeft, BsArrowsFullscreen, BsFullscreenExit } from "react-icons/bs";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

export default function Player() {
  const navigate = useNavigate();
  const location = useLocation();
  const mountRef = useRef(null);
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false); // Default to not playing
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false); // Hidden by default
  const [seekValue, setSeekValue] = useState(0); // To handle seek bar position
  let controlsTimeout = null;
  let updateSeekInterval = null;

  // Get the video path from query parameters or state
  const videoPath = location.state?.videoPath || '';

  useEffect(() => {
    if (!videoPath) {
      console.error('No video path provided');
      return;
    }

    // Initialize Three.js Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Set up video element
    const video = videoRef.current;
    video.src = videoPath;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.style.display = 'none';

    // Handle texture creation and scene setup after video can play
    const handleVideoCanPlay = () => {
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;

      // Create a sphere and apply the video texture
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.scale.set(-1, 1, 1);
      scene.add(sphere);

      // Add VRButton to enable VR mode
      const vrButton = VRButton.createButton(renderer);
      vrButton.style.position = 'absolute';
      vrButton.style.bottom = '10px';
      vrButton.style.right = '10px';
      vrButton.style.zIndex = '2';
      vrButton.setAttribute('data-vr-button', 'true');
      document.body.appendChild(vrButton);

      // Play the video automatically
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Failed to play video:', error);
      });

      // Render loop
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });

      // Update seek bar periodically
      updateSeekInterval = setInterval(() => {
        setSeekValue((video.currentTime / video.duration) * 100);
      }, 1000);
    };

    video.addEventListener('canplay', handleVideoCanPlay);

    video.addEventListener('error', (e) => {
      console.error('Video error:', e);
    });

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Show controls on mouse movement or VR controller interaction
    const handleMouseMovement = () => {
      clearTimeout(controlsTimeout);
      setShowControls(true);
      controlsTimeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    window.addEventListener('mousemove', handleMouseMovement);
    window.addEventListener('vrcontrollerselectstart', handleMouseMovement); // For VR controller interaction

    return () => {
      // Clean up on component unmount
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      video.pause();
      video.removeAttribute('src');
      video.load();
      const vrButton = document.querySelector('button[data-vr-button]');
      if (vrButton) {
        document.body.removeChild(vrButton);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMovement);
      window.removeEventListener('vrcontrollerselectstart', handleMouseMovement);
      clearTimeout(controlsTimeout);
      if (updateSeekInterval) {
        clearInterval(updateSeekInterval);
      }
    };
  }, [videoPath]);

  // Control functions
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    const video = videoRef.current;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
  };

  const handleSeek = (event) => {
    const video = videoRef.current;
    const seekTo = (event.target.value / 100) * video.duration;
    video.currentTime = seekTo;
    setSeekValue(event.target.value);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <Container>
      <div className="back">
        <BsArrowLeft onClick={() => navigate(-1)} />
      </div>
      <video ref={videoRef} className="video-player" />

      <div ref={mountRef} />

      {/* Playback controls */}
      <Controls ref={controlsRef} show={showControls}>
        <button onClick={handlePlayPause}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={handleRestart}>
          <FaRedo />
        </button>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={seekValue}
          onChange={handleSeek}
        />
        <button onClick={toggleFullscreen}>
          {isFullscreen ? <BsFullscreenExit /> : <BsArrowsFullscreen />}
        </button>
      </Controls>
    </Container>
  );
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;

  .back {
    position: absolute;
    padding: 2rem;
    z-index: 1;
    svg {
      font-size: 3rem;
      cursor: pointer;
      color: white;
    }
  }

  .video-player {
    display: none; /* Hide video element as it's only used for the 3D texture */
  }
`;

const Controls = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: ${({ show }) => (show ? "flex" : "none")};
  gap: 1rem;
  z-index: 2;
  align-items: center;

  button {
    background: rgba(0, 0, 0, 0.7);
    border: none;
    padding: 1rem;
    border-radius: 50%;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  input[type="range"] {
    width: 200px;
  }
`;
