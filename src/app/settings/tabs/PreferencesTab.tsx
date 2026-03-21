"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function PreferencesTab() {
  const router = useRouter();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section className="settings-section" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(212,110,86,0.08)", padding: "16px 20px", borderRadius: 12, border: "1px solid var(--accent-primary)" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--accent-primary)", margin: "0 0 4px" }}>Reconfigure Onboarding</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>Retake the onboarding questionnaire to update your personality and reading goals.</p>
          </div>
          <button
            onClick={() => router.push("/onboarding?step=1")}
            style={{ padding: "8px 16px", background: "var(--accent-primary)", color: "white", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Start Questionnaire
          </button>
        </div>
      </section>
    </motion.div>
  );
}
