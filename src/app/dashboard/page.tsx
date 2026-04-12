"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Zap } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { label: "Books Read", value: "12", icon: BookOpen },
    { label: "Hours Logged", value: "48", icon: TrendingUp },
    { label: "Current Streak", value: "7 days", icon: Zap },
  ];

  return (
    <>
      <main
        style={{ minHeight: "100vh", padding: "100px 24px 60px", maxWidth: 1200, margin: "0 auto" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(32px, 5vw, 48px)",
              marginBottom: 8,
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32 }}>
            Here's your reading overview and quick actions.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-md)",
                  padding: 20,
                  boxShadow: "var(--shadow-card)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
                whileHover={{ transform: "translateY(-4px)", boxShadow: "var(--shadow-glow)" }}
              >
                <div
                  style={{
                    background: "var(--accent-glow)",
                    borderRadius: 12,
                    padding: 12,
                    display: "flex",
                  }}
                >
                  <Icon size={24} color="var(--accent-primary)" />
                </div>
                <div>
                  <p style={{ color: "var(--text-tertiary)", fontSize: 12, marginBottom: 4 }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Continue Reading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              background: "var(--bg-card)",
              borderRadius: "var(--radius-md)",
              padding: 24,
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Continue Reading</h3>
            <div
              style={{
                background: "var(--bg-tertiary)",
                borderRadius: 12,
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-tertiary)",
              }}
            >
              <p>No books in progress. Start a new adventure!</p>
            </div>
            <button
              style={{
                width: "100%",
                marginTop: 12,
                padding: 10,
                background: "var(--accent-gradient)",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Browse Library
            </button>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              background: "var(--bg-card)",
              borderRadius: "var(--radius-md)",
              padding: 24,
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>For You</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--bg-tertiary)",
                    borderRadius: 8,
                    padding: 12,
                    cursor: "pointer",
                    transition: "0.3s ease",
                  }}
                  className="hover:shadow-md"
                >
                  <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                    Recommended Book #{i}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    AI suggestion based on your interests
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <PageMountSignaler />
    </>
  );
}
