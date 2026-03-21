"use client";

import { useState } from "react";
import { motion } from "framer-motion";

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
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section className="settings-section">
        <h2 className="settings-section-title">General</h2>
        
        <div className="settings-form-group">
            <label className="settings-label">Appearance</label>
            <select 
                className="settings-input"
                value={settings.theme}
                onChange={(e) => handleSettingChange("theme", e.target.value as any)}
            >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
            </select>
            <p className="settings-hint">Choose how LitCompanion looks to you.</p>
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

      <section className="settings-section">
        <h2 className="settings-section-title">Reading Experience</h2>
        <div className="settings-toggle-group">
            <div className="settings-toggle-label-wrap">
                <span className="settings-toggle-title">Auto-play TTS</span>
                <span className="settings-toggle-desc">Automatically start text-to-speech when opening a new page.</span>
            </div>
            <label className="settings-switch">
                <input 
                    type="checkbox" 
                    checked={settings.autoTTS}
                    onChange={(e) => handleSettingChange("autoTTS", e.target.checked)}
                />
                <span className="settings-slider"></span>
            </label>
        </div>

        <div className="settings-form-group" style={{ marginTop: 24 }}>
            <label className="settings-label">Voice Speed: {settings.voiceSpeed.toFixed(1)}x</label>
            <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.voiceSpeed}
                onChange={(e) => handleSettingChange("voiceSpeed", parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-primary)" }}
            />
        </div>
      </section>
    </motion.div>
  );
}
