"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PlayCircle, Loader2 } from "lucide-react";
import { ELEVENLABS_VOICES } from "../constants";
import VoiceDropdown from "../components/VoiceDropdown";

export default function VoiceTTSTab() {
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
        body: JSON.stringify({ text: "Hi there! I am Fable, your AI Reading Companion. I hope you enjoy listening to me narrate your favorite books.", voiceId: val }),
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
