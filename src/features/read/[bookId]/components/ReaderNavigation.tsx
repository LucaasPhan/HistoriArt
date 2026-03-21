"use client";

import React, { memo, useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ReaderNavigationProps = {
  currentPage: number;
  totalPages: number;
  chatOpen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJumpTo: (page: number) => void;
  content: string;
  bookTitle: string;
  bookId: string;
  highlightedText?: string;
  isAuthenticated?: boolean;
};

import VisualizeButton from "./VisualizeButton";

const ReaderNavigation = memo(function ReaderNavigation({
  currentPage,
  totalPages,
  chatOpen,
   onPrev,
  onNext,
  onJumpTo,
  content,
  bookTitle,
  bookId,
  highlightedText,
  isAuthenticated,
}: ReaderNavigationProps) {
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageInput, setPageInput] = useState(currentPage.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    if (isEditingPage && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingPage]);

  const handlePageSubmit = (e?: React.SyntheticEvent) => {
    if (e && "preventDefault" in e) e.preventDefault();
    
    if (pageInput.trim() === "") {
      setPageInput(currentPage.toString());
      setIsEditingPage(false);
      return;
    }

    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      if (pageNum !== currentPage) {
        onJumpTo(pageNum);
      } else {
        setPageInput(currentPage.toString());
      }
    } else {
      setPageInput(currentPage.toString());
    }
    setIsEditingPage(false);
  };

  return (
    <>
      <button
        onClick={() => {
          if (currentPage > 1) onPrev();
        }}
        className={`nav-zone nav-zone-left ${currentPage <= 1 ? "disabled" : ""}`}
        aria-label="Previous Page"
      >
        <ChevronLeft size={48} style={{ opacity: 0.4 }} />
      </button>
      <button
        onClick={() => {
          if (currentPage < totalPages) onNext();
        }}
        className={`nav-zone nav-zone-right ${
          currentPage >= totalPages ? "disabled" : ""
        }`}
        style={{ right: chatOpen ? 380 : 0 }}
        aria-label="Next Page"
      >
        <ChevronRight size={48} style={{ opacity: 0.4 }} />
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "14px", color: "var(--text-secondary)", fontFamily: "var(--font-mono, monospace)" }}>
          {isEditingPage ? (
            <form onSubmit={handlePageSubmit} style={{ margin: 0 }}>
              <input
                ref={inputRef}
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={handlePageSubmit}
                style={{
                  width: "50px",
                  textAlign: "center",
                  background: "transparent",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "4px",
                  color: "var(--text-primary)",
                  padding: "4px",
                  fontFamily: "inherit",
                }}
              />
            </form>
          ) : (
            <span 
              onClick={() => setIsEditingPage(true)}
              style={{ cursor: "pointer", fontWeight: 600, color: "var(--text-primary)", textDecoration: "underline", textUnderlineOffset: 4, textDecorationColor: "var(--border-subtle)" }}
              title="Jump to page"
            >
              {currentPage}
            </span>
          )}
          <span>of {totalPages}</span>
        </div>

        <VisualizeButton 
          content={content} 
          bookTitle={bookTitle} 
          bookId={bookId} 
          currentPage={currentPage} 
          highlightedText={highlightedText}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </>
  );
});

ReaderNavigation.displayName = "ReaderNavigation";

export default ReaderNavigation;