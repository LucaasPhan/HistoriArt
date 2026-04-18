"use client";

import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import PageMountSignaler from "@/components/PageMountSignaler";
import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  const { t } = useTranslation();

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
              {t("login.welcome")}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{t("login.subtitle")}</p>
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
