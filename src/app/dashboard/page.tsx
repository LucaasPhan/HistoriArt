"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import { useTranslation } from "@/lib/i18n";
import { BookOpen, Calendar, GraduationCap, Trophy } from "lucide-react";
import React, { useEffect, useState } from "react";

type QuizResult = {
  id: string;
  bookId: string;
  chapterNumber: number | null;
  score: number;
  totalQuestions: number;
  completedAt: string;
};

export default function DashboardPage() {
  const { t, language } = useTranslation();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quiz/results")
      .then((res) => res.json())
      .then((data) => {
        if (data.results) setResults(data.results);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalQuizzes = results.length;
  const bestScore = results.length > 0 
    ? Math.max(...results.map(r => r.totalQuestions > 0 ? r.score / r.totalQuestions : 0)) * 100 
    : 0;

  return (
    <div 
      className="flex flex-col items-center min-h-screen"
      style={{ paddingBottom: "48px", paddingLeft: "24px", paddingRight: "24px", paddingTop: "120px", background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <div className="w-full max-w-4xl">
        <div className="flex items-center" style={{ gap: "16px", marginBottom: "32px" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-accent-primary to-accent-secondary shadow-lg">
            <Trophy color="white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ margin: 0 }}>
              {t("dashboard.title")}
            </h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "16px", marginBottom: "32px" }}>
          <div className="bg-(--bg-card) border border-(--border-subtle) rounded-xl shadow-sm flex items-center" style={{ padding: "24px", gap: "24px" }}>
            <div className="w-14 h-14 rounded-full bg-(--bg-secondary) flex items-center justify-center text-(--accent-primary)">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm text-(--text-secondary) font-medium" style={{ marginBottom: "4px" }}>{t("dashboard.totalQuizzes")}</p>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-(--text-primary) to-(--text-secondary)" style={{ margin: 0 }}>
                {loading ? "-" : totalQuizzes}
              </p>
            </div>
          </div>

          <div className="bg-(--bg-card) border border-(--border-subtle) rounded-xl shadow-sm flex items-center" style={{ padding: "24px", gap: "24px" }}>
            <div className="w-14 h-14 rounded-full bg-(--bg-secondary) flex items-center justify-center text-(--accent-primary)">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-sm text-(--text-secondary) font-medium" style={{ marginBottom: "4px" }}>{t("dashboard.bestScore")}</p>
              <p className="text-3xl font-bold text-(--text-primary)" style={{ margin: 0 }}>
                {loading ? "-" : `${Math.round(bestScore)}%`}
              </p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="bg-(--bg-card) border border-(--border-subtle) rounded-xl overflow-hidden shadow-sm">
          <div className="border-b border-(--border-subtle) bg-(--bg-secondary)/50" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>
            <h2 className="text-lg font-semibold text-(--text-primary)" style={{ margin: 0 }}>{t("dashboard.quizHistory")}</h2>
          </div>
          
          <div className="" style={{ padding: 0 }}>
            {loading ? (
              <div className="text-center text-(--text-secondary)" style={{ padding: "32px" }}>{t("common.loading")}</div>
            ) : results.length === 0 ? (
              <div className="text-center text-(--text-tertiary)" style={{ padding: "48px" }}>
                <div className="w-16 h-16 rounded-full bg-(--bg-secondary) flex items-center justify-center mx-auto" style={{ marginBottom: "16px" }}>
                  <BookOpen size={24} className="opacity-50" />
                </div>
                <p style={{ margin: 0 }}>{t("dashboard.noHistory")}</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="border-b border-(--border-subtle) text-(--text-secondary)">
                    <th className="font-medium" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>{t("admin.selectBook")}</th>
                    <th className="font-medium" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>{t("dashboard.chapter")}</th>
                    <th className="font-medium" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>{t("dashboard.date")}</th>
                    <th className="font-medium text-right" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>{t("dashboard.result")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-subtle)">
                  {results.map((result) => {
                    const percentage = result.totalQuestions > 0 
                      ? Math.round((result.score / result.totalQuestions) * 100)
                      : 0;
                    const isPass = percentage >= 70;
                    const formatter = new Intl.DateTimeFormat(language === "en" ? "en-US" : "vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    
                    return (
                      <tr key={result.id} className="hover:bg-(--bg-secondary)/30 transition-colors">
                        <td className="font-medium text-(--text-primary)" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>
                          {/* Could map bookId to title here if we fetched books */}
                          {result.bookId}
                        </td>
                        <td className="text-(--text-secondary)" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>
                          {result.chapterNumber ? `${t("dashboard.chapter")} ${result.chapterNumber}` : "-"}
                        </td>
                        <td className="text-(--text-secondary)" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>
                          <div className="flex items-center" style={{ gap: "8px" }}>
                            <Calendar size={14} className="opacity-70" />
                            {formatter.format(new Date(result.completedAt))}
                          </div>
                        </td>
                        <td className="text-right" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>
                          <div className="inline-flex items-center" style={{ gap: "12px" }}>
                            <span 
                              className={`rounded-full text-xs font-semibold ${
                                isPass 
                                  ? "bg-green-500/10 text-green-500 border border-green-500/30" 
                                  : "bg-red-500/10 text-red-500 border border-red-500/30"
                              }`}
                              style={{ paddingLeft: "10px", paddingRight: "10px", paddingTop: "4px", paddingBottom: "4px" }}
                            >
                              {percentage}%
                            </span>
                            <span className="text-(--text-tertiary) font-mono">
                              {result.score}/{result.totalQuestions}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
