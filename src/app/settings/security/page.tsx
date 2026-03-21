"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import PageMountSignaler from "@/components/PageMountSignaler";
import { TransitionLink } from "@/components/TransitionLink";

export default function SecuritySettingsPage() {
  return (
    <>
      <main style={{ minHeight: "100vh", padding: "100px 24px 60px", maxWidth: 1000, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <TransitionLink href="/settings" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", textDecoration: "none", marginBottom: 24, fontSize: 14 }}>
            <ArrowLeft size={16} />
            Back to Settings
          </TransitionLink>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <Lock size={32} color="var(--accent-primary)" />
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 40px)", margin: 0 }}>
              Security
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32 }}>
            Manage passwords, active sessions, and configure two-factor authentication.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-md)",
            padding: 32,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Authentication</h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: 15 }}>
            Security options will go here...
          </p>
        </motion.div>
      </main>
      <PageMountSignaler />
    </>
  );
}
