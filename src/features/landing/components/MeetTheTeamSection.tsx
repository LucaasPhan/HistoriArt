"use client";

import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Facebook, Github, Linkedin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TEAM } from "../constants";
import { AnimatedSection, fadeUp } from "./AnimatedSection";

export default function MeetTheTeamSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { t } = useTranslation();

  const scrollLeft = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0].clientWidth + 24; // width + gap
      scrollRef.current.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const { scrollLeft: currentLeft, scrollWidth, clientWidth } = scrollRef.current;
      const cardWidth = scrollRef.current.children[0].clientWidth + 24;

      // If we've reached the end (with a 10px margin for precision), loop back to the start
      if (currentLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(() => {
      scrollRight();
    }, 3500);

    return () => clearInterval(intervalId);
  }, [isPaused]);

  return (
    <AnimatedSection
      style={{
        position: "relative",
        zIndex: 1,
        padding: "80px 24px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <div id="team" style={{ scrollMarginTop: 80 }} />

      {/* Title area with navigation buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 56,
          flexWrap: "wrap",
          gap: 24,
        }}
      >
        <div style={{ textAlign: "left", flex: "1 1 300px" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            {t("team.heading")} <span className="gradient-text">{t("team.headingAccent")}</span>
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 16,
              marginTop: 12,
              maxWidth: 500,
              margin: "12px 0 0 0",
            }}
          >
            {t("team.subtitle")}
          </p>
        </div>

        {/* Carousel controls (hidden on desktop) */}
        <div className="team-controls" style={{ display: "flex", gap: 12 }}>
          <button
            onClick={scrollLeft}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              color: "var(--text-primary)",
              boxShadow: "var(--shadow-sm)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--text-primary)";
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.color = "var(--text-primary)";
              setIsPaused(true);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.color = "var(--text-primary)";
              setIsPaused(false);
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={scrollRight}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              color: "var(--text-primary)",
              boxShadow: "var(--shadow-sm)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--text-primary)";
              e.currentTarget.style.transform = "scale(1.05)";
              setIsPaused(true);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.transform = "scale(1)";
              setIsPaused(false);
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        style={{ margin: "0 -24px", padding: "0 24px" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          ref={scrollRef}
          className="team-carousel-container team-layout-container"
          style={{
            display: "flex",
            gap: 24,
            paddingBottom: 40,
            paddingTop: 8,
          }}
        >
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              whileHover={{ y: -8, boxShadow: "var(--shadow-glow)" }}
              className="team-card"
              style={{
                scrollSnapAlign: "center",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: 32,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 16,
                transition: "box-shadow 0.3s, transform 0.3s",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              {/* Background gradient accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 80,
                  background: `linear-gradient(135deg, ${member.gradient[0]}, ${member.gradient[1]})`,
                  opacity: 0.15,
                  zIndex: 0,
                }}
              />

              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${member.gradient[0]}, ${member.gradient[1]})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                  border: "4px solid var(--bg-card)",
                  boxShadow: "var(--shadow-md)",
                  overflow: "hidden",
                }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <h3
                  style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}
                >
                  {member.name}
                </h3>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#ffffff",
                    background: `linear-gradient(135deg, ${member.gradient[0]}, ${member.gradient[1]})`,
                    padding: "4px 16px",
                    borderRadius: 16,
                    display: "inline-block",
                    alignSelf: "center",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {t(`team.member.${i + 1}.role` as any)}
                </span>
              </div>

              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                  position: "relative",
                  zIndex: 1,
                  margin: 0,
                }}
              >
                {t(`team.member.${i + 1}.desc` as any)}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: "auto",
                  paddingTop: 16,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <a
                  href={member.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--text-secondary)", transition: "color 0.2s" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = member.gradient[0])}
                  onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  <Facebook size={18} />
                </a>
                <a
                  href={member.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--text-secondary)", transition: "color 0.2s" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = member.gradient[0])}
                  onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href={member.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--text-secondary)", transition: "color 0.2s" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = member.gradient[0])}
                  onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  <Github size={18} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (min-width: 1200px) {
          .team-layout-container {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
          }
          .team-controls {
            display: none !important;
          }
          .team-card {
            flex: 0 0 320px !important;
            width: 320px !important;
          }
        }
        @media (max-width: 1199px) {
          .team-layout-container {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .team-card {
            flex: 0 0 300px !important;
          }
          .team-layout-container::-webkit-scrollbar {
            display: none;
          }
        }
      `,
        }}
      />
    </AnimatedSection>
  );
}
