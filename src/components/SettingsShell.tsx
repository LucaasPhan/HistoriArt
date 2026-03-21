"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/TransitionLink";
import { User, BookOpen, Volume2, Lock, Settings } from "lucide-react";
import "@/app/settings/settings.css";

const NAV_ITEMS = [
  { label: "General", href: "/settings", icon: Settings },
  { label: "Account", href: "/settings/account", icon: User },
  { label: "Reader Preferences", href: "/settings/reader-preferences", icon: BookOpen },
  { label: "Voice & TTS", href: "/settings/voice-tts", icon: Volume2 },
  { label: "Security", href: "/settings/security", icon: Lock },
];

export default function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="settings-container">
      <aside className="settings-sidebar">
        <h1 className="settings-sidebar-title">Settings</h1>
        <nav>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <TransitionLink
                key={item.href}
                href={item.href}
                className={`settings-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} style={{ marginRight: 12, opacity: isActive ? 1 : 0.7 }} />
                {item.label}
              </TransitionLink>
            );
          })}
        </nav>
      </aside>
      <main className="settings-main">
        {children}
      </main>
    </div>
  );
}
