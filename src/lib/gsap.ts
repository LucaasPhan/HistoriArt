// Centralized GSAP setup for Next.js App Router
// Handles plugin registration and ScrollTrigger cleanup across navigations

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins immediately on module load
gsap.registerPlugin(ScrollTrigger, useGSAP);

if (typeof window !== "undefined") {
  // Global defaults: recalculate animation values on resize
  ScrollTrigger.defaults({ invalidateOnRefresh: true });

  // Remove "resize" from auto-refresh so GSAP doesn't refresh on every frame
  ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
  });

  // Responsive resize → Throttled refresh during interaction + Debounced final refresh
  let resizeTimer: ReturnType<typeof setTimeout>;
  let lastRefresh = 0;
  const THROTTLE_MS = 100;

  window.addEventListener("resize", () => {
    const now = Date.now();

    // Throttled refresh during the actual resize/zoom interaction
    if (now - lastRefresh > THROTTLE_MS) {
      ScrollTrigger.refresh();
      lastRefresh = now;
    }

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        // Second pass safety for complex layout shifts
        setTimeout(() => ScrollTrigger.refresh(), 100);
      });
    }, 250);
  });

  // Listen for custom page mount events (fired by PageMountSignaler during transitions)
  window.addEventListener("page-mount-complete", () => {
    // Force recalculation after navigation when DOM/scroll position might not be fully stabilized yet.
    setTimeout(() => ScrollTrigger.refresh(), 100);
    setTimeout(() => ScrollTrigger.refresh(), 600);
  });
}

// Re-export everything your app needs
export { gsap, ScrollTrigger, useGSAP };
