"use client";

import { GlobalNavigationHandler } from "@/components/TransitionLink";
import { useIsMobile } from "@/hooks/useMobile";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePreventBodyScroll } from "@/hooks/usePreventBodyScroll";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

let isInitialMount = true;

export const LogoLoading = ({
  logoOverlayRef,
  logoRef,
}: {
  logoOverlayRef: React.RefObject<HTMLDivElement | null>;
  logoRef: React.RefObject<HTMLDivElement | null>;
}) => {
  return (
    <div
      ref={logoOverlayRef}
      className="pointer-events-none fixed top-0 left-0 z-10000 flex h-screen w-screen items-center justify-center bg-black opacity-100"
    >
      <div className="flex flex-col items-center justify-center gap-4 p-[20px]" ref={logoRef}>
        <p className="text-xs font-semibold tracking-[0.2em] text-white/80 uppercase md:text-sm">
          <Image src="/litcompanion-textonly.svg" alt="Logo" width={300} height={300} />
        </p>

        <div className="relative mt-2 h-px w-24 overflow-hidden bg-white/20">
          <div className="absolute top-0 left-0 h-full w-1/3 animate-[slide_0.8s_linear_infinite] bg-white" />
        </div>
      </div>
    </div>
  );
};

export default function Template({ children }: { children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const logoOverlayRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const isAnimating = useRef(false);
  const [isPageCovered, setIsPageCovered] = useState(true);

  // Prevent body scroll while page is covered
  usePreventBodyScroll(isPageCovered);

  const coverPage = () => {
    if (!logoOverlayRef.current || !logoRef.current) return;
    if (isAnimating.current) return;
    isAnimating.current = true;
    setIsPageCovered(true);

    const tl = gsap.timeline();
    tl.to(blocksRef.current, {
      scaleX: 1,
      duration: 0.45,
      stagger: 0.02,
      ease: "power2.out",
      transformOrigin: "left",
    })
      .to(
        logoOverlayRef.current,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.3",
      )
      .fromTo(
        logoRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" },
        "-=0.45",
      );
  };

  const revealPage = () => {
    if (!logoOverlayRef.current || !logoRef.current) return;
    isAnimating.current = false;

    // Re-enable scroll 0.4s earlier
    setTimeout(() => setIsPageCovered(false), 0);

    const tl = gsap.timeline();
    tl.set(blocksRef.current, { scaleX: 1, transformOrigin: "right" })
      .to(blocksRef.current, {
        scaleX: 0,
        duration: 0.4,
        stagger: 0.02,
        ease: "power2.out",
        transformOrigin: "right",
      })
      .to(
        logoRef.current,
        {
          scale: 0.9,
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
        },
        "-=0.25",
      )
      .to(
        logoOverlayRef.current,
        {
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
        },
        "-=0.2",
      );
  };

  const isMobile = useIsMobile();

  useGSAP(() => {
    const createBlocks = () => {
      if (!overlayRef.current) return;
      overlayRef.current.innerHTML = "";
      blocksRef.current = [];
      const numberOfBars = isMobile ? 12 : 20;

      for (let i = 0; i < numberOfBars; i++) {
        const block = document.createElement("div");
        block.className = "pageTransitionBlock";
        overlayRef.current.appendChild(block);
        blocksRef.current.push(block);
      }
    };
    createBlocks();

    gsap.set(blocksRef.current, { scaleX: 0, transformOrigin: "left" });
  }, [isMobile]);

  useEffect(() => {
    if (isInitialMount && logoOverlayRef.current && logoRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPageCovered(false);
      const tl = gsap.timeline();
      tl.to(logoRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
      }).to(
        logoOverlayRef.current,
        {
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
        },
        "-=0.2",
      );
      setTimeout(() => {
        isInitialMount = false;
      }, 0);
    }
  }, []);

  useEffect(() => {
    const handleReveal = () => {
      if (!isInitialMount) {
        revealPage();
      }
    };

    window.addEventListener("page-mount-complete", handleReveal);
    return () => window.removeEventListener("page-mount-complete", handleReveal);
  }, []);

  useEffect(() => {
    const handleExit = () => {
      if (isInitialMount) {
        return;
      }
      coverPage();
    };
    window.addEventListener("trigger-exit", handleExit);
    return () => window.removeEventListener("trigger-exit", handleExit);
  }, []);

  return (
    <>
      <div
        ref={overlayRef}
        className="pointer-events-none fixed top-0 left-0 z-10000 flex h-screen w-screen"
      />
      <LogoLoading logoOverlayRef={logoOverlayRef} logoRef={logoRef} />
      <GlobalNavigationHandler />
      {children}
    </>
  );
}
