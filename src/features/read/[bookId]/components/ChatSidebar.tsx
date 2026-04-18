"use client";

import { TransitionLink } from "@/components/TransitionLink";
import { useTranslation } from "@/lib/i18n";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, LogIn, MessageCircle, Sparkles, Square, Trash2, X } from "lucide-react";
import React, { memo } from "react";
import type { ChatMessage, MediaAnnotation } from "../../types";
import styles from "./styles/ChatSidebar.module.css";
import TypewriterText from "./TypewriterText";

type ChatSidebarProps = {
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  messages: ChatMessage[];
  typewriterFinishedRef: React.RefObject<Set<number> | null>;
  isLoading: boolean;
  isTyping: boolean;
  input: string;
  onInputChange: (v: string) => void;
  onSubmitChat: () => void;
  onStopResponse: () => void;
  onClose: () => void;
  onClearChat?: () => void;
  onLastMessageFinished: () => void;
  scrollToEnd: () => void;
  isAuthenticated?: boolean;
  attachedMedia?: MediaAnnotation | null;
  onClearAttachedMedia?: () => void;
};

const ChatSidebar = memo(function ChatSidebar({
  chatEndRef,
  messages,
  typewriterFinishedRef,
  isLoading,
  isTyping,
  input,
  onInputChange,
  onSubmitChat,
  onStopResponse,
  onClose,
  onClearChat,
  onLastMessageFinished,
  scrollToEnd,
  isAuthenticated = true,
  attachedMedia,
  onClearAttachedMedia,
}: ChatSidebarProps) {
  const [showConfirm, setShowConfirm] = React.useState(false);
  const { t } = useTranslation();
  const attachedLabel = attachedMedia
    ? attachedMedia.chatSource === "selection"
      ? t("chat.bookText")
      : attachedMedia.chatSource === "highlight"
        ? t("chat.highlight")
        : attachedMedia.mediaType === "image"
          ? t("chat.image")
          : attachedMedia.mediaType === "video"
            ? t("chat.video")
            : attachedMedia.mediaType === "audio"
              ? t("chat.audio")
              : t("chat.annotation")
    : "";
  const attachedPreview =
    attachedMedia?.caption?.trim() || attachedMedia?.passageText?.trim() || "";

  return (
    <motion.div
      initial={{ x: 480 }}
      animate={{ x: 0 }}
      exit={{ x: 480 }}
      className={styles.container}
    >
      <div className={styles.header}>
        <div className={styles.headerSubtitle}>
          <Sparkles size={16} color="var(--accent-primary)" />
          <span className={styles.aiCompanionLabel}>Fable</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {messages.length > 0 && onClearChat && (
            <button
              onClick={() => setShowConfirm(true)}
              className={styles.closeButton}
              title={t("chat.clearHistory")}
            >
              <Trash2 size={16} color="var(--text-secondary)" />
            </button>
          )}
          <button onClick={onClose} className={styles.closeButton}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {!isAuthenticated ? (
          <div className={styles.decorativeMessages}>
            <div className={`${styles.messageWrapper} ${styles.messageWrapperUser}`}>
              <div className={`chat-bubble-user ${styles.chatBubble}`}>
                {t("chat.decorativeUser")}
              </div>
            </div>
            <div className={`${styles.messageWrapper} ${styles.messageWrapperAI}`}>
              <div className={`chat-bubble-ai ${styles.chatBubble}`}>{t("chat.decorativeAI")}</div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.messageWrapper} ${
                  msg.role === "user" ? styles.messageWrapperUser : styles.messageWrapperAI
                }`}
                style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
              >
                {msg.role === "assistant" && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={16} color="var(--accent-primary)" />
                  </div>
                )}
                <div
                  className={`${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"} ${styles.chatBubble}`}
                  style={{
                    borderRadius:
                      msg.role === "assistant" ? "16px 16px 16px 2px" : "16px 16px 2px 16px",
                  }}
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

            {isLoading && (
              <div
                className={`${styles.messageWrapper} ${styles.messageWrapperAI}`}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  alignSelf: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={16} color="var(--accent-primary)" />
                </div>
                <div
                  className={`chat-bubble-ai ${styles.loadingContainer}`}
                  style={{ borderRadius: "16px 16px 16px 2px" }}
                >
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span
                      key={i}
                      className={`voice-breathe ${styles.loadingDot}`}
                      style={{ animationDelay: `${d}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
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
          <p className={styles.signInHeading}>{t("chat.unlockFable")}</p>
          <p className={styles.signInText}>{t("chat.signInPrompt")}</p>
          <TransitionLink href="/login" className={styles.signInCta}>
            <LogIn size={16} />
            {t("chat.signInCta")}
          </TransitionLink>
        </motion.div>
      ) : (
        <div className={styles.chatInteractionMode}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitChat();
            }}
            className={styles.chatForm}
          >
            {attachedMedia && (
              <div className={styles.attachedMediaChip}>
                <div className={styles.attachedMediaText}>
                  <span className={styles.attachedMediaBadge}>{attachedLabel}</span>
                  <span className={styles.attachedMediaTitle}>{t("chat.attachedMedia")}</span>
                  {attachedPreview && (
                    <span className={styles.attachedMediaPreview}>{attachedPreview}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClearAttachedMedia}
                  className={styles.attachedMediaClose}
                  title={t("chat.removeMedia")}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className={styles.inputWrapper}>
              <div
                style={{
                  paddingRight: 10,
                  display: "flex",
                  alignItems: "center",
                  color: "var(--text-tertiary)",
                }}
              >
                <MessageCircle size={18} />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <textarea
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSubmitChat();
                    }
                  }}
                  placeholder={t("chat.placeholder")}
                  className={styles.textarea}
                  rows={1}
                />
              </div>
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
                    disabled={(!input.trim() && !attachedMedia) || isTyping}
                    className={`${styles.submitIconBtn} ${
                      (input.trim() || attachedMedia) && !isTyping
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
        </div>
      )}

      <AnimatePresence>
        {showConfirm && (
          <div className={styles.confirmOverlay}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={styles.confirmDialog}
            >
              <h3 className={styles.confirmTitle}>{t("chat.confirmClearTitle")}</h3>
              <p className={styles.confirmText}>{t("chat.confirmClearText")}</p>
              <div className={styles.confirmActions}>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="btn-ghost"
                  style={{ padding: "8px 16px", fontSize: 13 }}
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    onClearChat?.();
                  }}
                  className={styles.confirmDelete}
                >
                  {t("common.delete")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

ChatSidebar.displayName = "ChatSidebar";

export default ChatSidebar;
