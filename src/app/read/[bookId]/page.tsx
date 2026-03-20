"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Send, ArrowLeft, ChevronLeft, ChevronRight, BookOpen, MessageCircle, X, Sparkles, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SAMPLE_BOOKS } from "@/lib/sample-books";
import type { ConversationMode } from "@/lib/prompts";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ReaderPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const book = SAMPLE_BOOKS.find((b) => b.id === bookId);

  const [currentPage, setCurrentPage] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [mode, setMode] = useState<ConversationMode>("explain");
  const [pageDirection, setPageDirection] = useState<"next" | "prev">("next");

  const chatEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const totalPages = book?.totalPages || 1;
  const content = book?.pages[currentPage] || "Content not available.";
  const chapter = book?.chapters.find(
    (ch) => currentPage >= ch.startPage && currentPage <= ch.endPage
  );

  // ─── Speech Recognition ────────────────────────────────
  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported. Please use Chrome.");
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSendMessage(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setChatOpen(true);
  }, [currentPage, selectedText, mode, messages]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ─── Text-to-Speech ────────────────────────────────────
  const speakText = useCallback(async (text: string) => {
    setIsSpeaking(true);
    try {
      // Try ElevenLabs first
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 500) }),
      });

      if (response.ok) {
        const audioData = await response.arrayBuffer();
        const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          // Fallback to browser TTS
          fallbackBrowserTTS(text);
        };
        await audio.play();
        return;
      }
    } catch {
      // fallback
    }
    fallbackBrowserTTS(text);
  }, []);

  const fallbackBrowserTTS = (text: string) => {
    if (!window.speechSynthesis) {
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // ─── Send Message ──────────────────────────────────────
  const handleSendMessage = async (messageText?: string) => {
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
        setPageDirection("next");
        setCurrentPage((p) => p + 1);
      } else if (data.navigation === "prev" && currentPage > 1) {
        setPageDirection("prev");
        setCurrentPage((p) => p - 1);
      }

      const aiMsg: ChatMessage = {
        role: "assistant",
        content: data.response || data.error || "Sorry, I couldn't process that.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Auto-speak the response
      speakText(aiMsg.content);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection error. Please check your API keys in .env.local.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Text Selection ───────────────────────────────────
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()?.toString().trim();
      if (selection && selection.length > 5) {
        setSelectedText(selection);
      }
    };
    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, []);

  // ─── Keyboard Navigation ──────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" && currentPage < totalPages) {
        setPageDirection("next");
        setCurrentPage((p) => p + 1);
      }
      if (e.key === "ArrowLeft" && currentPage > 1) {
        setPageDirection("prev");
        setCurrentPage((p) => p - 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPage, totalPages]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!book) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Book not found</h1>
          <Link href="/library" style={{ color: "var(--accent-secondary)" }}>
            ← Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative" }}>
      {/* ─── Reader Panel ─────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          transition: "margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          marginRight: chatOpen ? 380 : 0,
        }}
      >
        {/* Top bar */}
        <div
          className="nav-glass"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/library">
              <button
                className="btn-ghost"
                style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 4 }}
              >
                <ArrowLeft size={16} />
                Library
              </button>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={16} color="var(--accent-secondary)" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>{book.title}</span>
              {chapter && (
                <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                  — Ch. {chapter.number}: {chapter.title}
                </span>
              )}
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
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 24px",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPage}
              initial={{
                opacity: 0,
                x: pageDirection === "next" ? 60 : -60,
                rotateY: pageDirection === "next" ? -15 : 15,
              }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{
                opacity: 0,
                x: pageDirection === "next" ? -60 : 60,
                rotateY: pageDirection === "next" ? 15 : -15,
              }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="glass"
              style={{
                maxWidth: 700,
                width: "100%",
                borderRadius: "var(--radius-xl)",
                padding: "48px 52px",
                minHeight: 400,
                perspective: 1000,
              }}
            >
              {/* Page number */}
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 24,
                  fontWeight: 600,
                }}
              >
                Page {currentPage}
              </div>

              {/* Content */}
              <div className="reading-text">
                {content.split("\n\n").map((paragraph, i) => (
                  <p key={i} style={{ marginBottom: 20, textIndent: i > 0 ? "2em" : 0 }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Page navigation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              marginTop: 32,
            }}
          >
            <button
              onClick={() => {
                if (currentPage > 1) {
                  setPageDirection("prev");
                  setCurrentPage((p) => p - 1);
                }
              }}
              disabled={currentPage <= 1}
              className="btn-ghost"
              style={{
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: currentPage <= 1 ? 0.3 : 1,
                cursor: currentPage <= 1 ? "not-allowed" : "pointer",
              }}
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            {/* Page dots */}
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: Math.min(totalPages, 12) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPageDirection(i + 1 > currentPage ? "next" : "prev");
                    setCurrentPage(i + 1);
                  }}
                  style={{
                    width: currentPage === i + 1 ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: "none",
                    background:
                      currentPage === i + 1
                        ? "var(--accent-primary)"
                        : "var(--border-subtle)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => {
                if (currentPage < totalPages) {
                  setPageDirection("next");
                  setCurrentPage((p) => p + 1);
                }
              }}
              disabled={currentPage >= totalPages}
              className="btn-ghost"
              style={{
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: currentPage >= totalPages ? 0.3 : 1,
                cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Selected text indicator */}
          <AnimatePresence>
            {selectedText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  marginTop: 16,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  fontSize: 12,
                  color: "var(--text-accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  maxWidth: 400,
                }}
              >
                <Sparkles size={12} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Selected: &ldquo;{selectedText.slice(0, 60)}...&rdquo;
                </span>
                <button
                  onClick={() => setSelectedText("")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-tertiary)",
                    cursor: "pointer",
                    padding: 2,
                  }}
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Voice Orb (Always Visible) ───────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: chatOpen ? 400 : 32,
          zIndex: 50,
          transition: "right 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div style={{ position: "relative" }}>
          {/* Ripple effects when listening */}
          {isListening && (
            <>
              <div
                className="voice-ripple"
                style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: "50%",
                  border: "2px solid var(--accent-primary)",
                }}
              />
              <div
                className="voice-ripple-delayed"
                style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: "50%",
                  border: "2px solid var(--accent-primary)",
                }}
              />
            </>
          )}

          {/* Speaking indicator */}
          {isSpeaking && (
            <div
              className="voice-orbit"
              style={{
                position: "absolute",
                inset: -12,
                borderRadius: "50%",
                border: "2px dashed rgba(139,92,246,0.4)",
              }}
            />
          )}

          <button
            onClick={isListening ? stopListening : startListening}
            className={`glow-orb ${isListening || isSpeaking ? "active" : ""}`}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "none",
              background: isListening
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              zIndex: 2,
              boxShadow: isListening
                ? "0 0 30px rgba(239,68,68,0.4)"
                : "0 0 30px rgba(139,92,246,0.3)",
              transition: "all 0.3s ease",
            }}
          >
            {isListening ? (
              <MicOff size={24} color="white" />
            ) : isSpeaking ? (
              <Volume2 size={24} color="white" className="voice-breathe" />
            ) : (
              <Mic size={24} color="white" />
            )}
          </button>
        </div>
      </div>

      {/* ─── AI Chat Sidebar ──────────────────────────────── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              width: 380,
              background: "var(--bg-secondary)",
              borderLeft: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              zIndex: 40,
            }}
          >
            {/* Chat header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Sparkles size={16} color="var(--accent-secondary)" />
                  AI Companion
                </div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>
                  Discussing: {book.title}
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-tertiary)",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode selector */}
            <div
              style={{
                padding: "12px 20px",
                display: "flex",
                gap: 6,
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              {(["explain", "empathy", "roleplay"] as ConversationMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`mode-chip ${mode === m ? "active" : ""}`}
                >
                  {m === "explain" ? "📚 Explain" : m === "empathy" ? "💛 Empathy" : "🎭 Role-Play"}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "var(--text-tertiary)",
                    fontSize: 14,
                  }}
                >
                  <Mic size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                  <p style={{ marginBottom: 8 }}>Click the mic button or type below</p>
                  <p style={{ fontSize: 12 }}>
                    Try: &ldquo;Tell me about this page&rdquo; or highlight a passage
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  <div
                    className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}
                    style={{
                      padding: "10px 16px",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="chat-bubble-ai"
                  style={{
                    padding: "10px 16px",
                    alignSelf: "flex-start",
                    maxWidth: "85%",
                    display: "flex",
                    gap: 4,
                  }}
                >
                  <span className="voice-breathe" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-tertiary)" }} />
                  <span className="voice-breathe" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-tertiary)", animationDelay: "0.2s" }} />
                  <span className="voice-breathe" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-tertiary)", animationDelay: "0.4s" }} />
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{ display: "flex", gap: 8 }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    selectedText
                      ? "Ask about the selected text..."
                      : "Ask about this page..."
                  }
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "none",
                    background: input.trim()
                      ? "var(--accent-primary)"
                      : "var(--bg-tertiary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: input.trim() ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
