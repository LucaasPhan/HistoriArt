"use client";

import { useTranslation } from "@/lib/i18n";
import { BookOpen, Settings2, Trophy, ArrowRight } from "lucide-react";
import { TransitionLink } from "@/components/TransitionLink";
import PageMountSignaler from "@/components/PageMountSignaler";

export default function AdminHubClient() {
  const { t } = useTranslation();

  return (
    <div 
      className="flex flex-col items-center min-h-screen pb-12 px-6"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)", paddingTop: "120px" }}
    >
      <div className="w-full max-w-4xl">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--border-hover), var(--border-subtle))", boxShadow: "var(--shadow-card)" }}>
            <Settings2 color="var(--text-primary)" size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "30px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
              {t("admin.dashboard")}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Card 1: Quiz Management */}
          <TransitionLink href="/admin/quiz">
            <div 
              style={{ padding: "24px", borderRadius: "12px", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)", transition: "all 0.3s", cursor: "pointer", background: "var(--bg-card)" }}
              onMouseOver={(e) => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseOut={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookOpen size={24} style={{ color: "var(--accent-primary)" }} />
                </div>
                <ArrowRight size={20} style={{ color: "var(--text-tertiary)" }} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px", margin: 0 }}>{t("admin.quizManager")}</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>
                Create, edit, and manage quiz questions using AI for all chapters.
              </p>
            </div>
          </TransitionLink>

          {/* Card 2: Performance */}
          <TransitionLink href="/admin/performance">
            <div 
              style={{ padding: "24px", borderRadius: "12px", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)", transition: "all 0.3s", cursor: "pointer", background: "var(--bg-card)" }}
              onMouseOver={(e) => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseOut={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trophy size={24} style={{ color: "#a855f7" }} />
                </div>
                <ArrowRight size={20} style={{ color: "var(--text-tertiary)" }} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px", margin: 0 }}>{t("admin.performance")}</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>
                Analyze student scores, attempts, and overall quiz activity.
              </p>
            </div>
          </TransitionLink>
        </div>
      </div>
      <PageMountSignaler/>
    </div>
  );
}
