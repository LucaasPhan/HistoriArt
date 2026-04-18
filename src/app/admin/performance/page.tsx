"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import { useTranslation } from "@/lib/i18n";
import { BookOpen, Settings2 } from "lucide-react";
import React, { useEffect, useState } from "react";

type AdminStat = {
  chapterNumber: number;
  totalAttempts: number;
  avgScore: number;
  passRate: number;
};

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookId, setBookId] = useState("sugnvn_t1"); // Defaulting for MVP

  useEffect(() => {
    fetch(`/api/admin/performance?bookId=${bookId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookId]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-bg-primary text-text-primary" style={{ paddingBottom: "48px", paddingLeft: "24px", paddingRight: "24px", paddingTop: "120px" }}>
      <div className="w-full max-w-[896px]">
        <div className="flex items-center justify-between" style={{ marginBottom: "32px" }}>
          <div className="flex items-center" style={{ gap: "16px" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-border-hover to-border-subtle shadow-sm">
              <Settings2 className="text-text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ margin: 0 }}>
                {t("admin.dashboard")}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center" style={{ gap: "16px" }}>
            <div className="flex items-center" style={{ gap: "12px" }}>
              <BookOpen size={16} />
              <select 
                value={bookId} 
                onChange={(e) => setBookId(e.target.value)}
                className="rounded-lg text-sm outline-none bg-bg-card text-text-primary border border-border-subtle focus:ring-1 focus:ring-accent-primary"
                style={{ paddingLeft: "16px", paddingRight: "16px", paddingTop: "8px", paddingBottom: "8px" }}
              >
                <option value="sugnvn_t1">Sử Giản - Tập 1 (Lịch sử thế giới)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Panels */}
        <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
          <div className="border-b border-border-subtle bg-bg-secondary flex items-center justify-between" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>
            <h2 className="text-lg font-semibold" style={{ margin: 0 }}>{t("admin.performance")}</h2>
            
            <button
              onClick={() => {
                alert("Redirecting to quiz creator...");
              }}
              className="btn-primary text-sm"
              style={{ paddingLeft: "16px", paddingRight: "16px", paddingTop: "8px", paddingBottom: "8px" }}
            >
              + {t("quiz.submit")}
            </button>
          </div>
          
          <div className="" style={{ padding: 0 }}>
            {loading ? (
              <div className="text-center text-text-secondary" style={{ padding: "32px" }}>{t("common.loading")}</div>
            ) : stats.length === 0 ? (
              <div className="text-center text-text-tertiary" style={{ padding: "40px" }}>{t("dashboard.noHistory")}</div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle text-text-secondary">
                    <th className="font-medium" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>{t("dashboard.chapter")}</th>
                    <th className="font-medium text-right" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>{t("admin.totalAttempts")}</th>
                    <th className="font-medium text-right" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>{t("admin.avgScore")}</th>
                    <th className="font-medium text-right" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>{t("admin.passRate")}</th>
                  </tr>
                </thead>
                <tbody className="border-t-0">
                  {stats.map((stat, i) => (
                    <tr 
                      key={i} 
                      className={`border-b border-border-subtle last:border-0 transition-colors hover:bg-bg-secondary/30`}
                    >
                      <td className="font-medium text-text-primary" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>
                        {t("dashboard.chapter")} {stat.chapterNumber}
                      </td>
                      <td className="text-right text-text-secondary" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>
                        {stat.totalAttempts}
                      </td>
                      <td className="text-right" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>
                        <span className="font-mono text-text-primary">{stat.avgScore}%</span>
                      </td>
                      <td className="text-right" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>
                        <div className="flex items-center justify-end" style={{ gap: "12px" }}>
                          <div className="w-24 h-2 bg-bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent-primary transition-all duration-300"
                              style={{ width: `${stat.passRate}%` }}
                            />
                          </div>
                          <span className="font-mono text-text-secondary min-w-[40px]">
                            {stat.passRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <PageMountSignaler/>
    </div>
  );
}
