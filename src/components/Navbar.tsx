"use client";

import { BookOpen, Sparkles, Home, Search, Settings as Cog } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeButton } from "./ThemeButton";
import { TransitionLink } from "./TransitionLink";
import UserMenu from "./UserMenu";

export function Navbar() {
  const pathname = usePathname();
  const isReader = pathname?.startsWith("/read");

  if (isReader) return null; // hide nav in reader mode

  return (
    <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TransitionLink
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "var(--text-primary)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookOpen size={20} color="white" />
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            Lit<span className="gradient-text">Companion</span>
          </span>
        </TransitionLink>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <ThemeButton />

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TransitionLink href="/dashboard">
              <button className="btn-ghost" style={{ fontSize: 14 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Home size={14} />
                  Dashboard
                </span>
              </button>
            </TransitionLink>

            <TransitionLink href="/library">
              <button className="btn-ghost" style={{ fontSize: 14 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={14} />
                  Library
                </span>
              </button>
            </TransitionLink>
            <TransitionLink href="/search">
              <button className="btn-ghost" style={{ fontSize: 14 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Search size={14} />
                  Search
                </span>
              </button>
            </TransitionLink>

            <TransitionLink href="/settings">
              <button className="btn-ghost" style={{ fontSize: 14 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Cog size={14} />
                  Settings
                </span>
              </button>
            </TransitionLink>

            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
