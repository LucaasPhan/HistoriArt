"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatMockup from "./mockups/ChatMockup";
import MediaMockup from "./mockups/MediaMockup";
import BooksMockup from "./mockups/BooksMockup";
import QuizMockup from "./mockups/QuizMockup";
import CommunityMockup from "./mockups/CommunityMockup";

const MOCKUPS = [
  { id: "books", component: BooksMockup },
  { id: "media", component: MediaMockup },
  { id: "chat", component: ChatMockup },
  { id: "quiz", component: QuizMockup },
  { id: "community", component: CommunityMockup },
];

interface FeatureCarouselProps {
  activeIndex: number;
}

export default function FeatureCarousel({ activeIndex }: FeatureCarouselProps) {
  const ActiveComponent = MOCKUPS[activeIndex].component;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 420, // Slightly reduced to fit viewport
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 1200,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={MOCKUPS[activeIndex].id}
          initial={{ opacity: 0, rotateX: 10, y: 20 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, rotateX: -10, y: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "100%",
            maxWidth: 500,
            transformOrigin: "center center",
          }}
        >
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>

      {/* Background Atmosphere */}
      <div
        style={{
          position: "absolute",
          inset: -40,
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          zIndex: -1,
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
