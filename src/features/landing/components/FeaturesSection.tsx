"use client";

import { useTranslation } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { FEATURES } from "../constants";
import FeatureCarousel from "./FeatureCarousel";

export default function FeaturesSection() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoLoop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURES.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startAutoLoop();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoLoop]);

  const handleManualClick = (index: number) => {
    setActiveIndex(index);
    startAutoLoop(); // Resets the 5s window
  };

  return (
    <section
      id="features"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        background: "var(--bg-primary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        {/* Section Header (Centered above as requested) */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 800,
              marginBottom: 16,
              color: "var(--text-primary)",
            }}
          >
            {t("features.heading")}{" "}
            <span className="gradient-text">{t("features.headingAccent")}</span>
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "var(--text-secondary)",
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            {t("features.subtitle")}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "clamp(40px, 5vw, 80px)",
            alignItems: "center",
          }}
        >
          {/* Left: Mockup Interface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FeatureCarousel activeIndex={activeIndex} />
          </motion.div>

          {/* Right: Feature List */}
          <motion.div
            layout
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
              {/* Vertical Progress Line */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 2,
                  height: "100%",
                  background: "var(--border-subtle)",
                  opacity: 0.2,
                }}
              />

              {FEATURES.map((feature, i) => {
                const isActive = activeIndex === i;
                return (
                  <motion.div
                    key={i}
                    layout
                    onClick={() => handleManualClick(i)}
                    style={{
                      display: "flex",
                      gap: 20,
                      padding: "16px 0 16px 24px",
                      cursor: "pointer",
                      position: "relative",
                      transition: "opacity 0.4s ease, transform 0.4s ease",
                      opacity: isActive ? 1 : 0.35,
                      transform: isActive ? "translateX(8px)" : "translateX(0)",
                    }}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && (
                      <motion.div
                        layoutId="active-bar"
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: 3,
                          height: "100%",
                          background: "var(--accent-primary)",
                          boxShadow: "0 0 12px var(--accent-primary)",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        background: isActive ? "var(--accent-glow)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: isActive ? "var(--accent-primary)" : "var(--text-tertiary)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <feature.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          marginBottom: 4,
                          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                        }}
                      >
                        {t(`features.${i}.title` as any)}
                      </h3>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            style={{
                              fontSize: 14,
                              color: "var(--text-tertiary)",
                              lineHeight: 1.5,
                              maxWidth: 400,
                              overflow: "hidden",
                            }}
                          >
                            {t(`features.${i}.desc` as any)}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
