"use client";

import { ThemeButton } from "@/components/ThemeButton";
import { motion } from "framer-motion";
import { useState } from "react";

export default function GeneralTab() {
  const [settings, setSettings] = useState({
    fontSize: 16,
    voiceSpeed: 1,
    autoTTS: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <section className="settings-section">
        <h2 className="settings-section-title">General</h2>

        <div className="settings-form-group">
          <label className="settings-label">Appearance</label>
          <ThemeButton />
          <p className="settings-hint">Choose how HistoriArt looks to you.</p>
        </div>

        <div className="settings-form-group" style={{ marginTop: 32 }}>
          <label className="settings-label">Font Size: {settings.fontSize}px</label>
          <input
            type="range"
            min="12"
            max="24"
            value={settings.fontSize}
            onChange={(e) => handleSettingChange("fontSize", parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "var(--accent-primary)" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Small</span>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Large</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
