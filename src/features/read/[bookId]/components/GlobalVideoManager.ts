export const getGlobalVideo = () => {
  if (typeof window === "undefined") return null;
  let video = document.getElementById("historiart-global-video") as HTMLVideoElement;
  if (!video) {
    video = document.createElement("video");
    video.id = "historiart-global-video";
    video.controls = true;
    video.playsInline = true;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "contain";
    video.style.outline = "none";
    video.style.background = "#000";
    video.style.pointerEvents = "auto";
    video.style.position = "relative";
    video.style.zIndex = "1";
    // appending to body so it isn't completely detached initially, but we will move it immediately
  }
  return video;
};
