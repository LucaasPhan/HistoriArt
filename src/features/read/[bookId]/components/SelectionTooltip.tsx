"use client";

import React, { memo } from "react";
import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type SelectionCoords = { x: number; y: number };

type SelectionTooltipProps = {
  selectionCoords: SelectionCoords | null;
  showCopied: boolean;
  onCopy: () => void;
};

const SelectionTooltip = memo(function SelectionTooltip({
  selectionCoords,
  showCopied,
  onCopy,
}: SelectionTooltipProps) {
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
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
                <Copy size={14} />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
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

