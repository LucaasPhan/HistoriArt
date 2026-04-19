"use client";

import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountTab() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState({ firstName: "", lastName: "", age: "", gender: "" });
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
    if (
      !data.firstName.trim() ||
      !data.lastName.trim() ||
      isNaN(ageNum) ||
      ageNum < 12 ||
      ageNum > 99 ||
      !data.gender
    ) {
      setError(t("settings.validationError"));
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
      if (!res.ok) throw new Error(t("settings.failedSave"));
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div style={{ padding: "40px 0", color: "var(--text-secondary)" }}>
        {t("settings.loadingProfile")}
      </div>
    );

  const initials = (data.firstName[0] || "") + (data.lastName[0] || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <section className="settings-section">
        <h2 className="settings-section-title">{t("settings.profile")}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <div className="settings-form-group">
            <label className="settings-label">{t("settings.firstName")}</label>
            <div className="settings-input-wrapper">
              <div className="settings-avatar-placeholder">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt="Avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  initials || <User size={16} />
                )}
              </div>
              <input
                type="text"
                className="settings-input"
                value={data.firstName}
                onChange={(e) => setData({ ...data, firstName: e.target.value })}
              />
            </div>
          </div>
          <div className="settings-form-group">
            <label className="settings-label">{t("settings.lastName")}</label>
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
            <label className="settings-label">{t("settings.age")}</label>
            <input
              type="number"
              className="settings-input"
              value={data.age}
              onChange={(e) => setData({ ...data, age: e.target.value })}
            />
            <p className="settings-hint">{t("settings.ageHint")}</p>
          </div>
          <div className="settings-form-group">
            <label className="settings-label">{t("settings.gender")}</label>
            <select
              className="settings-input"
              value={data.gender}
              onChange={(e) => setData({ ...data, gender: e.target.value })}
            >
              <option value="">{t("settings.genderSelect")}</option>
              <option value="male">{t("settings.genderMale")}</option>
              <option value="female">{t("settings.genderFemale")}</option>
              <option value="non-binary">{t("settings.genderNonBinary")}</option>
              <option value="prefer-not-to-say">{t("settings.genderPreferNot")}</option>
            </select>
          </div>
        </div>
      </section>

      <div className="settings-save-bar">
        <button onClick={handleSave} disabled={saving} className="settings-btn-primary">
          {saving ? t("settings.saving") : t("settings.saveProfile")}
        </button>
        {error && (
          <span className="settings-status" style={{ color: "var(--status-error)" }}>
            {error}
          </span>
        )}
        {success && (
          <span className="settings-status" style={{ color: "var(--status-success)" }}>
            {t("settings.profileSaved")}
          </span>
        )}
      </div>
    </motion.div>
  );
}
