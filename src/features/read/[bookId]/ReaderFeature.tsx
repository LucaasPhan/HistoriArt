"use client";

import React, { useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Film, Highlighter } from "lucide-react";
import { SAMPLE_BOOKS } from "@/lib/sample-books";
import { getSeedAnnotationsForPage } from "@/lib/seed-annotations";
import { ThemeButton } from "@/components/ThemeButton";
import { TransitionLink } from "@/components/TransitionLink";
import PageMountSignaler from "@/components/PageMountSignaler";
import SelectionTooltip from "./components/SelectionTooltip";
import ReaderContent from "./components/ReaderContent";
import ReaderNavigation from "./components/ReaderNavigation";
import HighlightsSidebar from "./components/HighlightsSidebar";
import MediaPanel from "./components/MediaPanel";
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

  // Load annotations for the current page
  useEffect(() => {
    const annotations = getSeedAnnotationsForPage(bookId, c.currentPage);
    c.setActiveAnnotations(annotations);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, c.currentPage]);

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
          selectionCoords={c.selectionCoords}
          showCopied={c.showCopied}
          selectedText={c.selectedText}
          onCopy={c.copyToClipboard}
          onHighlight={c.onHighlight}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            minHeight: "100vh",
            transition: "margin-right 0.4s cubic-bezier(0.4,0,0.2,1), margin-left 0.4s cubic-bezier(0.4,0,0.2,1)",
            marginRight: c.mediaPanelOpen ? 380 : 0,
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
                  Thư viện
                </button>
              </TransitionLink>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {c.bookTitle || "Đang tải..."}
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
                    <span style={{
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
                    }}>
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
              onClose={() => c.setMediaPanelOpen(false)}
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
        </AnimatePresence>
      </div>
      <PageMountSignaler />
    </>
  );
}
