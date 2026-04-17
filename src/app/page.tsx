"use client";

import PageMountSignaler from "@/components/PageMountSignaler";

import BooksPreviewSection from "@/features/landing/components/BooksPreviewSection";
import DemoPreviewSection from "@/features/landing/components/DemoPreviewSection";
import FeaturesSection from "@/features/landing/components/FeaturesSection";
import Footer from "@/features/landing/components/Footer";
import HeroSection from "@/features/landing/components/HeroSection";
import AIFeatureSection from "@/features/landing/components/AIFeatureSection";
import MeetTheTeamSection from "@/features/landing/components/MeetTheTeamSection";
export default function LandingPage() {
  return (
    <>
      <div style={{ minHeight: "100vh", overflow: "hidden" }}>
        <HeroSection />
        <FeaturesSection />
        <BooksPreviewSection />
        <DemoPreviewSection />
        <AIFeatureSection />
        <MeetTheTeamSection />
        <Footer />
      </div>
      <PageMountSignaler />
    </>
  );
}
