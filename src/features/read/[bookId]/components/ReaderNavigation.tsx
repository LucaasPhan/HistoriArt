"use client";

import React, { memo, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ReaderNavigationProps = {
  currentPage: number;
  totalPages: number;
  chatOpen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJumpTo: (page: number) => void;
};

const ReaderNavigation = memo(function ReaderNavigation({
  currentPage,
  totalPages,
  chatOpen,
  onPrev,
  onNext,
  onJumpTo,
}: ReaderNavigationProps) {
  const dotsCount = useMemo(() => Math.min(totalPages, 12), [totalPages]);

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
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: dotsCount }, (_, i) => {
            const page = i + 1;
            const isActive = currentPage === page;
            return (
              <button
                key={i}
                onClick={() => onJumpTo(page)}
                style={{
                  width: isActive ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: "none",
                  background: isActive
                    ? "var(--accent-primary)"
                    : "var(--border-subtle)",
                  transition: "all 0.3s",
                  cursor: "pointer",
                }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
});

ReaderNavigation.displayName = "ReaderNavigation";

export default ReaderNavigation;

