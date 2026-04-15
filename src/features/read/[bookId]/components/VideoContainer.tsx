import React, { useEffect, useRef } from "react";
import { getGlobalVideo } from "./GlobalVideoManager";

type Props = {
  src: string;
  autoPlay?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function VideoContainer({ src, autoPlay, className, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = getGlobalVideo();
    if (!video || !containerRef.current) return;

    // Check if src changed (handling relative/absolute URL mismatches)
    if (video.src !== src && video.src !== new URL(src, window.location.origin).href) {
      video.src = src;
      video.currentTime = 0;
    }

    // Append the global video element to this container (moves it in the DOM)
    containerRef.current.appendChild(video);

    if (autoPlay || !video.paused) {
      video.play().catch(() => {});
    }
  }, [src, autoPlay]);

  return <div ref={containerRef} className={className} style={{ position: "relative", ...style }} />;
}
