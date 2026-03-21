"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const PURPOSES = [
  { value: "curiosity", label: "Curiosity", emoji: "🧐", description: "Learning for the sake of it." },
  { value: "career", label: "Career Growth", emoji: "🚀", description: "Advancing my professional path." },
  { value: "exam", label: "Exam Prep", emoji: "📚", description: "Studying for a specific goal." },
  { value: "hobby", label: "New Hobby", emoji: "🎨", description: "Exploring a personal interest." },
  { value: "other", label: "Something else", emoji: "✨", description: "I have my own reasons." },
];

const COMM_PREFS = [
  { value: "concise", label: "Clear & Concise", description: "Get straight to the point." },
  { value: "detailed", label: "Detailed & Exploratory", description: "Dive deep into every concept." },
  { value: "analogies", label: "Rich in Analogies", description: "Use stories to explain stuff." },
  { value: "socratic", label: "Socratic Method", description: "Guide me with questions." },
];

export default function ReaderPreferencesPage() {
  const router = useRouter();
  const [data, setData] = useState({
    purposeOfUse: "",
    customPurpose: "",
    communicationPreference: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json && !json.error) {
          setData({
            purposeOfUse: json.purposeOfUse || "",
            customPurpose: json.customPurpose || "",
            communicationPreference: json.communicationPreference || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save preferences.");
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 0", color: "var(--text-secondary)" }}>
        Loading preferences...
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section className="settings-section">
        <h2 className="settings-section-title">Reading Goals</h2>
        
        <div className="settings-form-group">
            <label className="settings-label">What best describes your purpose?</label>
            <select 
                className="settings-input"
                value={data.purposeOfUse}
                onChange={(e) => setData({ ...data, purposeOfUse: e.target.value })}
            >
                <option value="">Select a purpose</option>
                {PURPOSES.map(p => (
                    <option key={p.value} value={p.value}>{p.emoji} {p.label}</option>
                ))}
            </select>
        </div>

        {data.purposeOfUse === "other" && (
            <div className="settings-form-group">
                <label className="settings-label">Please specify</label>
                <input
                    type="text"
                    className="settings-input"
                    placeholder="e.g. Critical analysis, speed reading practice..."
                    value={data.customPurpose}
                    onChange={(e) => setData({ ...data, customPurpose: e.target.value })}
                />
            </div>
        )}

        <div className="settings-form-group" style={{ marginTop: 32 }}>
            <label className="settings-label">What personal preferences should LitCompanion consider in responses?</label>
            <p className="settings-hint" style={{ marginBottom: 12 }}>Your preferences will apply to all conversations with books.</p>
            <textarea
                className="settings-input settings-textarea"
                placeholder="e.g. when learning new concepts, I find analogies particularly helpful. Keep explanations concise."
                value={data.customPurpose && data.purposeOfUse !== 'other' ? data.customPurpose : ""}
                onChange={(e) => {
                    if (data.purposeOfUse !== 'other') {
                        setData({ ...data, customPurpose: e.target.value });
                    }
                }}
            />
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section-title">Communication Style</h2>
        <div className="settings-form-group">
            <label className="settings-label">How do you like to talk?</label>
            <div className="scs-list" style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COMM_PREFS.map((c) => {
                const active = data.communicationPreference === c.value;
                return (
                  <div
                    key={c.value}
                    className={`scs-card${active ? " scs-card--active" : ""}`}
                    style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        borderColor: active ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        padding: '15px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                    onClick={() => setData({ ...data, communicationPreference: c.value })}
                  >
                    <div className="scs-text">
                      <p className="scs-label" style={{ fontWeight: 500, color: active ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{c.label}</p>
                      <p className="scs-desc" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      </section>

      <div className="settings-save-bar">
        <button
          onClick={handleSave}
          disabled={saving}
          className="settings-btn-primary"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
        {error && <span className="settings-status" style={{ color: "var(--status-error)" }}>{error}</span>}
        {success && <span className="settings-status" style={{ color: "var(--status-success)" }}>Preferences saved!</span>}
      </div>
    </motion.div>
  );
}
