"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Mic, Send, ArrowLeft, ChevronLeft, ChevronRight,
  BookOpen, MessageCircle, X, Sparkles, Volume2, Copy, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { SAMPLE_BOOKS } from "@/lib/sample-books";
import type { ConversationMode } from "@/lib/prompts";
import { TransitionLink } from "@/components/TransitionLink";
import PageMountSignaler from "@/components/PageMountSignaler";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

type InteractionMode = "chat" | "voice";

// ─── Mode Switch Button ───────────────────────────────────────────────────────
function ModeSwitchButton({
  mode,
  onChange,
}: {
  mode: InteractionMode;
  onChange: (m: InteractionMode) => void;
}) {
  const isVoice = mode === "voice";
  return (
    <button
      onClick={() => onChange(isVoice ? "chat" : "voice")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 18px",
        borderRadius: "var(--radius-full)",
        border: "1.5px solid var(--border-subtle)",
        background: "var(--bg-tertiary)",
        color: "var(--text-secondary)",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.2s, color 0.2s, border-color 0.2s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-primary)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
      }}
    >
      {isVoice ? <MessageCircle size={14} /> : <Mic size={14} />}
      Switch to {isVoice ? "Chat" : "Voice"}
    </button>
  );
}

// ─── Typewriter Component ─────────────────────────────────────────────────────
function TypewriterText({ 
  text, 
  messageIndex, 
  finishedRef, 
  onUpdate 
}: { 
  text: string; 
  messageIndex: number; 
  finishedRef: React.RefObject<Set<number> | null>; 
  onUpdate: () => void; 
}) {
  const [displayedText, setDisplayedText] = useState(finishedRef.current?.has(messageIndex) ? text : "");

  useEffect(() => {
    if (finishedRef.current!.has(messageIndex)) {
      setDisplayedText(text);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      onUpdate();
      if (i >= text.length) {
        clearInterval(interval);
        finishedRef.current!.add(messageIndex);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [text, messageIndex, finishedRef, onUpdate]);

  return <span>{displayedText}</span>;
}



// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReaderPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const sampleBook = SAMPLE_BOOKS.find((b) => b.id === bookId);

  const [currentPage, setCurrentPage] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionCoords, setSelectionCoords] = useState<{ x: number; y: number } | null>(null);
  const [showCopied, setShowCopied] = useState(false);
  const [mode] = useState<ConversationMode>("buddy");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [pageDirection, setPageDirection] = useState<"next" | "prev">("next");

  // Dynamic book state (for Gutenberg books)
  const [dynamicContent, setDynamicContent] = useState<string>("");
  const [dynamicTotalPages, setDynamicTotalPages] = useState<number>(0);
  const [dynamicBookTitle, setDynamicBookTitle] = useState<string>("");
  const [pageLoading, setPageLoading] = useState(false);

  // ── NEW: interaction mode toggle ──────────────────────────────────────────
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("chat");

  const chatEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const typewriterFinishedRef = useRef<Set<number>>(new Set());

  const isDynamic = !sampleBook;
  const totalPages = sampleBook ? sampleBook.totalPages : dynamicTotalPages;
  const content = sampleBook ? (sampleBook.pages[currentPage] || "Content not available.") : dynamicContent;
  const bookTitle = sampleBook ? sampleBook.title : dynamicBookTitle;

  // Fetch page content for dynamic books
  useEffect(() => {
    if (!isDynamic) return;

    setPageLoading(true);
    fetch(`/api/books/${bookId}/pages?page=${currentPage}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.content) {
          setDynamicContent(data.content);
          setDynamicTotalPages(data.totalPages);
        }
      })
      .catch(() => setDynamicContent("Failed to load page content."))
      .finally(() => setPageLoading(false));
  }, [bookId, currentPage, isDynamic]);

  // Fetch book title for dynamic books
  useEffect(() => {
    if (!isDynamic) return;

    fetch(`/api/books`)
      .then((r) => r.json())
      .then((data) => {
        const found = data.books?.find((b: { id: string }) => b.id === bookId);
        if (found) setDynamicBookTitle(found.title);
      })
      .catch(() => {});
  }, [bookId, isDynamic]);

  // ── When switching away from voice, stop any active recognition & TTS ────
  useEffect(() => {
    if (interactionMode === "chat") {
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
      window.speechSynthesis.cancel();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setIsSpeaking(false);
    }
  }, [interactionMode, isListening]);

  // ─── Text-to-Speech ────────────────────────────────────────────────────────
  const fallbackBrowserTTS = useCallback((text: string) => {
    if (!window.speechSynthesis) { setIsSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const speakText = useCallback(async (text: string) => {
    // Only speak aloud in voice mode
    if (interactionMode === "chat") return;

    setIsSpeaking(true);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 500) }),
      });
      if (!response.ok) throw new Error("TTS failed");

      const audioData = await response.arrayBuffer();
      const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(audioUrl); };
      audio.onerror = () => { URL.revokeObjectURL(audioUrl); fallbackBrowserTTS(text); };
      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      fallbackBrowserTTS(text);
    }
  }, [fallbackBrowserTTS, interactionMode]);

  // ─── Send Message ──────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          bookId,
          currentPage,
          highlightedText: selectedText || undefined,
          mode,
          conversationHistory: messages.slice(-8),
        }),
      });

      const data = await response.json();

      if (data.navigation === "next" && currentPage < totalPages) {
        setPageDirection("next"); setCurrentPage((p) => p + 1);
      } else if (data.navigation === "prev" && currentPage > 1) {
        setPageDirection("prev"); setCurrentPage((p) => p - 1);
      }

      const aiMsg: ChatMessage = {
        role: "assistant",
        content: data.response || data.error || "Sorry, I couldn't process that.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(aiMsg.content);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again.", timestamp: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [bookId, currentPage, input, isLoading, messages, mode, selectedText, speakText, totalPages]);

  // ─── Speech Recognition ────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          handleSendMessage(event.results[i][0].transcript);
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
    };
    recognition.onend = () => { setIsListening(false); setInterimTranscript(""); };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setChatOpen(true);
  }, [handleSendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleVoice = useCallback(() => {
    if (isListening) stopListening(); else startListening();
  }, [isListening, startListening, stopListening]);

  // ─── Reader Utilities ──────────────────────────────────────────────────────
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 2) {
      setSelectedText(text);
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setSelectionCoords({ x: rect.left + rect.width / 2, y: rect.top - 50 });
      }
    } else {
      setSelectionCoords(null);
    }
  }, []);

  const copyToClipboard = useCallback(() => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      setShowCopied(true);
      setTimeout(() => { setShowCopied(false); setSelectionCoords(null); }, 1000);
    }
  }, [selectedText]);

  const handleDoubleClick = useCallback(() => {
    const selection = window.getSelection()?.toString().trim();
    if (selection) navigator.clipboard.writeText(selection);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" && currentPage < totalPages) { setPageDirection("next"); setCurrentPage((p) => p + 1); }
      if (e.key === "ArrowLeft" && currentPage > 1) { setPageDirection("prev"); setCurrentPage((p) => p - 1); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPage, totalPages]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, interimTranscript]);

  if (!sampleBook && !isDynamic) return null;

  return (
    <>
      <div style={{ minHeight: "100vh", display: "flex", position: "relative" }}>

        {/* Selection Tooltip */}
        <AnimatePresence>
          {selectionCoords && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              style={{ position: "fixed", left: selectionCoords.x, top: selectionCoords.y, transform: "translateX(-50%)", zIndex: 100 }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); copyToClipboard(); }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-lg)", color: "var(--text-primary)", fontSize: 13, fontWeight: 500, cursor: "pointer", backdropFilter: "blur(12px)" }}
              >
                {showCopied ? <><Check size={14} color="#10b981" /><span>Copied!</span></> : <><Copy size={14} /><span>Copy to Clipboard</span></>}
              </button>
              <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 12, height: 12, background: "var(--bg-secondary)", borderRight: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Reader Panel ──────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            minHeight: "100vh",
            transition: "margin-right 0.4s cubic-bezier(0.4,0,0.2,1)",
            marginRight: chatOpen ? 380 : 0,
          }}
        >
          {/* Side nav zones */}
          <button onClick={() => { if (currentPage > 1) { setPageDirection("prev"); setCurrentPage(p => p - 1); } }} className={`nav-zone nav-zone-left ${currentPage <= 1 ? "disabled" : ""}`} aria-label="Previous Page">
            <ChevronLeft size={48} style={{ opacity: 0.4 }} />
          </button>
          <button onClick={() => { if (currentPage < totalPages) { setPageDirection("next"); setCurrentPage(p => p + 1); } }} className={`nav-zone nav-zone-right ${currentPage >= totalPages ? "disabled" : ""}`} style={{ right: chatOpen ? 380 : 0 }} aria-label="Next Page">
            <ChevronRight size={48} style={{ opacity: 0.4 }} />
          </button>

          {/* Top bar */}
          <div
            className="nav-glass"
            style={{ position: "sticky", top: 0, zIndex: 999, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <TransitionLink href="/library">
                <button className="btn-ghost" style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 4 }}>
                  <ArrowLeft size={16} />Library
                </button>
              </TransitionLink>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{bookTitle || "Loading..."}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                Page {currentPage} of {totalPages}
              </span>

              {!chatOpen && (
                <button
                  className="btn-ghost"
                  onClick={() => setChatOpen(true)}
                  style={{ padding: "6px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
                >
                  <MessageCircle size={14} />
                  AI Chat
                </button>
              )}
            </div>
          </div>

          {/* Book content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: pageDirection === "next" ? 60 : -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: pageDirection === "next" ? -60 : 60 }}
                transition={{ duration: 0.35 }}
                className="glass"
                style={{ maxWidth: 700, width: "100%", borderRadius: "var(--radius-xl)", padding: "48px 52px", minHeight: 400 }}
                onMouseUp={handleTextSelection}
                onDoubleClick={handleDoubleClick}
              >
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24, fontWeight: 600 }}>
                  Page {currentPage}
                </div>
                <div className="reading-text">
                  {content.split("\n\n").map((paragraph, i) => (
                    <p key={i} style={{ marginBottom: 20, textIndent: i > 0 ? "2em" : 0 }}>{paragraph}</p>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Page dots */}
            <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: 32 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {Array.from({ length: Math.min(totalPages, 12) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => { setPageDirection(i + 1 > currentPage ? "next" : "prev"); setCurrentPage(i + 1); }}
                    style={{ width: currentPage === i + 1 ? 24 : 8, height: 8, borderRadius: 4, border: "none", background: currentPage === i + 1 ? "var(--accent-primary)" : "var(--border-subtle)", transition: "all 0.3s", cursor: "pointer" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ x: 380 }}
              animate={{ x: 0 }}
              exit={{ x: 380 }}
              style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 380, background: "var(--bg-secondary)", borderLeft: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", zIndex: 40 }}
            >
              {/* Sidebar header */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Sparkles size={16} color="var(--accent-primary)" />
                  <span style={{ fontSize: 15, fontWeight: 600 }}>AI Companion</span>

                  {/* Active voice indicator inside sidebar */}
                  <AnimatePresence>
                    {interactionMode === "voice" && (isListening || isSpeaking) && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        style={{ display: "flex", alignItems: "center", gap: 2, overflow: "hidden" }}
                      >
                        {[0, 0.1, 0.2, 0.1, 0].map((delay, i) => (
                          <motion.span
                            key={i}
                            animate={{ scaleY: [1, 2.5, 1] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay, ease: "easeInOut" }}
                            style={{ display: "inline-block", width: 3, height: 12, borderRadius: 2, background: "var(--accent-primary)", transformOrigin: "center" }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", padding: 4 }}>
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflow: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                    <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"} style={{ padding: "10px 16px", fontSize: 14, lineHeight: 1.6 }}>
                      {msg.role === "assistant" ? (
                        <TypewriterText 
                          text={msg.content} 
                          messageIndex={i} 
                          finishedRef={typewriterFinishedRef} 
                          onUpdate={() => chatEndRef.current?.scrollIntoView()} 
                        />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                {interimTranscript && (
                  <div style={{ alignSelf: "flex-end", maxWidth: "85%", opacity: 0.7 }}>
                    <div className="chat-bubble-user" style={{ padding: "10px 16px", fontSize: 14, lineHeight: 1.6, borderRadius: "18px", border: "1px dashed rgba(255,255,255,0.4)" }}>
                      {interimTranscript}...
                    </div>
                  </div>
                )}
                {isLoading && (
                  <div className="chat-bubble-ai" style={{ padding: "10px 16px", alignSelf: "flex-start", display: "flex", gap: 4 }}>
                    {[0, 0.2, 0.4].map((d, i) => (
                      <span key={i} className="voice-breathe" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-tertiary)", animationDelay: `${d}s` }} />
                    ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* ── Voice orb — centred in voice mode ── */}
              <AnimatePresence>
                {interactionMode === "voice" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 16,
                      padding: "32px 20px",
                      borderTop: "1px solid var(--border-subtle)",
                    }}
                  >
                    {/* Orb */}
                    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isListening && [1, 2].map((ring) => (
                        <motion.div
                          key={ring}
                          animate={{ scale: [1, 1.7], opacity: [0.45, 0] }}
                          transition={{ repeat: Infinity, duration: 1.4, delay: ring * 0.35, ease: "easeOut" }}
                          style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "2px solid var(--accent-primary)", pointerEvents: "none" }}
                        />
                      ))}
                      <button
                        onClick={toggleVoice}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          border: "none",
                          background: isListening
                            ? "linear-gradient(135deg,#ef4444,#dc2626)"
                            : "var(--accent-gradient)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: isListening
                            ? "0 0 36px rgba(239,68,68,0.45)"
                            : "var(--shadow-glow)",
                          transition: "background 0.3s, box-shadow 0.3s",
                        }}
                      >
                        {isListening
                          ? <div style={{ width: 22, height: 22, background: "white", borderRadius: 4 }} />
                          : isSpeaking
                            ? <Volume2 size={28} color="white" />
                            : <Mic size={28} color="white" />
                        }
                      </button>
                    </div>
                    {/* Status label */}
                    <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: 0 }}>
                      {isListening ? "Listening… tap to stop" : isSpeaking ? "Speaking…" : "Tap to talk"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Chat input — only in chat mode ── */}
              <AnimatePresence>
                {interactionMode === "chat" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    style={{ padding: "16px 20px", borderTop: "1px solid var(--border-subtle)" }}
                  >
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                      style={{ display: "flex", gap: 8 }}
                    >
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your Buddy..."
                        style={{ flex: 1, padding: "12px 16px", borderRadius: "var(--radius-full)", border: "1px solid var(--border-subtle)", background: "var(--bg-tertiary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }}
                      />
                      <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: input.trim() ? "var(--accent-primary)" : "var(--bg-tertiary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed" }}
                      >
                        <Send size={16} />
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Mode switch button — always at the very bottom ── */}
              <div style={{ padding: "12px 20px 20px", display: "flex", justifyContent: "center" }}>
                <ModeSwitchButton
                  mode={interactionMode}
                  onChange={(m) => setInteractionMode(m)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <PageMountSignaler />
    </>
  );
}