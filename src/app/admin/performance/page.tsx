"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import { useTranslation } from "@/lib/i18n";
import { BookOpen, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

import styles from "./Performance.module.css";

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
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconBox}>
              <Settings2 className="text-text-primary" size={24} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>{t("admin.dashboard")}</h1>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.selectorBox}>
              <BookOpen size={16} />
              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                className={styles.bookSelect}
              >
                <option value="sugnvn_t1">Sử Giản - Tập 1 (Lịch sử thế giới)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Panels */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>{t("admin.performance")}</h2>

            <button
              onClick={() => {
                alert("Redirecting to quiz creator...");
              }}
              className={styles.adminBtn}
            >
              + {t("quiz.submit")}
            </button>
          </div>

          <div className={styles.panelContent}>
            {loading ? (
              <div className={styles.loadingBox}>{t("common.loading")}</div>
            ) : stats.length === 0 ? (
              <div className={styles.emptyBox}>{t("dashboard.noHistory")}</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHeadRow}>
                    <th className={styles.tableHeadCell}>{t("dashboard.chapter")}</th>
                    <th className={`${styles.tableHeadCell} text-right`}>
                      {t("admin.totalAttempts")}
                    </th>
                    <th className={`${styles.tableHeadCell} text-right`}>{t("admin.avgScore")}</th>
                    <th className={`${styles.tableHeadCell} text-right`}>{t("admin.passRate")}</th>
                  </tr>
                </thead>
                <tbody className="border-t-0">
                  {stats.map((stat, i) => (
                    <tr key={i} className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.chapterCell}`}>
                        {t("dashboard.chapter")} {stat.chapterNumber}
                      </td>
                      <td className={`${styles.tableCell} ${styles.statsCell} text-right`}>
                        {stat.totalAttempts}
                      </td>
                      <td className={`${styles.tableCell} text-right`}>
                        <span className={styles.monoText}>{stat.avgScore}%</span>
                      </td>
                      <td className={`${styles.tableCell} text-right`}>
                        <div className={styles.passRateContainer}>
                          <div className={styles.progressBarContainer}>
                            <div
                              className={styles.progressBarFill}
                              style={{ width: `${stat.passRate}%` }}
                            />
                          </div>
                          <span className={styles.passRateLabel}>{stat.passRate}%</span>
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
      <PageMountSignaler />
    </div>
  );
}
