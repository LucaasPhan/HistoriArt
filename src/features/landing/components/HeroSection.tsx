"use client";

import { TransitionLink } from "@/components/TransitionLink";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, ChevronDown, Sparkles } from "lucide-react";
import { fadeUp } from "./AnimatedSection";

export default function HeroSection() {
  return (
    <section
      style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "120px 24px 80px",
        gap: 32,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 16px",
          borderRadius: "var(--radius-full)",
          background: "var(--accent-glow)",
          border: "1px solid rgba(212, 110, 86, 0.15)",
          fontSize: 13,
          color: "var(--accent-primary)",
          fontWeight: 600,
        }}
      >
        <Sparkles size={14} />
        Nền tảng eBook lịch sử với đa phương tiện
      </motion.div>

      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
        style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          maxWidth: 800,
          color: "var(--text-primary)",
        }}
      >
        Lịch sử Việt Nam
        <br />
        <span className="gradient-text" style={{ fontSize: "inherit", fontWeight: "inherit" }}>
          qua trang sách sống động
        </span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
        style={{
          fontSize: "clamp(16px, 2vw, 20px)",
          lineHeight: 1.7,
          color: "var(--text-secondary)",
          maxWidth: 560,
        }}
      >
        Từ Bạch Đằng đến Điện Biên Phủ — đọc lịch sử với hình ảnh, phim tư liệu và âm nhạc chèn
        thẳng vào từng trang sách.
      </motion.p>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={2}
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <TransitionLink href="/library">
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
            style={{
              padding: "14px 32px",
              fontSize: 16,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderRadius: "var(--radius-full)",
            }}
          >
            <BookOpen size={18} />
            Bắt đầu đọc
            <ArrowRight size={16} />
          </motion.button>
        </TransitionLink>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() =>
            document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
          }
          className="btn-ghost"
          style={{
            padding: "14px 28px",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderRadius: "var(--radius-full)",
          }}
        >
          Tìm hiểu thêm
          <ChevronDown size={16} />
        </motion.button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ position: "absolute", bottom: 32 }}
      >
        <ChevronDown size={24} color="var(--text-tertiary)" />
      </motion.div>
    </section>
  );
}
