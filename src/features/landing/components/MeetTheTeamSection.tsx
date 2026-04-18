"use client";

import { useTranslation } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Github, Linkedin, Sparkles } from "lucide-react";
import { useState } from "react";
import { TEAM } from "../constants";
import { AnimatedSection } from "./AnimatedSection";

export default function MeetTheTeamSection() {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <AnimatedSection
      style={{
        position: "relative",
        zIndex: 1,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "40px 24px",
        background: "var(--bg-primary)",
        overflow: "hidden",
      }}
    >
      <div id="team" style={{ scrollMarginTop: 80 }} />

      {/* Decorative Background Glows */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          opacity: 0.15,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: 500,
          height: 500,
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          opacity: 0.1,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(24px, 5vh, 48px)" }}>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 800,
              marginBottom: 12,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            {t("team.heading")} <span className="gradient-text">{t("team.headingAccent")}</span>
          </h2>
          <p
            style={{
              fontSize: "clamp(14px, 1.5vw, 16px)",
              color: "var(--text-secondary)",
              maxWidth: 650,
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            {t("team.subtitle")}
          </p>
        </div>

        {/* Dynamic Grid Layout */}
        <div
          className="team-grid"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 40,
            padding: "20px 0",
          }}
        >
          {TEAM.map((member, i) => {
            const isHovered = hoveredIndex === i;
            const primaryColor = member.gradient[0];
            const secondaryColor = member.gradient[1];

            return (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  position: "relative",
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "28px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "32px 24px 72px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  width: "clamp(260px, 18vw, 300px)",
                  transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  boxShadow: isHovered
                    ? `0 20px 40px rgba(0,0,0,0.3), 0 0 20px ${primaryColor}22`
                    : "0 10px 30px rgba(0,0,0,0.1)",
                }}
              >
                {/* Profile Halo */}
                <div
                  style={{
                    position: "relative",
                    width: 120,
                    height: 120,
                    marginBottom: 24,
                  }}
                >
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.6, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                          position: "absolute",
                          inset: -10,
                          borderRadius: "50%",
                          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
                          zIndex: 0,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      padding: "4px",
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      zIndex: 1,
                      boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "3px solid var(--bg-primary)",
                      }}
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.4s ease",
                          transform: isHovered ? "scale(1.1)" : "scale(1)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Member Info */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                    <h3
                      style={{
                        fontSize: "clamp(16px, 1.8vw, 18px)",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {member.name}
                    </h3>
                  </div>
                  <div style={{ minHeight: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: "white",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        background: primaryColor,
                        padding: "4px 12px",
                        borderRadius: "100px",
                        boxShadow: `0 4px 12px ${primaryColor}44`,
                        display: "inline-block",
                      }}
                    >
                      {t(`team.member.${i + 1}.role` as any)}
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: "clamp(12px, 1.4vw, 13px)",
                    lineHeight: 1.5,
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  {t(`team.member.${i + 1}.desc` as any)}
                </p>

                {/* Floating Social Pill */}
                <motion.div
                  animate={{
                    y: isHovered ? 0 : 10,
                    opacity: isHovered ? 1 : 0,
                  }}
                  style={{
                    position: "absolute",
                    bottom: 24,
                    left: "50%",
                    x: "-50%",
                    display: "flex",
                    gap: 12,
                    padding: "6px 16px",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "100px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <a
                    href={member.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--text-secondary)", transition: "color 0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = primaryColor)}
                    onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                  >
                    <Facebook size={18} />
                  </a>
                  <a
                    href={member.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--text-secondary)", transition: "color 0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = primaryColor)}
                    onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                  >
                    <Linkedin size={18} />
                  </a>
                  <a
                    href={member.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--text-secondary)", transition: "color 0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = primaryColor)}
                    onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                  >
                    <Github size={18} />
                  </a>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (max-width: 1024px) {
          .team-grid {
             gap: 48px !important;
          }
          .team-card {
             margin-top: 0 !important;
          }
        }
        @media (max-width: 640px) {
          .team-grid {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            scrollbar-width: none;
            padding: 20px 0 40px !important;
            margin: 0 -24px !important;
            padding-left: 24px !important;
            padding-right: 24px !important;
            gap: 20px !important;
          }
          .team-grid > div {
            flex: 0 0 85% !important;
            scroll-snap-align: center !important;
            margin-top: 0 !important;
          }
          .team-grid::-webkit-scrollbar {
            display: none;
          }
        }
      `,
        }}
      />
    </AnimatedSection>
  );
}
