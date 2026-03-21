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
        padding: "48px 24px",
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
            {content.split("\n\n").map((paragraph, i) => {
              let elements: (string | React.ReactNode)[] = [paragraph];
              
              highlights.forEach((h) => {
                const searchString = h.text;
                if (!searchString) return;
                
                const newElements: (string | React.ReactNode)[] = [];
                elements.forEach((el, index) => {
                  if (typeof el === "string") {
                    const parts = el.split(searchString);
                    parts.forEach((part, partIndex) => {
                      newElements.push(part);
                      if (partIndex < parts.length - 1) {
                        newElements.push(
                          <mark
                            key={`${h.id}-${i}-${index}-${partIndex}`}
                            style={{
                              backgroundColor: h.color,
                              color: "#000",
                              padding: "2px 0",
                              borderRadius: "2px",
                              mixBlendMode: "multiply",
                            }}
                          >
                            {searchString}
                          </mark>
                        );
                      }
                    });
                  } else {
                    newElements.push(el);
                  }
                });
                elements = newElements;
              });

              return (
                <p
                  key={i}
                  style={{ marginBottom: 20, textIndent: i > 0 ? "2em" : 0, textAlign: "justify" }}
                >
                  {elements}
                </p>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

ReaderContent.displayName = "ReaderContent";

export default ReaderContent;

