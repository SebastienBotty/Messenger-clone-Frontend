import React, { useRef, useState, useEffect } from "react";
import "./VideoPlayer.css";

const VideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const togglePlay = (): void => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((error) => {
        console.error("Erreur de lecture:", error);
      });
    }
  };

  const handleTimeUpdate = (): void => {
    if (!videoRef.current) return;

    setCurrentTime(videoRef.current.currentTime);
    const newProgress = (videoRef.current.currentTime / duration) * 100;
    setProgress(isNaN(newProgress) ? 0 : newProgress);
  };

  const handleLoadedMetadata = (): void => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!videoRef.current || !duration) return;

    const seekTime = (Number(e.target.value) / 100) * duration;
    videoRef.current.currentTime = seekTime;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!videoRef.current) return;

    const newVolume = Number(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = (): void => {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    if (!isMuted) {
      setVolume(0);
    } else {
      setVolume(1);
      videoRef.current.volume = 1;
    }
  };

  const changePlaybackRate = (rate: number): void => {
    if (!videoRef.current) return;

    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <div className="video-player-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          width="auto"
          height="100%"
          controls={false}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        >
          <source src={src} />
          Votre navigateur ne supporte pas les vidéos HTML5.
        </video>
        <div className="video-controls">
          <div className="progress-container">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="progress-bar"
            />
          </div>
          <div className="player-control">
            {" "}
            <button onClick={togglePlay}>{isPlaying ? "⏸" : "▶️"}</button>
          </div>

          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <div className="volume-controls">
            <button onClick={toggleMute}>{isMuted ? "🔇" : volume > 0.5 ? "🔊" : "🔉"}</button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>

          <div className="playback-rate">
            Vitesse:
            {[0.5, 1, 1.5, 2].map((rate) => (
              <button
                key={rate}
                className={playbackRate === rate ? "active" : ""}
                onClick={() => changePlaybackRate(rate)}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Fonction utilitaire pour formater le temps
function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "00:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default VideoPlayer;
