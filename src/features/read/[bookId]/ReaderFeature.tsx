"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import { TransitionLink } from "@/components/TransitionLink";
import { useAuth } from "@/context/AuthContext";
import { ChapterCompleteDialog } from "@/features/quiz/components/ChapterCompleteDialog";
import { QuizButton } from "@/features/quiz/components/QuizButton";
import { QuizModal } from "@/features/quiz/components/QuizModal";
import { useTranslation } from "@/lib/i18n";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen, Film, Highlighter, List, MessageCircle, Pencil } from "lucide-react";
import React, { useEffect } from "react";
import AddMediaModal from "./components/AddMediaModal";
import AudioIsland from "./components/AudioIsland";
import BookInfoPopover from "../components/BookInfoPopover";
import ChaptersSidebar from "./components/ChaptersSidebar";
import ChatSidebar from "./components/ChatSidebar";
import HighlightsSidebar from "./components/HighlightsSidebar";
import MediaPanel from "./components/MediaPanel";
import PageEditModal from "./components/PageEditModal";
import PinVerifyModal from "./components/PinVerifyModal";
import ReaderContent from "./components/ReaderContent";
import ReaderNavigation from "./components/ReaderNavigation";
import SelectionTooltip from "./components/SelectionTooltip";
import VideoPopup from "./components/VideoPopup";
import useReaderController from "./hooks/useReaderController";
import type { MediaAnnotation } from "../types";

