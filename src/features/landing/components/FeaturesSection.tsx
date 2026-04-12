"use client";

import { motion } from "framer-motion";
import { BookOpen, Film, HelpCircle } from "lucide-react";
import { AnimatedSection, fadeUp } from "./AnimatedSection";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Sách lịch sử sống động",
    desc: "Đọc những tác phẩm kinh điển về lịch sử Việt Nam, từ thời Hùng Vương đến ngày thống nhất.",
    gradient: ["#8B0000", "#D4A574"],
  },
  {
    icon: Film,
    title: "Tư liệu đa phương tiện",
    desc: "Hình ảnh, video, và âm thanh lịch sử hiện ngay khi bạn đọc đến đoạn văn liên quan.",
    gradient: ["#1B4332", "#52B788"],
  },
  {
    icon: HelpCircle,
    title: "Ôn tập qua quiz",
    desc: "Kiểm tra kiến thức lịch sử sau mỗi chương với câu hỏi trắc nghiệm thú vị.",
    gradient: ["#2C1810", "#C4956A"],
  },
];

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
          Đọc — Xem — Nghe — <span className="gradient-text">Ôn tập</span>
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
          Trải nghiệm học lịch sử hoàn toàn mới với công nghệ ebook đa phương tiện.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
