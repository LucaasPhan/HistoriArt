"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import { ThemeButton } from "@/components/ThemeButton";
import { TransitionLink } from "@/components/TransitionLink";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen, Film, Highlighter, List, Pencil } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import AddMediaModal from "./components/AddMediaModal";
import ChaptersSidebar from "./components/ChaptersSidebar";
import HighlightsSidebar from "./components/HighlightsSidebar";
import MediaPanel from "./components/MediaPanel";
import PageEditModal from "./components/PageEditModal";
import PinVerifyModal from "./components/PinVerifyModal";
import ReaderContent from "./components/ReaderContent";
import ReaderNavigation from "./components/ReaderNavigation";
import SelectionTooltip from "./components/SelectionTooltip";
import useReaderController from "./hooks/useReaderController";
import type { MediaAnnotation } from "./types";

export default function ReaderFeature({ bookId }: { bookId: string }) {
  const c = useReaderController({ bookId });
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [focusedAnnotationId, setFocusedAnnotationId] = React.useState<string | null>(null);
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = React.useState(false);
  const [isAddingMedia, setIsAddingMedia] = React.useState(false);
  const [editingAnnotation, setEditingAnnotation] = React.useState<MediaAnnotation | null>(null);

  // Admin page editing state
  const [pinVerified, setPinVerified] = React.useState(false);
  const [verifiedPin, setVerifiedPin] = React.useState("");
  const [showPinModal, setShowPinModal] = React.useState(false);
  const [showPageEditor, setShowPageEditor] = React.useState(false);

  const handlePassageClick = React.useCallback(
    (annotationId: string) => {
      setFocusedAnnotationId(annotationId);
      c.setMediaPanelOpen(true);
    },
    [c],
  );

  const loadAnnotations = React.useCallback(async () => {
    try {
      const res = await fetch(
        `/api/media-annotations?bookId=${bookId}&pageNumber=${c.currentPage}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        c.setActiveAnnotations(data);
      } else {
        c.setActiveAnnotations([]);
      }
    } catch (e) {
      c.setActiveAnnotations([]);
    }
  }, [bookId, c.currentPage]); // omit `c` because `setActiveAnnotations` is stable and `c` triggers full re-eval

  // Load annotations for the current page
  useEffect(() => {
    loadAnnotations();
  }, [loadAnnotations]);

  const handleAddMediaSubmit = async (data: {
    mediaType: "image" | "video" | "audio" | "annotation";
    mediaUrl: string;
    caption: string;
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
          ...data,
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
    } catch (e) {
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
    } catch (e) {
      alert("Error deleting annotation");
    }
  };

  const handleEditAnnotation = (annotation: MediaAnnotation) => {
    setEditingAnnotation(annotation);
    setIsAddMediaModalOpen(true);
  };



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
          selectionCoords={isAddMediaModalOpen ? null : c.selectionCoords}
          showCopied={c.showCopied}
          selectedText={c.selectedText}
          onCopy={c.copyToClipboard}
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
            marginRight: c.mediaPanelOpen ? 480 : 0,
            marginLeft: c.highlightsSidebarOpen || c.chaptersSidebarOpen ? 320 : 0,
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
                  Thư viện
                </button>
              </TransitionLink>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {c.bookTitle || "Đang tải..."}
                </span>

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
                      marginLeft: 8,
                      background: c.chaptersSidebarOpen ? "var(--bg-secondary)" : "transparent",
                    }}
                  >
                    <List size={14} /> Mục lục
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ThemeButton />
              {isAdmin && (
                <button
                  className="btn-ghost"
                  onClick={() => {
                    if (pinVerified) {
                      setShowPageEditor(true);
                    } else {
                      setShowPinModal(true);
                    }
                  }}
                  style={{
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "var(--accent-primary)",
                    border: "1px solid var(--accent-primary)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <Pencil size={14} />
                  Chỉnh sửa trang
                </button>
              )}
              <button
                className="btn-ghost"
                onClick={() => {
                  c.setHighlightsSidebarOpen((o: boolean) => !o);
                  c.setChaptersSidebarOpen(false);
                }}
                style={{
                  padding: "6px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  background: c.highlightsSidebarOpen ? "var(--bg-secondary)" : "transparent",
                }}
              >
                <Highlighter size={14} />
                Ghi chú
              </button>
              {!c.mediaPanelOpen && (
                <button
                  className="btn-ghost"
                  onClick={() => c.setMediaPanelOpen(true)}
                  style={{
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "var(--accent-primary)",
                  }}
                >
                  <Film size={14} />
                  Tư liệu
                  {c.activeAnnotations.length > 0 && (
                    <span
                      style={{
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

          <ReaderNavigation
            currentPage={c.currentPage}
            totalPages={c.totalPages}
            chatOpen={c.mediaPanelOpen}
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
              </motion.div>
            </AnimatePresence>
          </div>

          <ReaderNavigation
            currentPage={c.currentPage}
            totalPages={c.totalPages}
            chatOpen={c.mediaPanelOpen}
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
              onEdit={handleEditAnnotation}
              onDelete={handleDeleteAnnotation}
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
          onClose={() => {setShowPageEditor(false)}}
          bookId={bookId}
          pageNumber={c.currentPage}
          initialContent={c.content}
          pin={verifiedPin}
          onSaved={(newContent) => {
            c.setContent(newContent);
          }}
        />
      </div>
      <PageMountSignaler />
    </>
  );
}
