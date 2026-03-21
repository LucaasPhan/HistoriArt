"use client";

import { motion } from "framer-motion";

export default function SecurityTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section className="settings-section">
        <h2 className="settings-section-title">Security</h2>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>Authentication</h3>
        <p style={{ color: "var(--text-tertiary)", fontSize: 14 }}>
          Security options and session management will be available here.
        </p>
      </section>
    </motion.div>
  );
}
