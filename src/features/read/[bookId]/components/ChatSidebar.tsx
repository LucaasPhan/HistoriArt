"use client";

import React, { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic,
  Square,
  Sparkles,
  Send,
  Volume2,
  X,
} from "lucide-react";
import type { ChatMessage, InteractionMode } from "../types";
import TypewriterText from "./TypewriterText";
import ModeSwitchButton from "./ModeSwitchButton";

type ChatSidebarProps = {
  interactionMode: InteractionMode;
  chatEndRef: React.RefObject<HTMLDivElement | null>;

  messages: ChatMessage[];
  typewriterFinishedRef: React.RefObject<Set<number> | null>;

  isLoading: boolean;
  isTyping: boolean;
  isListening: boolean;
  isSpeaking: boolean;

  interimTranscript: string;
  dictatedText: string;

  input: string;
  onInputChange: (v: string) => void;
  onSubmitChat: () => void;
  onStopResponse: () => void;

  onClose: () => void;
  onToggleVoice: () => void;

  onLastMessageFinished: () => void;
  scrollToEnd: () => void;

  modeSwitchMode: InteractionMode;
  onModeSwitchChange: (m: InteractionMode) => void;
};

const ChatSidebar = memo(function ChatSidebar({
  interactionMode,
  chatEndRef,
  messages,
  typewriterFinishedRef,
  isLoading,
  isTyping,
  isListening,
  isSpeaking,
  interimTranscript,
  dictatedText,
  input,
  onInputChange,
  onSubmitChat,
  onStopResponse,
  onClose,
  onToggleVoice,
  onLastMessageFinished,
  scrollToEnd,
  modeSwitchMode,
  onModeSwitchChange,
}: ChatSidebarProps) {
  return (
    <motion.div
      initial={{ x: 380 }}
      animate={{ x: 0 }}
      exit={{ x: 380 }}
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
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: 15, fontWeight: 600 }}>
              AI Companion
            </span>

            <AnimatePresence>
              {interactionMode === "voice" && (isListening || isSpeaking) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    overflow: "hidden",
                  }}
                >
                  {[0, 0.1, 0.2, 0.1, 0].map((delay, i) => (
                    <motion.span
                      key={i}
                      animate={{ scaleY: [1, 2.5, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.5,
                        delay,
                        ease: "easeInOut",
                      }}
                      style={{
                        display: "inline-block",
                        width: 3,
                        height: 12,
                        borderRadius: 2,
                        background: "var(--accent-primary)",
                        transformOrigin: "center",
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onClose}
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

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
              }}
            >
              <div
                className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}
                style={{ padding: "10px 16px", fontSize: 14, lineHeight: 1.6 }}
              >
                {msg.role === "assistant" ? (
                  <TypewriterText
                    text={msg.content}
                    messageIndex={i}
                    finishedRef={typewriterFinishedRef}
                    onUpdate={scrollToEnd}
                    onFinished={() => {
                      if (i === messages.length - 1) onLastMessageFinished();
                    }}
                  />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {(dictatedText || interimTranscript) && (
            <div
              style={{
                alignSelf: "flex-end",
                maxWidth: "85%",
                opacity: 0.7,
              }}
            >
              <div
                className="chat-bubble-user"
                style={{
                  padding: "10px 16px",
                  fontSize: 14,
                  lineHeight: 1.6,
                  borderRadius: "18px",
                  border: "1px dashed rgba(255,255,255,0.4)",
                }}
              >
                {dictatedText}
                {interimTranscript}...
              </div>
            </div>
          )}

          {isLoading && (
            <div
              className="chat-bubble-ai"
              style={{
                padding: "10px 16px",
                alignSelf: "flex-start",
                display: "flex",
                gap: 4,
              }}
            >
              {[0, 0.2, 0.4].map((d, i) => (
                <span
                  key={i}
                  className="voice-breathe"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--text-tertiary)",
                    animationDelay: `${d}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

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
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isListening && [1, 2].map((ring) => (
                  <motion.div
                    key={ring}
                    animate={{ scale: [1, 1.7], opacity: [0.45, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.4,
                      delay: ring * 0.35,
                      ease: "easeOut",
                    }}
                    style={{
                      position: "absolute",
                      inset: -10,
                      borderRadius: "50%",
                      border: "2px solid var(--accent-primary)",
                      pointerEvents: "none",
                    }}
                  />
                ))}

                <button
                  onClick={onToggleVoice}
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
                  {isListening ? (
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        background: "white",
                        borderRadius: 4,
                      }}
                    />
                  ) : isSpeaking ? (
                    <Volume2 size={28} color="white" />
                  ) : (
                    <Mic size={28} color="white" />
                  )}
                </button>
              </div>

              <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: 0 }}>
                {isListening
                  ? "Listening… tap to stop"
                  : isSpeaking
                    ? "Speaking…"
                    : "Tap to talk"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {interactionMode === "chat" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                padding: "16px 20px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmitChat();
                }}
                style={{ display: "flex", gap: 8 }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder="Ask your Buddy..."
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
                {isLoading ? (
                  <button
                    type="button"
                    onClick={onStopResponse}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: "none",
                      background: "var(--accent-primary)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Square size={16} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: "none",
                      background:
                        input.trim() && !isTyping
                          ? "var(--accent-primary)"
                          : "var(--bg-tertiary)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor:
                        input.trim() && !isTyping ? "pointer" : "not-allowed",
                    }}
                  >
                    <Send size={16} />
                  </button>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ padding: "12px 20px 20px", display: "flex", justifyContent: "center" }}>
          <ModeSwitchButton
            mode={modeSwitchMode}
            onChange={onModeSwitchChange}
          />
        </div>
    </motion.div>
  );
});

ChatSidebar.displayName = "ChatSidebar";

export default ChatSidebar;

