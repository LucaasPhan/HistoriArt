"use client";

import { useTranslation } from "@/lib/i18n";
import { BookOpen, Github, Mail, Twitter } from "lucide-react";
import { TransitionLink } from "@/components/TransitionLink";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{ position: "relative", zIndex: 1, background: "var(--bg-primary)" }}>
      {/* ─── CTA Banner ────────────────────────────── */}
      {/* <div style={{ padding: "0 24px 80px" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            background: "var(--accent-gradient)",
            borderRadius: "var(--radius-xl)",
            padding: "80px 40px",
            textAlign: "center",
            color: "white",
            position: "relative",
            overflow: "hidden",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50%",
              left: "-10%",
              width: "40%",
              height: "200%",
              background: "rgba(255,255,255,0.1)",
              transform: "rotate(15deg)",
              filter: "blur(40px)",
            }}
          />
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 800,
              marginBottom: 16,
              position: "relative",
            }}
          >
            Let's Explore History Together
          </h2>
          <p
            style={{
              fontSize: 18,
              opacity: 0.9,
              maxWidth: 500,
              margin: "0 auto 32px",
              position: "relative",
            }}
          >
            Join thousands of readers discovering the rich narratives of the past in an entirely new
            way.
          </p>
          <TransitionLink href="/login">
            <button
              style={{
                background: "white",
                color: "var(--accent-primary)",
                padding: "16px 40px",
                borderRadius: "var(--radius-full)",
                border: "none",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              Sign Up Now
            </button>
          </TransitionLink>
        </div>
      </div> */}

      {/* ─── Link Columns ────────────────────────────── */}
      {/* <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 48,
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ gridColumn: "span 1.5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-md)",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOpen size={18} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
              Histori<span className="gradient-text">Art</span>
            </span>
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              maxWidth: 240,
              marginBottom: 24,
            }}
          >
            Bringing history to life through immersive multimedia and AI-powered storytelling.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <Twitter size={20} color="var(--text-tertiary)" style={{ cursor: "pointer" }} />
            <Github size={20} color="var(--text-tertiary)" style={{ cursor: "pointer" }} />
            <Mail size={20} color="var(--text-tertiary)" style={{ cursor: "pointer" }} />
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Information</h4>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <li style={{ fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}>About Us</li>
            <li style={{ fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}>The Team</li>
            <li style={{ fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}>Contact</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Features</h4>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <li style={{ fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}>Library</li>
            <li style={{ fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}>Fable AI</li>
            <li style={{ fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}>Interactive Media</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Support</h4>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <li style={{ fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}>Help Center</li>
            <li style={{ fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}>Privacy Policy</li>
            <li style={{ fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}>Terms of Service</li>
          </ul>
        </div>
      </div> */}

      <div
        style={{
          textAlign: "center",
          padding: "40px 24px",
          borderTop: "1px solid var(--border-subtle)",
          color: "var(--text-tertiary)",
          fontSize: 12,
        }}
      >
        <p>HistoriArt © {new Date().getFullYear()} — Building the future of historical learning.</p>
      </div>
    </footer>
  );
}
