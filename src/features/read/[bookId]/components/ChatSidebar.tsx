"use client";

import React, { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic,
  Square,
  Sparkles,
  Volume2,
  X,
  ArrowUp,
  LogIn,
} from "lucide-react";
import type { ChatMessage, InteractionMode } from "../types";
import TypewriterText from "./TypewriterText";
import ModeSwitchButton from "./ModeSwitchButton";
import styles from "./ChatSidebar.module.css";
import { TransitionLink } from "@/components/TransitionLink";

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

  isAuthenticated?: boolean;
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
  isAuthenticated = true,
}: ChatSidebarProps) {
  return (
    <motion.div
      initial={{ x: 380 }}
      animate={{ x: 0 }}
      exit={{ x: 380 }}
      className={styles.container}
    >
      <div className={styles.header}>
        <div className={styles.headerSubtitle}>
          <Sparkles size={16} color="var(--accent-primary)" />
          <span className={styles.aiCompanionLabel}>
            AI Companion
          </span>

          <AnimatePresence>
            {interactionMode === "voice" && (isListening || isSpeaking) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className={styles.voiceWaveContainer}
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
                    className={styles.voiceWaveBar}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onClose}
          className={styles.closeButton}
        >
          <X size={18} />
        </button>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.messageWrapper} ${
              msg.role === "user" ? styles.messageWrapperUser : styles.messageWrapperAI
            }`}
          >
            <div
              className={`${
                msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
              } ${styles.chatBubble}`}
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
          <div className={styles.dictationContainer}>
            <div
              className={`chat-bubble-user ${styles.dictationBubble}`}
            >
              {dictatedText}
              {interimTranscript}...
            </div>
          </div>
        )}

        {isLoading && (
          <div
            className={`chat-bubble-ai ${styles.loadingContainer}`}
          >
            {[0, 0.2, 0.4].map((d, i) => (
              <span
                key={i}
                className={`voice-breathe ${styles.loadingDot}`}
                style={{
                  animationDelay: `${d}s`,
                }}
              />
            ))}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {!isAuthenticated ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={styles.signInBanner}
        >
          <div className={styles.signInGlow} />
          <motion.div
            className={styles.signInIconWrap}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Sparkles size={28} color="var(--accent-primary)" />
          </motion.div>
          <p className={styles.signInHeading}>Unlock AI Companion</p>
          <p className={styles.signInText}>
            Sign in to chat, ask questions, and explore your books with AI
          </p>
          <TransitionLink href="/login" className={styles.signInCta}>
            <LogIn size={16} />
            Sign In to Continue
          </TransitionLink>
        </motion.div>
      ) : (
        <>
          <AnimatePresence>
            {interactionMode === "voice" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className={styles.voiceInteractionMode}
              >
                <div className={styles.micRingContainer}>
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
                      className={styles.micRing}
                    />
                  ))}

                  <button
                    onClick={onToggleVoice}
                    className={`${styles.micButton} ${
                      isListening
                        ? styles.micButtonListening
                        : isSpeaking
                          ? styles.micButtonSpeaking
                          : styles.micButtonIdle
                    }`}
                  >
                    {isListening ? (
                      <div className={styles.micStopIcon} />
                    ) : isSpeaking ? (
                      <Volume2 size={28} color="white" />
                    ) : (
                      <Mic size={28} color="white" />
                    )}
                  </button>
                </div>

                <p className={styles.micStatusText}>
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
                className={styles.chatInteractionMode}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSubmitChat();
                  }}
                  className={styles.chatForm}
                >
                  <div className={styles.inputWrapper}>
                    <textarea
                      value={input}
                      onChange={(e) => onInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          onSubmitChat();
                        }
                      }}
                      placeholder="Message..."
                      className={styles.textarea}
                      rows={1}
                    />
                    <div className={styles.inputControls}>
                      {isLoading ? (
                        <button
                          type="button"
                          onClick={onStopResponse}
                          className={`${styles.submitIconBtn} ${styles.submitIconActive}`}
                        >
                          <Square size={16} fill="currentColor" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={!input.trim() || isTyping}
                          className={`${styles.submitIconBtn} ${
                            input.trim() && !isTyping
                              ? styles.submitIconActive
                              : styles.submitIconDisabled
                          }`}
                        >
                          <ArrowUp size={18} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.footer}>
            <ModeSwitchButton
              mode={modeSwitchMode}
              onChange={onModeSwitchChange}
            />
          </div>
        </>
      )}
    </motion.div>
  );
});

ChatSidebar.displayName = "ChatSidebar";

export default ChatSidebar;

