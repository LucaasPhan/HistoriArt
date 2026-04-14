import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import styles from "./styles/CustomAudioPlayer.module.css";

function formatTime(time: number) {
  if (isNaN(time) || !isFinite(time)) return "00:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export default function CustomAudioPlayer({
  src,
  annotation,
  isActive = false,
  onPlayStart,
}: {
  src: string;
  annotation?: any;
  isActive?: boolean;
  onPlayStart?: () => void;
}) {
  const getAudio = () => document.getElementById("historiart-global-audio") as HTMLAudioElement;
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [lastVolume, setLastVolume] = useState(1);

  useEffect(() => {
    const audio = getAudio();
    if (!audio) return;

    const setAudioData = () => {
      if (isActive) setDuration(audio.duration);
    };

    const setAudioTime = () => {
      if (isActive) setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      if (isActive) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const handlePlay = () => isActive && setIsPlaying(true);
    const handlePause = () => isActive && setIsPlaying(false);

    if (isActive) {
      setDuration(audio.duration || 0);
      setCurrentTime(audio.currentTime || 0);
      setIsPlaying(!audio.paused);

      // Sync volume UI with what the global audio actually has
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("durationchange", setAudioData);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("durationchange", setAudioData);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [isActive]);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = getAudio();
    if (!audio) return;

    if (!isActive) {
      if (onPlayStart) onPlayStart();
      if (!audio.src.includes(src)) {
        audio.src = src;
      }
      audio.play().catch((e) => console.error("Global audio play failed:", e));
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch((e) => console.error("Global audio play failed:", e));
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = getAudio();
    if (!audio) return;

    // If we interact with an inactive player's volume, we don't necessarily play it,
    // but we do update the global volume state for when it does play

    if (isMuted || volume === 0) {
      audio.muted = false;
      const newVol = lastVolume > 0 ? lastVolume : 1;
      audio.volume = newVol;
      setVolume(newVol);
      setIsMuted(false);
    } else {
      setLastVolume(volume);
      audio.muted = true;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (clientX: number) => {
    const audio = getAudio();
    if (!audio || !volumeRef.current) return;

    const rect = volumeRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

    audio.volume = pos;
    setVolume(pos);

    if (pos === 0) {
      audio.muted = true;
      setIsMuted(true);
    } else {
      audio.muted = false;
      setIsMuted(false);
      setLastVolume(pos);
    }
  };

  const handleVolumePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    handleVolumeChange(e.clientX);
  };

  const handleVolumePointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 1) {
      handleVolumeChange(e.clientX);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const audio = getAudio();
    const progress = progressRef.current;
    if (!audio || !progress) return;

    if (!isActive) {
      if (onPlayStart) onPlayStart();
      if (!audio.src.includes(src)) {
        audio.src = src;
      }
      audio.play().catch(console.error);
      setIsPlaying(true);
    }

    const rect = progress.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const volumeRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.playerContainer} onClick={(e) => e.stopPropagation()}>
      <button onClick={togglePlayPause}>
        {isPlaying ? (
          <Pause size={16} color="var(--accent-primary)" />
        ) : (
          <Play size={16} color="var(--accent-primary)" />
        )}
      </button>

      <div className={styles.progressContainer} ref={progressRef} onClick={handleProgressClick}>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className={styles.timeInfo}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <div className={styles.volumeControl}>
        <button onClick={toggleMute} className={styles.muteBtn}>
          {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <div
          className={styles.volumeSliderContainer}
          ref={volumeRef}
          onPointerDown={handleVolumePointerDown}
          onPointerMove={handleVolumePointerMove}
        >
          <div className={styles.volumeTrack}>
            <div className={styles.volumeFill} style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
