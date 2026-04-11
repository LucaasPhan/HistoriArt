"use client";

import { motion } from "framer-motion";

export default function PreferencesTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section className="settings-section" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(212,110,86,0.08)", padding: "16px 20px", borderRadius: 12, border: "1px solid var(--accent-primary)" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--accent-primary)", margin: "0 0 4px" }}>Tùy chỉnh đọc sách</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>Cài đặt trải nghiệm đọc sách theo ý bạn.</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
