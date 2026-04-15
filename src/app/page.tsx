"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import { motion } from "framer-motion";

import BooksPreviewSection from "@/features/landing/components/BooksPreviewSection";
import DemoPreviewSection from "@/features/landing/components/DemoPreviewSection";
import FeaturesSection from "@/features/landing/components/FeaturesSection";
import Footer from "@/features/landing/components/Footer";
import HeroSection from "@/features/landing/components/HeroSection";
import MeetTheTeamSection from "@/features/landing/components/MeetTheTeamSection";
export default function LandingPage() {
  return (
    <>
      <div style={{ minHeight: "100vh", overflow: "hidden" }}>
        {/* ═══ BG Orbs ═════════════════════════════ */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(139,0,0,0.08) 0%, transparent 70%)",
              top: "10%",
              left: "-5%",
              filter: "blur(60px)",
            }}
          />
          <motion.div
            animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
            transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 450,
              height: 450,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(27,67,50,0.08) 0%, transparent 70%)",
              bottom: "20%",
              right: "-3%",
              filter: "blur(60px)",
            }}
          />
        </div>

        <HeroSection />
        <FeaturesSection />
        <BooksPreviewSection />
        <DemoPreviewSection />
        <MeetTheTeamSection />
        <Footer />
      </div>
      <PageMountSignaler />
    </>
  );
}
