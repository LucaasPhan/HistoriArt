"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

interface VoiceDropdownProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export default function VoiceDropdown({ value, onChange, options }: VoiceDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="settings-input"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", height: 46 }}
      >
        <span style={{ color: value ? "var(--text-primary)" : "var(--text-tertiary)" }}>
          {selected?.label || "Select a voice"}
        </span>
        <ChevronDown size={16} style={{ color: "var(--text-secondary)", flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 10,
            overflow: "hidden",
            zIndex: 50,
            boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
            maxHeight: 300,
            overflowY: "auto",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                color: opt.value === "" ? "var(--text-tertiary)" : "var(--text-primary)",
                fontSize: 14,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {opt.label}
              {value === opt.value && <Check size={16} style={{ color: "var(--text-secondary)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
