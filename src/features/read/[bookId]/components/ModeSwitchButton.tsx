"use client";

import React, { memo } from "react";
import { MessageCircle, Mic } from "lucide-react";
import type { InteractionMode } from "../types";

type ModeSwitchButtonProps = {
  mode: InteractionMode;
  onChange: (m: InteractionMode) => void;
};

const ModeSwitchButton = memo(function ModeSwitchButton({
  mode,
  onChange,
}: ModeSwitchButtonProps) {
  const isVoice = mode === "voice";
  return (
    <button
      onClick={() => onChange(isVoice ? "chat" : "voice")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 18px",
        borderRadius: "var(--radius-full)",
        border: "1.5px solid var(--border-subtle)",
        background: "var(--bg-tertiary)",
        color: "var(--text-secondary)",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.2s, color 0.2s, border-color 0.2s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "var(--accent-primary)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "var(--border-subtle)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
      }}
    >
      {isVoice ? <MessageCircle size={14} /> : <Mic size={14} />}
      Switch to {isVoice ? "Chat" : "Voice"}
    </button>
  );
});

ModeSwitchButton.displayName = "ModeSwitchButton";

export default ModeSwitchButton;

