"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Lock, Settings, User } from "lucide-react";
import "@/features/settings/settings.css";

import AccountTab from "@/features/settings/tabs/AccountTab";
import GeneralTab from "@/features/settings/tabs/GeneralTab";
import PreferencesTab from "@/features/settings/tabs/PreferencesTab";
import SecurityTab from "@/features/settings/tabs/SecurityTab";

/* ── Main Settings Page ────────────────────────────────────── */
export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <>
      <div className="settings-container">
        <Tabs defaultValue="general" orientation="vertical" style={{ display: "contents" }}>
          {/* ── Sidebar ── */}
          <aside className="settings-sidebar">
            <h1 className="settings-sidebar-title">Settings</h1>
            <TabsList
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                background: "transparent",
                border: "none",
                padding: 0,
                height: "auto",
                width: "100%",
                alignItems: "stretch",
              }}
            >
              <TabsTrigger
                value="general"
                className="settings-nav-item"
                style={{ justifyContent: "flex-start", border: "none" }}
              >
                <Settings size={18} style={{ marginRight: 12 }} />
                General
              </TabsTrigger>
              {user && (
                <>
                  <TabsTrigger
                    value="account"
                    className="settings-nav-item"
                    style={{ justifyContent: "flex-start", border: "none" }}
                  >
                    <User size={18} style={{ marginRight: 12 }} />
                    Account
                  </TabsTrigger>
                  <TabsTrigger
                    value="preferences"
                    className="settings-nav-item"
                    style={{ justifyContent: "flex-start", border: "none" }}
                  >
                    <BookOpen size={18} style={{ marginRight: 12 }} />
                    Reader Preferences
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="settings-nav-item"
                    style={{ justifyContent: "flex-start", border: "none" }}
                  >
                    <Lock size={18} style={{ marginRight: 12 }} />
                    Security
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </aside>

          {/* ── Main content ── */}
          <main className="settings-main">
            <TabsContent value="general" className="mt-0 outline-none">
              <GeneralTab />
            </TabsContent>
            {user && (
              <>
                <TabsContent value="account" className="mt-0 outline-none">
                  <AccountTab />
                </TabsContent>
                <TabsContent value="preferences" className="mt-0 outline-none">
                  <PreferencesTab />
                </TabsContent>
                <TabsContent value="security" className="mt-0 outline-none">
                  <SecurityTab />
                </TabsContent>
              </>
            )}
          </main>
        </Tabs>
      </div>
      <PageMountSignaler />
    </>
  );
}
