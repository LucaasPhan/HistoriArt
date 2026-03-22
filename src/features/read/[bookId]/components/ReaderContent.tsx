"use client";

import React, { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Highlight } from "./HighlightsSidebar";

type ReaderContentProps = {
  content: string;
  currentPage: number;
  pageDirection: "next" | "prev";
  highlights: Highlight[];
  onMouseUp: () => void;
  onDoubleClick: () => void;
};

const ReaderContent = memo(function ReaderContent({
  content,
  currentPage,
  pageDirection,
  highlights,
  onMouseUp,
  onDoubleClick,
}: ReaderContentProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: pageDirection === "next" ? 60 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: pageDirection === "next" ? -60 : 60 }}
          transition={{ duration: 0.35 }}
          className="glass"
          style={{
            maxWidth: 700,
            width: "100%",
            borderRadius: "var(--radius-xl)",
            padding: "48px 52px",
            minHeight: 400,
          }}
          onMouseUp={onMouseUp}
          onDoubleClick={onDoubleClick}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 24,
              fontWeight: 600,
            }}
          >
            Page {currentPage}
          </div>
          <div className="reading-text">
            {(() => {
              let elements: { text: string; isHighlight: boolean; color?: string; id?: string }[] = [
                { text: content, isHighlight: false }
              ];
              
              highlights.forEach((h) => {
                const searchString = h.text;
                if (!searchString) return;
                
                const newElements: typeof elements = [];
                
                elements.forEach(el => {
                  if (el.isHighlight) {
                    newElements.push(el);
                    return;
                  }
                  
                  let parts = el.text.split(searchString);
                  let usedSearch = searchString;
                  
                  // Fallback for browsers returning \n instead of \n\n for cross-paragraph selection
                  if (parts.length === 1 && searchString.includes('\n') && !searchString.includes('\n\n')) {
                    usedSearch = searchString.replace(/\n+/g, '\n\n');
                    parts = el.text.split(usedSearch);
                  }
                  
                  parts.forEach((part, idx) => {
                    if (part) newElements.push({ text: part, isHighlight: false });
                    if (idx < parts.length - 1) {
                      newElements.push({
                        text: usedSearch,
                        isHighlight: true,
                        color: h.color,
                        id: h.id
                      });
                    }
                  });
                });
                elements = newElements;
              });
              
              const paragraphs: React.ReactNode[][] = [[]];
              
              elements.forEach((el, elIdx) => {
                const parts = el.text.split('\n\n');
                parts.forEach((partText, partIdx) => {
                  if (partIdx > 0) {
                    paragraphs.push([]); // start new paragraph
                  }
                  if (partText) {
                    if (el.isHighlight) {
                      paragraphs[paragraphs.length - 1].push(
                        <mark
                          key={`mark-${elIdx}-${partIdx}`}
                          style={{
                            backgroundColor: el.color,
                            color: "#111", // high contrast text for light mark backgrounds
                            padding: "2px 0",
                            borderRadius: "2px",
                          }}
                        >
                          {partText}
                        </mark>
                      );
                    } else {
                      paragraphs[paragraphs.length - 1].push(partText);
                    }
                  }
                });
              });
              
              return paragraphs.map((pContent, idx) => {
                if (pContent.length === 0) return null; // skip empty paragraphs
                return (
                  <p
                    key={idx}
                    style={{ marginBottom: 20, textIndent: idx > 0 ? "2em" : 0, textAlign: "justify" }}
                  >
                    {pContent}
                  </p>
                );
              });
            })()}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

ReaderContent.displayName = "ReaderContent";

export default ReaderContent;

