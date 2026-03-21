import React from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { Highlight } from "./HighlightsSidebar";

type HighlightItemProps = {
  highlight: Highlight;
  onDeleteHighlight?: (id: string) => void;
  onSendToChat?: (text: string) => void;
  onNavigate?: (pageNumber: number) => void;
};

export function HighlightItem({
  highlight,
  onDeleteHighlight,
  onSendToChat,
  onNavigate,
}: HighlightItemProps) {
  return (
    <div
      onClick={() => onNavigate?.(highlight.pageNumber)}
      className="highlight-item"
      style={{
        background: "var(--bg-tertiary)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        cursor: "var(--cursor-pointer)",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: highlight.color,
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: "var(--text-tertiary)",
              fontWeight: 500,
            }}
          >
            Page {highlight.pageNumber} • {new Date(highlight.createdAt).toLocaleDateString()} {new Date(highlight.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {onSendToChat && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSendToChat(highlight.text);
              }}
              className="btn-ghost"
              style={{ padding: 4, color: "var(--accent-primary)" }}
              aria-label="Send to chat"
            >
              <MessageCircle size={14} />
            </button>
          )}
          {onDeleteHighlight && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteHighlight(highlight.id);
              }}
              className="btn-ghost"
              style={{ padding: 4, color: "var(--text-error)" }}
              aria-label="Delete highlight"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <p
        style={{
          fontSize: 14,
          margin: 0,
          lineHeight: 1.5,
          paddingLeft: 8,
          borderLeft: `3px solid ${highlight.color}`,
        }}
      >
        {highlight.text}
      </p>
    </div>
  );
}
