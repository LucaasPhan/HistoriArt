"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import { useTranslation } from "@/lib/i18n";
import { BookOpen, Calendar, GraduationCap, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";

type QuizResult = {
  id: string;
  bookTitle: string;
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
  const bestScore =
    results.length > 0
      ? Math.max(...results.map((r) => (r.totalQuestions > 0 ? r.score / r.totalQuestions : 0))) *
        100
      : 0;

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.titleRow}>
          <div className={styles.titleIcon}>
            <Trophy color="white" size={24} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>{t("dashboard.title")}</h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconCircle}>
              <BookOpen size={24} />
            </div>
            <div>
              <p className={styles.statLabel}>{t("dashboard.totalQuizzes")}</p>
              <p className={styles.statValueGradient}>{loading ? "-" : totalQuizzes}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconCircle}>
              <GraduationCap size={24} />
            </div>
            <div>
              <p className={styles.statLabel}>{t("dashboard.bestScore")}</p>
              <p className={styles.statValue}>{loading ? "-" : `${Math.round(bestScore)}%`}</p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className={styles.historyPanel}>
          <div className={styles.historyHeader}>
            <h2 className={styles.historyTitle}>{t("dashboard.quizHistory")}</h2>
          </div>

          <div>
            {loading ? (
              <div className={styles.loadingState}>{t("common.loading")}</div>
            ) : results.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconCircle}>
                  <BookOpen size={24} className="opacity-50" />
                </div>
                <p className={styles.emptyText}>{t("dashboard.noHistory")}</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr className={styles.tableHeadRow}>
                    <th className={styles.th}>{t("admin.Book")}</th>
                    <th className={styles.th}>{t("dashboard.chapter")}</th>
                    <th className={styles.th}>{t("dashboard.date")}</th>
                    <th className={styles.thRight}>{t("dashboard.result")}</th>
                  </tr>
                </thead>
                <tbody className={styles.tbody}>
                  {results.map((result) => {
                    const percentage =
                      result.totalQuestions > 0
                        ? Math.round((result.score / result.totalQuestions) * 100)
                        : 0;
                    const isPass = percentage >= 70;
                    const formatter = new Intl.DateTimeFormat(
                      language === "en" ? "en-US" : "vi-VN",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    );

                    return (
                      <tr key={result.id} className={styles.tableRow}>
                        <td className={styles.tdPrimary}>{result.bookTitle}</td>
                        <td className={styles.tdSecondary}>
                          {result.chapterNumber
                            ? `${t("dashboard.chapter")} ${result.chapterNumber}`
                            : "-"}
                        </td>
                        <td className={styles.tdSecondary}>
                          <div className={styles.dateCell}>
                            <Calendar size={14} className="opacity-70" />
                            {formatter.format(new Date(result.completedAt))}
                          </div>
                        </td>
                        <td className={styles.tdRight}>
                          <div className={styles.scoreCell}>
                            <span className={isPass ? styles.badgePass : styles.badgeFail}>
                              {percentage}%
                            </span>
                            <span className={styles.scoreRatio}>
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
      <PageMountSignaler />
    </div>
  );
}
