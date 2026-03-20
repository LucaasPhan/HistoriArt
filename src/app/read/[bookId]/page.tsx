"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Send, ArrowLeft, ChevronLeft, ChevronRight, BookOpen, MessageCircle, X, Sparkles, Volume2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { SAMPLE_BOOKS } from "@/lib/sample-books";
import type { ConversationMode } from "@/lib/prompts";
import { ThemeButton } from "@/components/ThemeButton";
import { TransitionLink } from "@/components/TransitionLink";
import PageMountSignaler from "@/components/PageMountSignaler";

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
  const [selectionCoords, setSelectionCoords] = useState<{ x: number, y: number } | null>(null);
  const [showCopied, setShowCopied] = useState(false);
  const [mode] = useState<ConversationMode>("buddy");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [pageDirection, setPageDirection] = useState<"next" | "prev">("next");

  const chatEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const totalPages = book?.totalPages || 1;
  const content = book?.pages[currentPage] || "Content not available.";

  // ─── Text-to-Speech ────────────────────────────────────
  const fallbackBrowserTTS = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const speakText = useCallback(async (text: string) => {
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

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        fallbackBrowserTTS(text);
      };

      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      fallbackBrowserTTS(text);
    }
  }, [fallbackBrowserTTS]);

  // ─── Send Message ──────────────────────────────────────
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
      speakText(aiMsg.content);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection error. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [bookId, currentPage, isLoading, messages, mode, selectedText, speakText, totalPages, input]);

  // ─── Speech Recognition ────────────────────────────────
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
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setChatOpen(true);
  }, [handleSendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ─── Reader Utilities ─────────────────────────────────
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 2) {
      setSelectedText(text);
      
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setSelectionCoords({
          x: rect.left + rect.width / 2,
          y: rect.top - 50,
        });
      }
    } else {
      setSelectionCoords(null);
    }
  }, []);

  const copyToClipboard = useCallback(() => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      setShowCopied(true);
      setTimeout(() => {
        setShowCopied(false);
        setSelectionCoords(null);
      }, 1000);
    }
  }, [selectedText]);

  const handleDoubleClick = useCallback(() => {
    const selection = window.getSelection()?.toString().trim();
    if (selection) {
      navigator.clipboard.writeText(selection);
    }
  }, []);

  // Keyboard navigation
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
  }, [messages, interimTranscript]);

  if (!book) return null;

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
            style={{
              position: "fixed",
              left: selectionCoords.x,
              top: selectionCoords.y,
              transform: "translateX(-50%)",
              zIndex: 100,
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-lg)",
                color: "var(--text-primary)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                backdropFilter: "blur(12px)",
              }}
            >
              {showCopied ? (
                <>
                  <Check size={14} color="#10b981" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
            <div
              style={{
                position: "absolute",
                bottom: -6,
                left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                width: 12,
                height: 12,
                background: "var(--bg-secondary)",
                borderRight: "1px solid var(--border-subtle)",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Reader Panel ─────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minHeight: "100vh",
          transition: "margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          marginRight: chatOpen ? 380 : 0,
        }}
      >
        {/* Side Navigation - Left Area */}
        <button
          onClick={() => { if (currentPage > 1) { setPageDirection("prev"); setCurrentPage(p => p - 1); } }}
          disabled={currentPage <= 1}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "18%",
            minWidth: 100,
            border: "none",
            background: "transparent",
            cursor: currentPage <= 1 ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-tertiary)",
            transition: "all 0.3s ease",
            zIndex: 10,
          }}
          onMouseEnter={(e) => { 
            if (currentPage > 1) {
              (e.currentTarget as HTMLElement).style.background = "linear-gradient(to right, rgba(var(--accent-primary-rgb), 0.05), transparent)";
              (e.currentTarget as HTMLElement).style.color = "var(--accent-primary)";
            }
          }}
          onMouseLeave={(e) => { 
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
          }}
        >
          <ChevronLeft size={44} style={{ opacity: currentPage <= 1 ? 0 : 0.3, transition: "opacity 0.2s" }} />
        </button>

        {/* Side Navigation - Right Area */}
        <button
          onClick={() => { if (currentPage < totalPages) { setPageDirection("next"); setCurrentPage(p => p + 1); } }}
          disabled={currentPage >= totalPages}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "18%",
            minWidth: 100,
            border: "none",
            background: "transparent",
            cursor: currentPage >= totalPages ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-tertiary)",
            transition: "all 0.3s ease",
            zIndex: 10,
          }}
          onMouseEnter={(e) => { 
            if (currentPage < totalPages) {
              (e.currentTarget as HTMLElement).style.background = "linear-gradient(to left, rgba(var(--accent-primary-rgb), 0.05), transparent)";
              (e.currentTarget as HTMLElement).style.color = "var(--accent-primary)";
            }
          }}
          onMouseLeave={(e) => { 
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
          }}
        >
          <ChevronRight size={44} style={{ opacity: currentPage >= totalPages ? 0 : 0.3, transition: "opacity 0.2s" }} />
        </button>
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
            <TransitionLink href="/library">
              <button className="btn-ghost" style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 4 }}>
                <ArrowLeft size={16} />
                Library
              </button>
            </TransitionLink>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>{book.title}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Page {currentPage} of {totalPages}</span>
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
              style={{
                maxWidth: 700,
                width: "100%",
                borderRadius: "var(--radius-xl)",
                padding: "48px 52px",
                minHeight: 400,
              }}
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

          {/* Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: 32 }}>
            <div style={{ height: 44, display: "flex", alignItems: "center" }}>
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
            </div>
          </div>
        </div>
      </div>

      {/* ─── Voice Orb ───────────────────────────────────── */}
      <div style={{ position: "fixed", bottom: 32, right: chatOpen ? 400 : 32, zIndex: 50, transition: "all 0.4s" }}>
        <div style={{ position: "relative" }}>
          {isListening && (
            <div className="voice-ripple" style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "2px solid var(--accent-primary)" }} />
          )}
          <button
            onClick={() => isListening ? stopListening() : startListening()}
            className={`glow-orb ${isListening || isSpeaking ? "active" : ""}`}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "none",
              background: isListening ? "#ef4444" : "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: isListening ? "0 0 30px rgba(239,68,68,0.4)" : "var(--shadow-glow)",
            }}
          >
            {isListening ? <div style={{ width: 18, height: 18, background: "white", borderRadius: 2 }} /> : isSpeaking ? <Volume2 size={24} color="white" /> : <Mic size={24} color="white" />}
          </button>
        </div>
      </div>

      {/* ─── Sidebar ─────────────────────────────────────── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 380, background: "var(--bg-secondary)", borderLeft: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", zIndex: 40 }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={16} color="var(--accent-primary)" />
                  AI Companion
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ThemeButton />
                <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", padding: 4 }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                  <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"} style={{ padding: "10px 16px", fontSize: 14, lineHeight: 1.6 }}>
                    {msg.content}
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
                  <span className="voice-breathe" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-tertiary)" }} />
                  <span className="voice-breathe" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-tertiary)", animationDelay: "0.2s" }} />
                  <span className="voice-breathe" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-tertiary)", animationDelay: "0.4s" }} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-subtle)" }}>
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your Buddy..."
                  style={{ flex: 1, padding: "12px 16px", borderRadius: "var(--radius-full)", border: "1px solid var(--border-subtle)", background: "var(--bg-tertiary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }}
                />
                <button type="submit" disabled={!input.trim() || isLoading} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: input.trim() ? "var(--accent-primary)" : "var(--bg-tertiary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed" }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <PageMountSignaler/>
    </>
  );
}
