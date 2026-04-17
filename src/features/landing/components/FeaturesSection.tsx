"use client";

import { motion } from "framer-motion";
import { AnimatedSection, fadeUp } from "./AnimatedSection";
import { FEATURES } from "../const";

export default function FeaturesSection() {
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
          Đọc — Xem — Hỏi đáp — <span className="gradient-text">Ôn tập</span>
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
          Trải nghiệm học lịch sử hoàn toàn mới với công nghệ eBook đa phương tiện.
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
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
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
                background: `linear-gradient(135deg, ${f.gradient[0]}, ${f.gradient[1]})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <f.icon size={22} color="white" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>{f.title}</h3>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </AnimatedSection>
  );
}
