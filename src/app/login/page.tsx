"use client";

import { useState } from "react";
import { Mail, Lock, User, ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Auth will be wired up with better-auth when API keys are configured
    alert("Auth requires database setup. For the MVP demo, browse the library directly!");
  };

  return (
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
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {isSignUp
              ? "Start your literary journey"
              : "Continue your reading adventure"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {isSignUp && (
            <div style={{ position: "relative" }}>
              <User
                size={16}
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-tertiary)",
                }}
              />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 44px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
            </div>
          )}

          <div style={{ position: "relative" }}>
            <Mail
              size={16}
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-tertiary)",
              }}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px 14px 44px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <Lock
              size={16}
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-tertiary)",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px 14px 44px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: "100%",
              marginTop: 8,
              fontSize: 15,
              padding: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isSignUp ? "Create Account" : "Sign In"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 14,
            color: "var(--text-secondary)",
          }}
        >
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-secondary)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link
            href="/library"
            style={{
              fontSize: 13,
              color: "var(--text-tertiary)",
              textDecoration: "none",
            }}
          >
            Skip for now → Browse Library
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
