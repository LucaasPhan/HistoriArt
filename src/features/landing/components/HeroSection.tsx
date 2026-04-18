"use client";

import { TransitionLink } from "@/components/TransitionLink";
import { useTranslation } from "@/lib/i18n";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, ChevronDown, Sparkles } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  const { t } = useTranslation();

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
        padding: "80px 24px",
        background: "var(--bg-primary)",
        gap: 0,
        overflow: "hidden",
      }}
    >
      {/* ─── Background Elements ─────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
        }}
      >
        <Image
          src="/assets/bg.jpeg"
          alt="Background"
          fill
          style={{ objectFit: "cover", opacity: 0.35 }}
          priority
        />
        {/* Gradient overlays to blend the image perfectly */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              linear-gradient(to bottom, var(--bg-primary) 0%, transparent 20%, transparent 80%, var(--bg-primary) 100%),
              radial-gradient(circle at center, transparent 0%, var(--bg-primary) 90%),
              radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)
            `,
            opacity: 0.9,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: "var(--radius-full)",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          fontSize: 14,
          color: "var(--accent-primary)",
          fontWeight: 600,
          marginBottom: 32,
          boxShadow: "var(--shadow-card)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Sparkles size={16} />
        {t("hero.badge")}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        style={{
          fontSize: "clamp(48px, 8vw, 92px)",
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
          maxWidth: 1000,
          color: "var(--text-primary)",
          marginBottom: 32,
          position: "relative",
          zIndex: 2,
        }}
      >
        {t("hero.titleLine1")}
        <br />
        <span className="gradient-text">{t("hero.titleLine2")}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          fontSize: "clamp(18px, 1.5vw, 22px)",
          lineHeight: 1.6,
          color: "var(--text-secondary)",
          maxWidth: 600,
          marginBottom: 48,
        }}
      >
        {t("hero.subtitle")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <TransitionLink href="/library">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
            style={{
              padding: "16px 40px",
              fontSize: 16,
              height: "auto",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <BookOpen size={20} />
            {t("hero.cta")}
            <ArrowRight size={20} />
          </motion.button>
        </TransitionLink>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
          }
          className="btn-ghost"
          style={{
            padding: "16px 40px",
            fontSize: 16,
            height: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {t("hero.learnMore")}
          <ChevronDown size={20} />
        </motion.button>
      </motion.div>

      {/* ─── Floating Decorative Elements ─────────── */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        style={{ position: "absolute", top: "20%", left: "10%", opacity: 0.6 }}
      >
        <Sparkles size={48} color="var(--accent-primary)" strokeWidth={1.5} />
      </motion.div>

      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: "25%", right: "12%", opacity: 0.4 }}
      >
        <BookOpen size={64} color="var(--accent-secondary)" strokeWidth={1} />
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 3, delay: 1 }}
        style={{ position: "absolute", top: "35%", right: "8%" }}
      >
        <Sparkles size={24} color="var(--accent-primary)" />
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        style={{ position: "absolute", bottom: "35%", left: "15%", opacity: 0.3 }}
      >
        <Sparkles size={32} color="var(--accent-secondary)" />
      </motion.div>
    </section>
  );
}
