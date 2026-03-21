"use client";

import React, { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ReaderContentProps = {
  content: string;
  currentPage: number;
  pageDirection: "next" | "prev";
  onMouseUp: () => void;
  onDoubleClick: () => void;
};

const ReaderContent = memo(function ReaderContent({
  content,
  currentPage,
  pageDirection,
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
            {content.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                style={{ marginBottom: 20, textIndent: i > 0 ? "2em" : 0 }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

ReaderContent.displayName = "ReaderContent";

export default ReaderContent;

