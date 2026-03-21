"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Eye, Volume2, Lock } from "lucide-react";
import PageMountSignaler from "@/components/PageMountSignaler";

interface SettingsState {
  theme: "light" | "dark"; 
  fontSize: number;
  voiceSpeed: number;
  autoTTS: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    theme: "dark",
    fontSize: 16,
    voiceSpeed: 1,
    autoTTS: false,
  });

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    console.log(`Updated ${key}:`, value);
  };

  const settingSections = [
    { icon: User, title: "Account", description: "Profile, connected accounts, and privacy" },
    { icon: Eye, title: "Reader Preferences", description: "Font, line-height, and reading layout" },
    { icon: Volume2, title: "Voice & TTS", description: "Voice selection, speed, and auto-playback" },
    { icon: Lock, title: "Security", description: "Password, sessions, and 2FA" },
  ];

  return (
    <>
      <main style={{ minHeight: "100vh", padding: "100px 24px 60px", maxWidth: 1000, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(32px, 5vw, 48px)", marginBottom: 8 }}>
            Settings
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32 }}>
            Customize your reading experience and account preferences.
          </p>
        </motion.div>

        {/* Settings Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {settingSections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-md)",
                  padding: 24,
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "var(--accent-glow)", borderRadius: 10, padding: 8, display: "flex" }}>
                    <Icon size={20} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{section.title}</h3>
                    <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{section.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Preference Controls */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-md)",
            padding: 24,
            boxShadow: "var(--shadow-card)",
            marginTop: 24,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Quick Settings</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Font Size */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Font Size: {settings.fontSize}px</label>
              <input
                type="range"
                min="12"
                max="24"
                value={settings.fontSize}
                onChange={(e) => handleSettingChange("fontSize", parseInt(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            {/* Voice Speed */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Voice Speed: {settings.voiceSpeed.toFixed(1)}x</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.voiceSpeed}
                onChange={(e) => handleSettingChange("voiceSpeed", parseFloat(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Toggle Settings */}
          <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.autoTTS}
                onChange={(e) => handleSettingChange("autoTTS", e.target.checked)}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <span>Auto-play TTS when reading</span>
            </label>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} style={{ marginTop: 24, textAlign: "center" }}>
          <button
            style={{
              padding: "12px 32px",
              background: "var(--accent-gradient)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Save Changes
          </button>
        </motion.div>
      </main>
      <PageMountSignaler />
    </>
  );
}