export default function ReaderFeature({ bookId }: { bookId: string }) {
  const c = useReaderController({ bookId });
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === "admin";
  const [focusedAnnotationId, setFocusedAnnotationId] = React.useState<string | null>(null);
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = React.useState(false);
  const [isAddingMedia, setIsAddingMedia] = React.useState(false);
  const [editingAnnotation, setEditingAnnotation] = React.useState<MediaAnnotation | null>(null);
  const [playingMedia, setPlayingMedia] = React.useState<MediaAnnotation | null>(null);
  const [attachedChatMedia, setAttachedChatMedia] = React.useState<MediaAnnotation | null>(null);

  // Admin page editing state
  const [pinVerified, setPinVerified] = React.useState(false);
  const [verifiedPin, setVerifiedPin] = React.useState("");
  const [showPinModal, setShowPinModal] = React.useState(false);
  const [showPageEditor, setShowPageEditor] = React.useState(false);
  const { currentPage, setActiveAnnotations } = c;

  const handlePassageClick = React.useCallback(
    (annotationId: string) => {
      setFocusedAnnotationId(annotationId);
      c.setChatOpen(false);
      c.setMediaPanelOpen(true);
    },
    [c],
  );

  const loadAnnotations = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/media-annotations?bookId=${bookId}&pageNumber=${currentPage}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setActiveAnnotations(data);
      } else {
        setActiveAnnotations([]);
      }
    } catch {
      setActiveAnnotations([]);
    }
  }, [bookId, currentPage, setActiveAnnotations]);

  // Load annotations for the current page
  useEffect(() => {
    loadAnnotations();
  }, [loadAnnotations]);

  // Pause global video when playingMedia is cleared or is not a video
  useEffect(() => {
    if (!playingMedia || playingMedia.mediaType !== "video") {
      const globalVideo =
        typeof document !== "undefined"
          ? (document.getElementById("historiart-global-video") as HTMLVideoElement)
          : null;
      if (globalVideo) {
        if (!globalVideo.paused) {
          globalVideo.pause();
        }
      }
    }
  }, [playingMedia]);

  const handleAddMediaSubmit = async (data: {
    mediaType: "image" | "video" | "audio" | "annotation";
    mediaUrl: string;
    caption: string;
    sources: string[];
  }) => {
    setIsAddingMedia(true);
    try {
      if (editingAnnotation) {
        // Edit mode
        const payload = {
          id: editingAnnotation.id,
          ...data,
        };
        const res = await fetch("/api/media-annotations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setIsAddMediaModalOpen(false);
          setEditingAnnotation(null);
          loadAnnotations();
        } else {
          alert("Failed to update media, make sure you are logged in as admin");
        }
      } else {
        // Create mode
        const payload = {
          bookId,
          pageNumber: c.currentPage,
          passageText: c.selectedText,
          mediaType: data.mediaType,
          mediaUrl: data.mediaUrl,
          caption: data.caption,
          sources: data.sources,
        };
        const res = await fetch("/api/media-annotations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setIsAddMediaModalOpen(false);
          loadAnnotations();
        } else {
          alert("Failed to add media, make sure you are logged in as admin");
        }
      }
    } catch {
      alert("Error saving media");
    } finally {
      setIsAddingMedia(false);
    }
  };

  const handleDeleteAnnotation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this annotation?")) return;
    try {
      const res = await fetch(`/api/media-annotations?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadAnnotations();
      } else {
        alert("Failed to delete annotation");
      }
    } catch {
      alert("Error deleting annotation");
    }
  };

  const handleEditAnnotation = (annotation: MediaAnnotation) => {
    setEditingAnnotation(annotation);
    setIsAddMediaModalOpen(true);
  };

  const openChatPanel = React.useCallback(() => {
    c.setMediaPanelOpen(false);
    setFocusedAnnotationId(null);
    c.setChatOpen(true);
  }, [c]);

  const attachTextToChat = React.useCallback(
    (text: string, source: "selection" | "highlight") => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setAttachedChatMedia({
        id: crypto.randomUUID(),
        bookId,
        mediaType: "annotation",
        caption: trimmed,
        passageText: trimmed,
        chatSource: source,
      });
      openChatPanel();
    },
    [bookId, openChatPanel],
  );

  const handleAddMediaCardToChat = React.useCallback(
    (annotation: MediaAnnotation) => {
      setAttachedChatMedia({ ...annotation, chatSource: "media" });
      openChatPanel();
    },
    [openChatPanel],
  );

  const rightSidebarOpen = c.mediaPanelOpen || c.chatOpen;

  return (
    <>
      <audio id="historiart-global-audio" preload="metadata" />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          position: "relative",
        }}
      >
        <SelectionTooltip
          selectionCoords={isAddMediaModalOpen ? null : c.selectionCoords}
          showCopied={c.showCopied}
          selectedText={c.selectedText}
          onCopy={c.copyToClipboard}
          onSendToChat={() => attachTextToChat(c.selectedText, "selection")}
          onHighlight={c.onHighlight}
          isAdmin={isAdmin}
          onAddMedia={() => setIsAddMediaModalOpen(true)}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            minHeight: "100vh",
            transition:
              "margin-right 0.4s cubic-bezier(0.4,0,0.2,1), margin-left 0.4s cubic-bezier(0.4,0,0.2,1)",
            marginRight: rightSidebarOpen ? "var(--sidebar-right-width)" : 0,
            marginLeft:
              c.highlightsSidebarOpen || c.chaptersSidebarOpen ? "var(--sidebar-left-width)" : 0,
          }}
        >
          {/* Top bar */}
          <div
            className="nav-glass"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 999,
              padding: "12px var(--toolbar-padding, 16px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              overflowX: "auto",
              whiteSpace: "nowrap",
              scrollbarWidth: "none", // hide scrollbar for firefox
            } as React.CSSProperties}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--toolbar-gap, 12px)" }}>
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
                  <span className="mobile-hide-text">{t("reader.library")}</span>
                </button>
              </TransitionLink>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--toolbar-gap-inner, 8px)" }}>
                <BookInfoPopover bookData={c.bookMetadata}>
                  <BookOpen size={16} color="var(--accent-primary)" />
                  <span className="mobile-hide-text" style={{ fontSize: 14, fontWeight: 600 }}>
                    {c.bookTitle || t("common.loading")}
                  </span>
                </BookInfoPopover>

                {c.chapters.length > 0 && (
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      c.setChaptersSidebarOpen((o: boolean) => !o);
                      c.setHighlightsSidebarOpen(false);
                    }}
                    style={{
                      padding: "4px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      marginLeft: "var(--toolbar-gap-inner, 8px)",
                      background: c.chaptersSidebarOpen ? "var(--bg-secondary)" : "transparent",
                    }}
                  >
                    <List size={14} /> <span className="mobile-hide-text">{t("reader.toc")}</span>
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--toolbar-gap, 12px)" }}>
              {/* Quiz Group */}
              <QuizButton
                currentChapter={c.currentViewingChapter}
                totalChapters={c.chapters.length}
                completedChapters={c.completedChapters}
                quizzesDone={c.quizzesDone}
                onOpenQuiz={(ch) => {
                  c.setActiveQuizChapter(ch);
                  c.setQuizModalOpen(true);
                }}
              />

              {/* Function Group */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--pill-gap, 6px)",
                  background: "var(--bg-tertiary)",
                  borderRadius: "var(--radius-full)",
                  padding: "var(--pill-padding, 6px)",
                  border: "1px solid var(--border-subtle)",
                } as React.CSSProperties}
              >
                {isAdmin && (
                  <button
                    className="toolbar-btn"
                    title={t("reader.edit")}
                    onClick={() => {
                      if (pinVerified) {
                        setShowPageEditor(true);
                      } else {
                        setShowPinModal(true);
                      }
                    }}
                  >
                    <Pencil size={20} />
                  </button>
                )}
                <button
                  className={`toolbar-btn ${c.highlightsSidebarOpen ? "active" : ""}`}
                  title={t("reader.notes")}
                  onClick={() => {
                    c.setHighlightsSidebarOpen((o: boolean) => !o);
                    c.setChaptersSidebarOpen(false);
                  }}
                >
                  <Highlighter size={20} />
                </button>
                {!c.chatOpen && (
                  <button
                    className={`toolbar-btn ${c.chatOpen ? "active" : ""}`}
                    title="Fable Chat"
                    onClick={openChatPanel}
                  >
                    <MessageCircle size={20} />
                  </button>
                )}
                {!c.mediaPanelOpen && (
                  <button
                    className={`toolbar-btn ${c.mediaPanelOpen ? "active" : ""}`}
                    title={t("reader.media")}
                    onClick={() => {
                      c.setChatOpen(false);
                      c.setMediaPanelOpen(true);
                    }}
                    style={{ position: "relative" }}
                  >
                    <Film size={20} />
                    {c.activeAnnotations.length > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "var(--accent-gradient)",
                          color: "white",
                          fontSize: 10,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {c.activeAnnotations.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <ReaderNavigation
            currentPage={c.currentPage}
            totalPages={c.totalPages}
            chatOpen={rightSidebarOpen}
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

          <div style={{ flex: 1, position: "relative" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={c.currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ width: "100%", height: "100%" }}
              >
                {c.pageLoading ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                    className="reader-content-padding"
                  >
                    <div style={{ maxWidth: 680, width: "100%", opacity: 0.5 }}>
                      {[...Array(3)].map((_, p) => (
                        <div key={p} style={{ marginBottom: 20 }}>
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              style={{
                                height: 20,
                                background: "var(--bg-secondary)",
                                borderRadius: 4,
                                marginBottom: 16,
                                width: i === 0 ? "95%" : i === 3 ? "70%" : "100%",
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ReaderContent
                    content={c.content}
                    currentPage={c.currentPage}
                    highlights={c.highlights.filter((h) => h.pageNumber === c.currentPage)}
                    onMouseUp={c.handleTextSelection}
                    onDoubleClick={c.handleDoubleClick}
                    annotations={c.activeAnnotations.map((a) => ({
                      id: a.id,
                      passageText: a.passageText,
                      mediaType: a.mediaType,
                    }))}
                    onPassageClick={handlePassageClick}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <ReaderNavigation
            currentPage={c.currentPage}
            totalPages={c.totalPages}
            chatOpen={rightSidebarOpen}
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
              chatEndRef={c.chatEndRef}
              messages={c.messages}
              typewriterFinishedRef={c.typewriterFinishedRef}
              isLoading={c.isLoading}
              isTyping={c.isTyping}
              input={c.input}
              onInputChange={c.onInputChange}
              onSubmitChat={async () => {
                const didSend = await c.onSendMessage(
                  undefined,
                  attachedChatMedia ? [attachedChatMedia] : c.activeAnnotations,
                );
                if (didSend) {
                  setAttachedChatMedia(null);
                }
              }}
              onStopResponse={c.onStopResponse}
              onClearChat={c.onClearChat}
              onClose={() => c.setChatOpen(false)}
              onLastMessageFinished={c.onLastMessageFinished}
              scrollToEnd={c.scrollToEnd}
              isAuthenticated={isAuthenticated}
              attachedMedia={attachedChatMedia}
              onClearAttachedMedia={() => setAttachedChatMedia(null)}
            />
          )}
          {c.mediaPanelOpen && (
            <MediaPanel
              key="media-panel"
              annotations={c.activeAnnotations}
              onClose={() => {
                c.setMediaPanelOpen(false);
                setFocusedAnnotationId(null);
              }}
              focusedAnnotationId={focusedAnnotationId}
              isAdmin={isAdmin}
              playingMedia={playingMedia}
              onPlayMedia={setPlayingMedia}
              onEdit={handleEditAnnotation}
              onDelete={handleDeleteAnnotation}
              onAddToChat={handleAddMediaCardToChat}
              onAddGeneralMedia={() => {
                setEditingAnnotation(null);
                window.getSelection()?.removeAllRanges();
                setIsAddMediaModalOpen(true);
              }}
            />
          )}
          {c.highlightsSidebarOpen && (
            <HighlightsSidebar
              key="highlights-sidebar"
              highlights={c.highlights}
              onClose={() => c.setHighlightsSidebarOpen(false)}
              onDeleteHighlight={c.onDeleteHighlight}
              onClearAll={c.onClearAllHighlights}
              onSendToChat={(text) => attachTextToChat(text, "highlight")}
              onNavigate={c.jumpToPage}
            />
          )}
          {c.chaptersSidebarOpen && (
            <ChaptersSidebar
              key="chapters-sidebar"
              chapters={c.chapters}
              currentPage={c.currentPage}
              onClose={() => c.setChaptersSidebarOpen(false)}
              onNavigate={c.jumpToPage}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!rightSidebarOpen && playingMedia?.mediaType === "audio" && (
            <AudioIsland
              key="audio-island"
              annotation={playingMedia}
              onClose={() => setPlayingMedia(null)}
            />
          )}
          {!rightSidebarOpen && playingMedia?.mediaType === "video" && (
            <VideoPopup
              key="video-popup"
              annotation={playingMedia}
              onClose={() => setPlayingMedia(null)}
            />
          )}
        </AnimatePresence>

        <AddMediaModal
          isOpen={isAddMediaModalOpen}
          onClose={() => {
            setIsAddMediaModalOpen(false);
            setEditingAnnotation(null);
          }}
          passageText={editingAnnotation?.passageText || c.selectedText}
          onSubmit={handleAddMediaSubmit}
          isSubmitting={isAddingMedia}
          editData={editingAnnotation}
        />

        {/* Admin 2FA PIN Verification */}
        <PinVerifyModal
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onVerified={(pin: string) => {
            setVerifiedPin(pin);
            setPinVerified(true);
            setShowPinModal(false);
            setShowPageEditor(true);
          }}
        />

        {/* Admin Page Editor */}
        <PageEditModal
          isOpen={showPageEditor}
          onClose={() => {
            setShowPageEditor(false);
          }}
          bookId={bookId}
          pageNumber={c.currentPage}
          initialContent={c.content}
          pin={verifiedPin}
          onSaved={(newContent) => {
            c.setContent(newContent);
          }}
        />

        <ChapterCompleteDialog
          isOpen={c.showChapterCompleteDialog}
          chapterNumber={c.activeQuizChapter}
          bookId={bookId}
          onStartQuiz={() => {
            c.setShowChapterCompleteDialog(false);
            c.setQuizModalOpen(true);
          }}
          onSkip={() => c.setShowChapterCompleteDialog(false)}
          onDontShowAgain={() => {
            c.setSuppressQuizPopup(true);
            c.setShowChapterCompleteDialog(false);
          }}
        />

        <QuizModal
          isOpen={c.quizModalOpen}
          bookId={bookId}
          chapterNumber={c.activeQuizChapter}
          onClose={() => c.setQuizModalOpen(false)}
        />
      </div>
      <PageMountSignaler />
    </>
  );
}
