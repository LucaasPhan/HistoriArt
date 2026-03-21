"use client";

import React, { memo, useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ReaderNavigationProps = {
  currentPage: number;
  totalPages: number;
  chatOpen: boolean;
  highlightsSidebarOpen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJumpTo: (page: number) => void;
  content: string;
  bookTitle: string;
  bookId: string;
  highlightedText?: string;
  isAuthenticated?: boolean;
};

const ReaderNavigation = memo(function ReaderNavigation({
  currentPage,
  totalPages,
  chatOpen,
  highlightsSidebarOpen,
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "16px 0", padding: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: "14px", color: "var(--text-secondary)", fontFamily: "var(--font-mono, monospace)" }}>
        <button
          onClick={() => {
            if (currentPage > 1) onPrev();
          }}
          disabled={currentPage <= 1}
          style={{
            cursor: currentPage <= 1 ? "not-allowed" : "pointer",
            opacity: currentPage <= 1 ? 0.3 : 1,
            background: "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            padding: "4px",
            color: "var(--text-primary)"
          }}
          aria-label="Previous Page"
        >
          <ChevronLeft size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

        <button
          onClick={() => {
            if (currentPage < totalPages) onNext();
          }}
          disabled={currentPage >= totalPages}
          style={{
            cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
            opacity: currentPage >= totalPages ? 0.3 : 1,
            background: "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            padding: "4px",
            color: "var(--text-primary)"
          }}
          aria-label="Next Page"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
});

ReaderNavigation.displayName = "ReaderNavigation";

export default ReaderNavigation;