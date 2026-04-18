"use client";

import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <section
      style={{
        padding: "100px 24px",
        background: "var(--bg-secondary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 64,
          alignItems: "center",
        }}
      >
        {/* Left: Content Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--accent-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 16,
              display: "block",
            }}
          >
            About HistoriArt
          </span>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: 24,
              color: "var(--text-primary)",
            }}
          >
            {t("about.heading")} <span className="gradient-text">{t("about.headingAccent")}.</span>
          </h2>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              marginBottom: 32,
            }}
          >
            {t("about.subtitle")}
          </p>
          <motion.div
            whileHover={{ y: -5, boxShadow: "var(--shadow-glow)" }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(12px)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "var(--shadow-lg)",
              maxWidth: 450,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-primary)",
                }}
              >
                <BookOpen size={24} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {t("about.libraryTitle")}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>
                  {t("about.libraryDesc")}
                </div>
              </div>
            </div>
            <button
              style={{
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 700,
                background: "var(--accent-primary)",
                color: "white",
                borderRadius: "var(--radius-full)",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {t("about.explore")} <ArrowRight size={14} />
            </button>
          </motion.div>
        </motion.div>

        {/* Right: Visual Asset */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ position: "relative", width: "100%", aspectRatio: "1/1" }}
        >
          <div
            style={{
              position: "absolute",
              inset: 20,
              borderRadius: "var(--radius-lg)",
              zIndex: 0,
            }}
          />
          <Image
            src="/assets/about_visual.png"
            alt="About HistoriArt"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            style={{ objectFit: "cover", borderRadius: "var(--radius-lg)", zIndex: 1 }}
          />
        </motion.div>
      </div>
    </section>
  );
}
