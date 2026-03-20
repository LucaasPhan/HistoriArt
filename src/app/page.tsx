"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Mic, Sparkles, ArrowRight, Headphones, Brain } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax gradient orbs
    const handleMouseMove = (e: MouseEvent) => {
      const orbs = document.querySelectorAll<HTMLElement>(".float-orb");
      orbs.forEach((orb, i) => {
        const speed = (i + 1) * 0.02;
        const x = (e.clientX - window.innerWidth / 2) * speed;
        const y = (e.clientY - window.innerHeight / 2) * speed;
        orb.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* ─── Floating Background Orbs ─────────────────────── */}
      <div
        className="float-orb"
        style={{
          position: "fixed",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
          top: "-10%",
          right: "-10%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="float-orb"
        style={{
          position: "fixed",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
          bottom: "-15%",
          left: "-10%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="float-orb"
        style={{
          position: "fixed",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
          top: "50%",
          left: "30%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ─── Hero Section ─────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-subtle)",
              background: "rgba(139,92,246,0.08)",
              fontSize: 13,
              color: "var(--text-accent)",
              marginBottom: 32,
              fontWeight: 500,
            }}
          >
            <Sparkles size={14} />
            AI-Powered Reading Experience
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(42px, 7vw, 80px)",
              fontWeight: 700,
              lineHeight: 1.08,
              maxWidth: 800,
              margin: "0 auto 24px",
              letterSpacing: "-0.03em",
            }}
          >
            Read books with an{" "}
            <span className="gradient-text">AI companion</span> who truly
            understands
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "var(--text-secondary)",
              maxWidth: 560,
              margin: "0 auto 48px",
              lineHeight: 1.6,
            }}
          >
            Highlight passages. Ask questions. Explore characters. Your personal
            literary companion speaks with warmth and insight — like having a
            brilliant friend who&apos;s read every book.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
            }}
          >
            <Link href="/library">
              <button className="btn-primary" style={{ fontSize: 16, padding: "14px 32px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Start Reading
                  <ArrowRight size={18} />
                </span>
              </button>
            </Link>
            <button
              className="btn-ghost"
              style={{ fontSize: 16, padding: "14px 32px" }}
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              See How It Works
            </button>
          </div>
        </motion.div>

        {/* ─── Demo Preview ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          style={{
            marginTop: 72,
            width: "100%",
            maxWidth: 900,
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-card)",
            boxShadow: "0 20px 80px rgba(0,0,0,0.5), 0 0 60px rgba(139,92,246,0.1)",
          }}
        >
          {/* Mock reader header */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <BookOpen size={18} color="var(--accent-secondary)" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Harry Potter — Chapter 1
              </span>
            </div>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              Page 3 of 12
            </span>
          </div>

          {/* Mock content */}
          <div style={{ display: "flex", minHeight: 280 }}>
            <div
              style={{
                flex: 1,
                padding: "32px 36px",
                fontFamily: "var(--font-serif)",
                fontSize: 16,
                lineHeight: 1.9,
                color: "var(--text-secondary)",
              }}
            >
              <p style={{ marginBottom: 16 }}>
                &ldquo;Is it true, Dumbledore?&rdquo; Professor McGonagall asked, her voice
                trembling.{" "}
                <span
                  style={{
                    background: "rgba(139,92,246,0.2)",
                    borderRadius: 4,
                    padding: "2px 0",
                  }}
                >
                  &ldquo;They&apos;re saying that the Potters — James and Lily — that
                  they&apos;re... dead.&rdquo;
                </span>
              </p>
              <p style={{ color: "var(--text-tertiary)" }}>
                Dumbledore bowed his head. &ldquo;I&apos;m afraid so.&rdquo;
              </p>
            </div>

            {/* Mock AI sidebar */}
            <div
              style={{
                width: 280,
                borderLeft: "1px solid var(--border-subtle)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                AI Companion
              </div>
              <div
                className="chat-bubble-ai"
                style={{
                  padding: "12px 16px",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                This passage reveals how the magical community receives the
                devastating news. McGonagall&apos;s trembling voice shows that
                even the most composed characters are shaken... 💫
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "auto",
                }}
              >
                <div
                  className="voice-breathe"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "var(--accent-gradient)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Mic size={20} color="white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Features Section ─────────────────────────────── */}
      <section
        id="features"
        style={{
          padding: "100px 24px 120px",
          maxWidth: 1100,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            A new way to <span className="gradient-text">experience</span> books
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 17,
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            Three powerful modes for every kind of literary conversation.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {[
            {
              icon: <Brain size={24} />,
              title: "Deep Analysis",
              desc: "Ask why characters make decisions, explore themes, and get passage-backed explanations.",
              example: '"Why does Elizabeth reject Darcy?"',
              gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
            },
            {
              icon: <Headphones size={24} />,
              title: "Emotional Discussion",
              desc: "Talk about how the book makes you feel. Your AI companion responds with genuine warmth.",
              example: '"This scene made me so sad..."',
              gradient: "linear-gradient(135deg, #ec4899, #be185d)",
            },
            {
              icon: <Sparkles size={24} />,
              title: "Character Role-Play",
              desc: "Ask the AI to become any character from the book and have a conversation with them.",
              example: '"Pretend you\'re Wonka — show me the factory"',
              gradient: "linear-gradient(135deg, #f97316, #c2410c)",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass glass-hover"
              style={{
                padding: 32,
                borderRadius: "var(--radius-lg)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  background: feature.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                {feature.icon}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600 }}>{feature.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>
                {feature.desc}
              </p>
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: 13,
                  color: "var(--text-accent)",
                  fontStyle: "italic",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {feature.example}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────── */}
      <section
        style={{
          padding: "80px 24px 120px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass"
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "60px 40px",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 0 80px rgba(139,92,246,0.08)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 32,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Ready to read differently?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 16,
              marginBottom: 32,
              maxWidth: 400,
              margin: "0 auto 32px",
            }}
          >
            Start with Charlie and the Chocolate Factory or Harry Potter. Your AI
            companion is waiting.
          </p>
          <Link href="/library">
            <button className="btn-primary" style={{ fontSize: 16, padding: "14px 36px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Open Library
                <ArrowRight size={18} />
              </span>
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "32px 24px",
          textAlign: "center",
          color: "var(--text-tertiary)",
          fontSize: 13,
          position: "relative",
          zIndex: 1,
        }}
      >
        <p>
          Built with ❤️ for LotusHacks — LitCompanion © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
