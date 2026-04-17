"use client";

import { useTranslation } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { motion } from "framer-motion";
import { AnimatedSection, fadeUp } from "./AnimatedSection";
import { FEATURE_GRADIENTS, FEATURE_ICONS } from "../constants";

export default function FeaturesSection() {
  const { t } = useTranslation();

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
      <div id="features" style={{ scrollMarginTop: 80 }} />
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {t("features.heading")} <span className="gradient-text">{t("features.headingAccent")}</span>
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 16,
            marginTop: 12,
            maxWidth: 500,
            margin: "12px auto 0",
          }}
        >
          {t("features.subtitle")}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {FEATURE_ICONS.map((Icon, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i}
            whileHover={{ y: -4, boxShadow: "var(--shadow-glow)" }}
            style={{
              flex: "1 1 280px",
              maxWidth: 320,
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              transition: "box-shadow 0.3s, transform 0.3s",
              cursor: "default",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius-md)",
                background: `linear-gradient(135deg, ${FEATURE_GRADIENTS[i][0]}, ${FEATURE_GRADIENTS[i][1]})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={22} color="white" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>
              {t(`features.${i}.title` as TranslationKey)}
            </h3>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              {t(`features.${i}.desc` as TranslationKey)}
            </p>
          </motion.div>
        ))}
      </div>
    </AnimatedSection>
  );
}
