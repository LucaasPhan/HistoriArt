"use client";

import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import PageMountSignaler from "@/components/PageMountSignaler";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          position: "relative",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "fixed",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
            top: "10%",
            right: "10%",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass"
          style={{
            width: "100%",
            maxWidth: 440,
            borderRadius: "var(--radius-xl)",
            padding: "48px 40px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 36,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "var(--radius-lg)",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <BookOpen size={26} color="white" />
            </div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 28,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Welcome
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Sign in to continue your reading adventure
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <GoogleSignInButton />
          </div>
        </motion.div>
      </div>
      <PageMountSignaler />
    </>
  );
}
