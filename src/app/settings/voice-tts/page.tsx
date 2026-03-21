"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, PlayCircle, Loader2 } from "lucide-react";
import PageMountSignaler from "@/components/PageMountSignaler";
import { TransitionLink } from "@/components/TransitionLink";

const ELEVENLABS_VOICES = [
  { id: "DXFkLCBUTmvXpp2QwZjA", name: "Default System Voice" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (American, Calm)" },
  { id: "29vD33N1CtxCmqQRPOHJ", name: "Drew (American, News)" },
  { id: "2EiwWnXFnvU5JabPnv8n", name: "Clyde (American, War veteran)" },
  { id: "5Q0t7uMcjvnagumLfvZi", name: "Paul (American, News)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (American, Strong)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (American, Soft)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni (American, Well-rounded)" },
  { id: "GBv7mTIG0tZiw28qcsK0", name: "Thomas (American, Calm)" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie (Australian, Casual)" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George (British, Warm)" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum (American, Intense)" },
  { id: "TX3OmfUUyONuoOD5E0U4", name: "Liam (American, Articulate)" },
  { id: "XB0fDUnXU5powwaWeTys", name: "Charlotte (Swedish, Seductive)" },
  { id: "Xb7hH8MSALEjdA0p0tE0", name: "Alice (British, News)" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda (American, Warm)" },
  { id: "bIHbv24MWmeRgasZH58o", name: "Will (American, Amiable)" },
  { id: "jsCqWAovK2MfzaZyTZEJ", name: "Freya (American, Over-hyped)" },
  { id: "t0jbNlBVZ17f02VDIeMI", name: "Jessie (American, Conversational)" },
  { id: "flq6f7yk4E4fJM5XTYuZ", name: "Michael (American, Old)" },
];

export default function VoiceTTSPage() {
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("elevenlabs_voice_id");
    if (saved) {
      setSelectedVoice(saved);
    }
    
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const playDemo = async (val: string) => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src) URL.revokeObjectURL(audioRef.current.src);
    }

    if (!val) {
        setIsPlayingDemo(false);
        return;
    }
    
    setIsPlayingDemo(true);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: "Hi there! I am your AI Reading Companion. I hope you enjoy listening to me narrate your favorite books.",
          voiceId: val 
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error("TTS failed");

      const audioData = await response.arrayBuffer();
      const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlayingDemo(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
         console.error("Demo failed", e);
         setIsPlayingDemo(false);
      }
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedVoice(val);
    if (val) {
      localStorage.setItem("elevenlabs_voice_id", val);
    } else {
      localStorage.removeItem("elevenlabs_voice_id");
    }
    
    playDemo(val);
  };

  return (
    <>
      <main style={{ minHeight: "100vh", padding: "100px 24px 60px", maxWidth: 1000, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <TransitionLink href="/settings" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", textDecoration: "none", marginBottom: 24, fontSize: 14 }}>
            <ArrowLeft size={16} />
            Back to Settings
          </TransitionLink>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <Volume2 size={32} color="var(--accent-primary)" />
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 40px)", margin: 0 }}>
              Voice & TTS
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32 }}>
            Adjust voice selection, reading speed, and auto-playback settings.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-md)",
            padding: 32,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Agent Personalisation</h2>
          
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>
                Reading Voice
              </label>
              
              {selectedVoice && (
                <button 
                  onClick={() => playDemo(selectedVoice)}
                  disabled={isPlayingDemo}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: isPlayingDemo ? "wait" : "pointer",
                    opacity: isPlayingDemo ? 0.7 : 1,
                  }}
                >
                  {isPlayingDemo ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
                  Test Voice
                </button>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <select
                value={selectedVoice}
                onChange={handleVoiceChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: 15,
                  appearance: "none",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {ELEVENLABS_VOICES.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
              <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5 }}>
                ▼
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 8 }}>
              Changes the spoken voice of your AI companion across all books.
            </p>
          </div>
        </motion.div>
      </main>
      <PageMountSignaler />
    </>
  );
}
