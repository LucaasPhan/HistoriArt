"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, MessageCircle, Highlighter } from "lucide-react";
import { SAMPLE_BOOKS } from "@/lib/sample-books";
import { ThemeButton } from "@/components/ThemeButton";
import { TransitionLink } from "@/components/TransitionLink";
import PageMountSignaler from "@/components/PageMountSignaler";
import SelectionTooltip from "./components/SelectionTooltip";
import ReaderContent from "./components/ReaderContent";
import ReaderNavigation from "./components/ReaderNavigation";
import ChatSidebar from "./components/ChatSidebar";
import HighlightsSidebar from "./components/HighlightsSidebar";
import DictionaryPopup from "./components/DictionaryPopup";
import useReaderController from "./hooks/useReaderController";
import { useAuth } from "@/context/AuthContext";
import type { BookData } from "@/lib/sample-books";

export default function ReaderFeature({ bookId }: { bookId: string }) {
  const sampleBook = useMemo(
    () => SAMPLE_BOOKS.find((b) => b.id === bookId) as BookData | undefined,
    [bookId],
  );

  const c = useReaderController({ bookId, sampleBook });
  const { isAuthenticated } = useAuth();
  const [dictionaryWord, setDictionaryWord] = useState<string | null>(null);

  // If the book isn't known locally and dynamic loading is disabled, render nothing.
  // In practice `isDynamic` becomes true for unknown book IDs.
  if (!sampleBook && !c.isDynamic) return null;

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          position: "relative",
        }}
      >
        <SelectionTooltip
          selectionCoords={dictionaryWord ? null : c.selectionCoords}
          showCopied={c.showCopied}
          selectedText={c.selectedText}
          onCopy={c.copyToClipboard}
          onSendToChat={() => {
            c.setChatOpen(true);
            const currentInput = c.input.trim();
            const prefix = currentInput ? currentInput + " " : "";
            c.setInput(`${prefix}"${c.selectedText}"`);
          }}
          onHighlight={c.onHighlight}
          onLookUp={() => setDictionaryWord(c.selectedText)}
          interactionMode={c.interactionMode}
        />

        <DictionaryPopup
          word={dictionaryWord}
          onClose={() => setDictionaryWord(null)}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            minHeight: "100vh",
            transition: "margin-right 0.4s cubic-bezier(0.4,0,0.2,1), margin-left 0.4s cubic-bezier(0.4,0,0.2,1)",
            marginRight: c.chatOpen ? 380 : 0,
            marginLeft: c.highlightsSidebarOpen ? 320 : 0,
          }}
        >
          {/* Top bar */}
          <div
            className="nav-glass"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 999,
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <TransitionLink href="/library">
                <button
                  className="btn-ghost"
                  style={{
                    padding: "6px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <ArrowLeft size={16} />
                  Library
                </button>
              </TransitionLink>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {c.bookTitle || "Loading..."}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ThemeButton />
               <button
                className="btn-ghost"
                onClick={() => c.setHighlightsSidebarOpen((o: boolean) => !o)}
                style={{
                  padding: "6px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                }}
              >
                <Highlighter size={14} />
                Highlights
              </button>
              {!c.chatOpen && (
                <button
                  className="btn-ghost"
                  onClick={() => c.setChatOpen(true)}
                  style={{
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "var(--accent-primary)",
                  }}
                >
                  <MessageCircle size={14} />
                  Fable Chat
                </button>
              )}
             
            </div>
          </div>

          <ReaderContent
            content={c.content}
            currentPage={c.currentPage}
            pageDirection={c.pageDirection}
            highlights={c.highlights.filter((h) => h.pageNumber === c.currentPage)}
            onMouseUp={c.handleTextSelection}
            onDoubleClick={c.handleDoubleClick}
          />

          <ReaderNavigation
            currentPage={c.currentPage}
            totalPages={c.totalPages}
            chatOpen={c.chatOpen}
            highlightsSidebarOpen={c.highlightsSidebarOpen}
            onPrev={c.goPrev}
            onNext={c.goNext}
            onJumpTo={c.jumpToPage}
            content={c.content}
            bookTitle={c.bookTitle}
            bookId={bookId}
            highlightedText={c.selectedText}
            isAuthenticated={isAuthenticated}
          />
        </div>

        <AnimatePresence>
          {c.chatOpen && (
            <ChatSidebar
              key="chat-sidebar"
              interactionMode={c.interactionMode}
              chatEndRef={c.chatEndRef}
              messages={c.messages}
              typewriterFinishedRef={c.typewriterFinishedRef}
              isLoading={c.isLoading}
              isTyping={c.isTyping}
              isListening={c.isListening}
              isSpeaking={c.isSpeaking}
              interimTranscript={c.interimTranscript}
              dictatedText={c.dictatedText}
              input={c.input}
              onInputChange={c.onInputChange}
              onSubmitChat={() => c.onSendMessage()}
              onStopResponse={c.onStopResponse}
              onClose={() => c.setChatOpen(false)}
              onToggleVoice={c.toggleVoice}
              onLastMessageFinished={c.onLastMessageFinished}
              scrollToEnd={c.scrollToEnd}
              modeSwitchMode={c.interactionMode}
              onModeSwitchChange={c.setInteractionMode}
              isAuthenticated={isAuthenticated}
            />
          )}
          {c.highlightsSidebarOpen && (
            <HighlightsSidebar
              key="highlights-sidebar"
              highlights={c.highlights}
              onClose={() => c.setHighlightsSidebarOpen(false)}
              onDeleteHighlight={c.onDeleteHighlight}
              onSendToChat={(text) => {
                c.setChatOpen(true);
                const currentInput = c.input.trim();
                const prefix = currentInput ? currentInput + " " : "";
                c.setInput(`${prefix}"${text}"`);
              }}
              onNavigate={c.jumpToPage}
            />
          )}
        </AnimatePresence>
      </div>
      <PageMountSignaler />
    </>
  );
}

