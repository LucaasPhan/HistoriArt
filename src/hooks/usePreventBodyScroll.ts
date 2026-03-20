import { useLenis } from "lenis/react";
import { useEffect } from "react";

/**
 * Custom hook to prevent body scroll and handle scrollbar layout shifts.
 * Integration with Lenis smooth scroll is also handled.
 *
 * @param isOpen - Whether the scroll should be prevented
 */
export function usePreventBodyScroll(isOpen: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (isOpen) {
      // Stop Lenis smooth scroll
      lenis?.stop();

      // Prevent layout shift by adding padding equal to scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      // Apply overflow hidden to root element to prevent native scroll
      document.documentElement.style.overflow = "hidden";
    } else {
      // Resume Lenis smooth scroll
      lenis?.start();

      // Small timeout to allow exit animations before restoring layout
      const timeoutId = setTimeout(() => {
        document.body.style.paddingRight = "";
        document.documentElement.style.overflow = "";
      }, 111);

      return () => clearTimeout(timeoutId);
    }

    return () => {
      // Cleanup: always resume scroll and reset styles
      lenis?.start();
      document.body.style.paddingRight = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen, lenis]);
}
