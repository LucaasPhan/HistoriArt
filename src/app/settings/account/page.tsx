"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User } from "lucide-react";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
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
            firstName: json.firstName || "",
            lastName: json.lastName || "",
            age: json.age?.toString() || "",
            gender: json.gender || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const ageNum = parseInt(data.age, 10);
    if (!data.firstName.trim() || !data.lastName.trim() || isNaN(ageNum) || ageNum < 16 || ageNum > 99 || !data.gender) {
      setError("Please ensure all fields are valid.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          age: ageNum,
          gender: data.gender,
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile.");
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
        Loading profile...
      </div>
    );
  }

  const initials = (data.firstName[0] || "") + (data.lastName[0] || "");

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section className="settings-section">
        <h2 className="settings-section-title">Profile</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <div className="settings-form-group">
            <label className="settings-label">First name</label>
            <div className="settings-input-wrapper">
                <div className="settings-avatar-placeholder">{initials || <User size={16} />}</div>
                <input
                    type="text"
                    className="settings-input"
                    value={data.firstName}
                    onChange={(e) => setData({ ...data, firstName: e.target.value })}
                />
            </div>
          </div>
          
          <div className="settings-form-group">
            <label className="settings-label">Last name</label>
            <input
              type="text"
              className="settings-input"
              value={data.lastName}
              onChange={(e) => setData({ ...data, lastName: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="settings-form-group">
                <label className="settings-label">Age</label>
                <input
                    type="number"
                    className="settings-input"
                    value={data.age}
                    onChange={(e) => setData({ ...data, age: e.target.value })}
                />
                <p className="settings-hint">Must be between 16 and 99.</p>
            </div>

            <div className="settings-form-group">
                <label className="settings-label">Gender</label>
                <select 
                    className="settings-input" 
                    value={data.gender}
                    onChange={(e) => setData({ ...data, gender: e.target.value })}
                >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
            </div>
        </div>
      </section>

      <div className="settings-save-bar">
        <button
          onClick={handleSave}
          disabled={saving}
          className="settings-btn-primary"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {error && <span className="settings-status" style={{ color: "var(--status-error)" }}>{error}</span>}
        {success && <span className="settings-status" style={{ color: "var(--status-success)" }}>Profile saved!</span>}
      </div>
    </motion.div>
  );
}
