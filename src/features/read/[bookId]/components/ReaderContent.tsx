"use client";

import React, { memo } from "react";
import type { Highlight } from "./HighlightsSidebar";

type ContentElement = {
  text: string;
  isHighlight: boolean;
  isPassage?: boolean;
  annotationId?: string;
  mediaType?: string;
  color?: string;
};

type ReaderContentProps = {
  content: string;
  currentPage: number;
  highlights: Highlight[];
  onMouseUp: () => void;
  onDoubleClick: () => void;
  annotations: Array<{ id: string; passageText?: string; mediaType: string }>;
  onPassageClick: (annotationId: string) => void;
};

const ReaderContent = memo(function ReaderContent({
  content,
  currentPage,
  highlights,
  onMouseUp,
  onDoubleClick,
  annotations,
  onPassageClick,
}: ReaderContentProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px 80px",
      }}
    >
      <div
        key={currentPage}
        style={{
          maxWidth: 680,
          width: "100%",
        }}
        onMouseUp={onMouseUp}
        onDoubleClick={onDoubleClick}
      >
        <div className="reading-text">
          {(() => {
            if (!content) return null;

            // 1. Create a map of character states
            const marks = Array.from({ length: content.length }, () => ({
              isHighlight: false,
              color: "",
              isPassage: false,
              annotationId: "",
              mediaType: "",
            }));

            // Helper to normalise newlines for searching
            const findMatches = (searchStr: string) => {
              if (!searchStr) return { matches: [], length: 0 };
              let normalized = searchStr;
              if (normalized.includes("\n") && !normalized.includes("\n\n")) {
                normalized = normalized.replace(/\n+/g, "\n\n");
              }
              const matches: number[] = [];
              let idx = content.indexOf(normalized);
              while (idx !== -1) {
                matches.push(idx);
                idx = content.indexOf(normalized, idx + 1);
              }
              return { matches, length: normalized.length };
            };

            // 2. Apply user highlights
            highlights.forEach((h) => {
              const { matches, length } = findMatches(h.text);
              matches.forEach((idx) => {
                for (let i = idx; i < idx + length; i++) {
                  if (marks[i]) {
                    marks[i].isHighlight = true;
                    marks[i].color = h.color || "";
                  }
                }
              });
            });

            // 3. Apply annotations
            annotations.forEach((a) => {
              const { matches, length } = findMatches(a.passageText || "");
              matches.forEach((idx) => {
                for (let i = idx; i < idx + length; i++) {
                  if (marks[i]) {
                    marks[i].isPassage = true;
                    marks[i].annotationId = a.id;
                    marks[i].mediaType = a.mediaType;
                  }
                }
              });
            });

            // 4. Chunk contiguous states
            const chunks: ContentElement[] = [];
            let currentChunk: ContentElement | null = null;

            for (let i = 0; i < content.length; i++) {
              const m = marks[i];
              const char = content[i];

              if (!currentChunk) {
                currentChunk = { text: char, ...m };
              } else if (
                currentChunk.isHighlight === m.isHighlight &&
                currentChunk.isPassage === m.isPassage &&
                currentChunk.annotationId === m.annotationId &&
                currentChunk.color === m.color
              ) {
                currentChunk.text += char;
              } else {
                chunks.push(currentChunk);
                currentChunk = { text: char, ...m };
              }
            }
            if (currentChunk) chunks.push(currentChunk);

            // 5. Build paragraphs
            const paragraphs: React.ReactNode[][] = [[]];

            chunks.forEach((el, elIdx) => {
              const parts = el.text.split("\n\n");
              parts.forEach((partText, partIdx) => {
                if (partIdx > 0) {
                  paragraphs.push([]); // start new paragraph
                }
                if (partText) {
                  // Render based on state (can be BOTH!)
                  let node: React.ReactNode = partText;

                  // If it's a passage trigger, wrap it
                  if (el.isPassage) {
                    node = (
                      <span
                        key={`passage-inner-${elIdx}-${partIdx}`}
                        data-passage-id={el.annotationId}
                        className="passage-trigger"
                        onClick={(e) => {
                          // Prevent highlight from intercepting if nested
                          e.stopPropagation();
                          if (el.annotationId) onPassageClick(el.annotationId);
                        }}
                        title={
                          el.mediaType === "audio"
                            ? "🎵 Nhấn để xem âm thanh liên quan"
                            : el.mediaType === "video"
                              ? "🎬 Nhấn để xem video liên quan"
                              : el.mediaType === "image"
                                ? "🖼 Nhấn để xem hình ảnh liên quan"
                                : "📝 Nhấn để xem chú thích"
                        }
                      >
                        {node}
                      </span>
                    );
                  }

                  // If it's a highlight, wrap it (it can wrap the passage trigger)
                  if (el.isHighlight) {
                    node = (
                      <mark
                        key={`mark-inner-${elIdx}-${partIdx}`}
                        style={{
                          backgroundColor: el.color,
                          color: "#111", // high contrast text for light mark backgrounds
                          padding: "2px 0",
                          borderRadius: "2px",
                        }}
                      >
                        {node}
                      </mark>
                    );
                  }

                  paragraphs[paragraphs.length - 1].push(
                    <React.Fragment key={`frag-${elIdx}-${partIdx}`}>{node}</React.Fragment>,
                  );
                }
              });
            });

            return paragraphs.map((pContent, idx) => {
              if (pContent.length === 0) return null; // skip empty paragraphs
              return (
                <p
                  key={idx}
                  style={{
                    marginBottom: 20,
                    textIndent: idx > 0 ? "2em" : 0,
                    textAlign: "justify",
                  }}
                >
                  {pContent}
                </p>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
});

ReaderContent.displayName = "ReaderContent";

export default ReaderContent;
