"use client";

import { Moon, Sun } from "lucide-react";
import React from "react";
import { useTheme } from "./ThemeProvider";

export function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border-subtle)",
        }}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: "var(--bg-tertiary)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "50%",
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "var(--text-primary)",
        transition: "all 0.2s",
      }}
      aria-label="Toggle Theme"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
