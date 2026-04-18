"use client";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageMountSignaler from "@/components/PageMountSignaler";

import BooksPreviewSection from "@/features/landing/components/BooksPreviewSection";
import FeaturesSection from "@/features/landing/components/FeaturesSection";
import Footer from "@/features/landing/components/Footer";
import HeroSection from "@/features/landing/components/HeroSection";
import AboutSection from "@/features/landing/components/AboutSection";
import MeetTheTeamSection from "@/features/landing/components/MeetTheTeamSection";

export default function LandingPage() {
  return (
    <>
      <div style={{ minHeight: "100vh", overflow: "hidden" }}>
        <LanguageSwitcher position="bottom-right" />
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <BooksPreviewSection />
        <MeetTheTeamSection />
        <Footer />
      </div>
      <PageMountSignaler />
    </>
  );
}
