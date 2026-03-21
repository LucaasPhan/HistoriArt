"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, BookOpen, Settings, ChevronDown, Check, Volume2, PlayCircle, Loader2, Lock } from "lucide-react";
import PageMountSignaler from "@/components/PageMountSignaler";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "./settings.css";
import { ThemeButton } from "@/components/ThemeButton";
import { useAuth } from "@/context/AuthContext";

/* ── Constants ─────────────────────────────────────────────── */
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

const ELEVENLABS_VOICES = [
  { id: "DXFkLCBUTmvXpp2QwZjA", name: "Default System Voice" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (American, Calm)" },
  { id: "29vD33N1CtxCmqQRPOHJ", name: "Drew (American, News)" },
  { id: "2EiwWnXFnvU5JabPnv8n", name: "Clyde (American, War veteran)" },
  { id: "5Q0t7uMcjvnagumLfvZi", name: "Paul (American, News)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (American, Strong)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (American, Soft)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni (American, Well-rounded)" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie (Australian, Casual)" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George (British, Warm)" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum (American, Intense)" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda (American, Warm)" },
  { id: "bIHbv24MWmeRgasZH58o", name: "Will (American, Amiable)" },
  { id: "t0jbNlBVZ17f02VDIeMI", name: "Jessie (American, Conversational)" },
  { id: "flq6f7yk4E4fJM5XTYuZ", name: "Michael (American, Old)" },
];

const GENDER_OPTIONS = [
  { value: "", label: "Select gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

function GenderDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = GENDER_OPTIONS.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="settings-input"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", height: 46 }}
      >
        <span style={{ color: value ? "var(--text-primary)" : "var(--text-tertiary)" }}>
          {selected?.label || "Select gender"}
        </span>
        <ChevronDown size={16} style={{ color: "var(--text-secondary)", flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 10,
            overflow: "hidden",
            zIndex: 50,
            boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
          }}
        >
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                color: opt.value === "" ? "var(--text-tertiary)" : "var(--text-primary)",
                fontSize: 14,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {opt.label}
              {value === opt.value && <Check size={16} style={{ color: "var(--text-secondary)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── General Tab ───────────────────────────────────────────── */
function GeneralTab() {
  const [settings, setSettings] = useState({
    fontSize: 16,
    voiceSpeed: 1,
    autoTTS: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section className="settings-section">
        <h2 className="settings-section-title">General</h2>

        <div className="settings-form-group">
          <label className="settings-label">Appearance</label>
          <ThemeButton/>
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

/* ── Account Tab ───────────────────────────────────────────── */
function AccountTab() {
  const router = useRouter();
  const { user } = useAuth();
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
    if (!data.firstName.trim() || !data.lastName.trim() || isNaN(ageNum) || ageNum < 16 || ageNum > 99 || !data.gender) {
      setError("Please ensure all fields are valid.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    setSaving(true); setError(null); setSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: data.firstName.trim(), lastName: data.lastName.trim(), age: ageNum, gender: data.gender }),
      });
      if (!res.ok) throw new Error("Failed to save profile.");
      setSuccess(true); router.refresh(); setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: "40px 0", color: "var(--text-secondary)" }}>Loading profile...</div>;

  const initials = (data.firstName[0] || "") + (data.lastName[0] || "");

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section className="settings-section">
        <h2 className="settings-section-title">Profile</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <div className="settings-form-group">
            <label className="settings-label">First name</label>
            <div className="settings-input-wrapper">
              <div className="settings-avatar-placeholder">
                {user?.image ? (
                  <img src={user.image} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  initials || <User size={16} />
                )}
              </div>
              <input type="text" className="settings-input" value={data.firstName} onChange={(e) => setData({ ...data, firstName: e.target.value })} />
            </div>
          </div>
          <div className="settings-form-group">
            <label className="settings-label">Last name</label>
            <input type="text" className="settings-input" value={data.lastName} onChange={(e) => setData({ ...data, lastName: e.target.value })} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className="settings-form-group">
            <label className="settings-label">Age</label>
            <input type="number" className="settings-input" value={data.age} onChange={(e) => setData({ ...data, age: e.target.value })} />
            <p className="settings-hint">Must be between 16 and 99.</p>
          </div>
          <div className="settings-form-group">
            <label className="settings-label">Gender</label>
            <GenderDropdown value={data.gender} onChange={(v) => setData({ ...data, gender: v })} />
          </div>
        </div>
      </section>

      <div className="settings-save-bar">
        <button onClick={handleSave} disabled={saving} className="settings-btn-primary">
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {error && <span className="settings-status" style={{ color: "var(--status-error)" }}>{error}</span>}
        {success && <span className="settings-status" style={{ color: "var(--status-success)" }}>Profile saved!</span>}
      </div>
    </motion.div>
  );
}

/* ── Reader Preferences Tab ────────────────────────────────── */
function PreferencesTab() {
  const router = useRouter();
  const [data, setData] = useState({ purposeOfUse: "", customPurpose: "", communicationPreference: "" });
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
    setSaving(true); setError(null); setSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save preferences.");
      setSuccess(true); router.refresh(); setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: "40px 0", color: "var(--text-secondary)" }}>Loading preferences...</div>;

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

/* ── Voice & TTS Tab ───────────────────────────────────────── */
function VoiceTTSTab() {
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("elevenlabs_voice_id");
    if (saved) setSelectedVoice(saved);
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const playDemo = async (val: string) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src) URL.revokeObjectURL(audioRef.current.src);
    }

    if (!val) { setIsPlayingDemo(false); return; }
    
    setIsPlayingDemo(true);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Hi there! I am your AI Reading Companion. I hope you enjoy listening to me narrate your favorite books.", voiceId: val }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error("TTS failed");

      const audioData = await response.arrayBuffer();
      const audioUrl = URL.createObjectURL(new Blob([audioData], { type: "audio/mpeg" }));
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => { setIsPlayingDemo(false); URL.revokeObjectURL(audioUrl); };
      await audio.play();
    } catch (e) {
      if ((e as Error).name !== 'AbortError') { console.error("Demo failed", e); setIsPlayingDemo(false); }
    }
  };

  const handleVoiceChange = (val: string) => {
    setSelectedVoice(val);
    if (val) localStorage.setItem("elevenlabs_voice_id", val);
    else localStorage.removeItem("elevenlabs_voice_id");
    playDemo(val);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section className="settings-section">
        <h2 className="settings-section-title">Voice & TTS</h2>
        
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label className="settings-label" style={{ marginBottom: 0 }}>Agent Voice</label>
            {selectedVoice && (
              <button 
                onClick={() => playDemo(selectedVoice)}
                disabled={isPlayingDemo}
                style={{
                  background: "none", border: "none", color: "var(--accent-primary)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: isPlayingDemo ? "wait" : "pointer", opacity: isPlayingDemo ? 0.7 : 1,
                }}
              >
                {isPlayingDemo ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
                Test Voice
              </button>
            )}
          </div>
          <div style={{ position: "relative", zIndex: 10 }}>
            <VoiceDropdown value={selectedVoice} onChange={handleVoiceChange} options={ELEVENLABS_VOICES.map(v => ({ value: v.id, label: v.name }))} />
          </div>
          <p className="settings-hint">Changes the spoken voice of your AI companion across all books.</p>
        </div>
      </section>
    </motion.div>
  );
}

function VoiceDropdown({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="settings-input"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", height: 46 }}
      >
        <span style={{ color: value ? "var(--text-primary)" : "var(--text-tertiary)" }}>
          {selected?.label || "Select a voice"}
        </span>
        <ChevronDown size={16} style={{ color: "var(--text-secondary)", flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 10,
            overflow: "hidden",
            zIndex: 50,
            boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
            maxHeight: 300,
            overflowY: "auto",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                color: opt.value === "" ? "var(--text-tertiary)" : "var(--text-primary)",
                fontSize: 14,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {opt.label}
              {value === opt.value && <Check size={16} style={{ color: "var(--text-secondary)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Security Tab ──────────────────────────────────────────── */
function SecurityTab() {
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

/* ── Main Settings Page ────────────────────────────────────── */
export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <>
      <div className="settings-container">
        <Tabs defaultValue="general" orientation="vertical" style={{ display: "contents" }}>
          {/* ── Sidebar ── */}
          <aside className="settings-sidebar">
            <h1 className="settings-sidebar-title">Settings</h1>
            <TabsList style={{ display: "flex", flexDirection: "column", gap: 4, background: "transparent", border: "none", padding: 0, height: "auto", width: "100%", alignItems: "stretch" }}>
              <TabsTrigger value="general" className="settings-nav-item" style={{ justifyContent: "flex-start", border: "none" }}>
                <Settings size={18} style={{ marginRight: 12 }} />
                General
              </TabsTrigger>
              {user && (
                <>
                  <TabsTrigger value="account" className="settings-nav-item" style={{ justifyContent: "flex-start", border: "none" }}>
                    <User size={18} style={{ marginRight: 12 }} />
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="settings-nav-item" style={{ justifyContent: "flex-start", border: "none" }}>
                    <BookOpen size={18} style={{ marginRight: 12 }} />
                    Reader Preferences
                  </TabsTrigger>
                  <TabsTrigger value="voice-tts" className="settings-nav-item" style={{ justifyContent: "flex-start", border: "none" }}>
                    <Volume2 size={18} style={{ marginRight: 12 }} />
                    Voice & TTS
                  </TabsTrigger>
                  <TabsTrigger value="security" className="settings-nav-item" style={{ justifyContent: "flex-start", border: "none" }}>
                    <Lock size={18} style={{ marginRight: 12 }} />
                    Security
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </aside>

          {/* ── Main content ── */}
          <main className="settings-main">
            <TabsContent value="general" className="mt-0 outline-none">
              <GeneralTab />
            </TabsContent>
            {user && (
              <>
                <TabsContent value="account" className="mt-0 outline-none">
                  <AccountTab />
                </TabsContent>
                <TabsContent value="preferences" className="mt-0 outline-none">
                  <PreferencesTab />
                </TabsContent>
                <TabsContent value="voice-tts" className="mt-0 outline-none">
                  <VoiceTTSTab />
                </TabsContent>
                <TabsContent value="security" className="mt-0 outline-none">
                  <SecurityTab />
                </TabsContent>
              </>
            )}
          </main>
        </Tabs>
      </div>
      <PageMountSignaler />
    </>
  );
}
