import React, { memo } from "react";
import { Check, Copy, MessageCircle, MoreVertical, Sparkles, BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InteractionMode } from "../types";

type SelectionCoords = { x: number; y: number };

type SelectionTooltipProps = {
  selectionCoords: SelectionCoords | null;
  showCopied: boolean;
  selectedText: string;
  onCopy: () => void;
  onSendToChat: () => void;
  onHighlight: (color: string) => void;
  onLookUp: () => void;
  interactionMode: InteractionMode;
};

const SelectionTooltip = memo(function SelectionTooltip({
  selectionCoords,
  showCopied,
  selectedText,
  onCopy,
  onSendToChat,
  onHighlight,
  onLookUp,
  interactionMode,
}: SelectionTooltipProps) {
  const isSingleWord = selectedText.trim().split(/\s+/).length === 1 && selectedText.trim().length > 0;
  return (
    <AnimatePresence>
      {selectionCoords && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 5 }}
          style={{
            position: "fixed",
            left: selectionCoords.x,
            top: selectionCoords.y,
            transform: "translateX(-50%)",
            zIndex: 100,
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-lg)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                }}
              >
                {showCopied ? (
                  <>
                    <Check size={14} color="#10b981" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} color="var(--accent-primary)" />
                    <span>AI Buddy</span>
                    <MoreVertical size={14} style={{ marginLeft: 4, opacity: 0.6 }} />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="bg-(--bg-secondary) border-(--border-subtle) text-(--text-primary) min-w-48 shadow-lg backdrop-blur-md flex flex-col gap-4 p-2!"
            >
              <div style={{ display: "flex", gap: 8, padding: "4px 8px", justifyContent: "center" }}>
                {["#fef08a", "#bbf7d0", "#fbcfe8", "#bfdbfe"].map(color => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.stopPropagation();
                      onHighlight(color);
                    }}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: color,
                      border: "1px solid rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      transition: "transform 0.1s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    aria-label={`Highlight with ${color}`}
                  />
                ))}
              </div>
              <div style={{ height: 1, background: "var(--border-subtle)", margin: "4px 0" }} />
              {isSingleWord && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onLookUp();
                  }}
                >
                  <BookOpen size={14} className="mr-2" />
                  <span>Look Up</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy();
                }}
              >
                <Copy size={14} className="mr-2" />
                <span>Copy to Clipboard</span>
              </DropdownMenuItem>
              {interactionMode === "chat" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendToChat();
                  }}
                >
                  <MessageCircle size={14} className="mr-2" />
                  <span>Send to AI Chat</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 12,
              height: 12,
              background: "var(--bg-secondary)",
              borderRight: "1px solid var(--border-subtle)",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

SelectionTooltip.displayName = "SelectionTooltip";

export default SelectionTooltip;


