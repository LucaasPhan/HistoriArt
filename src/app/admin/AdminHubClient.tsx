"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import { TransitionLink } from "@/components/TransitionLink";
import { useTranslation } from "@/lib/i18n";
import { ArrowRight, BookOpen, Settings2, Trophy } from "lucide-react";
import styles from "./AdminHub.module.css";

export default function AdminHubClient() {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Settings2 color="var(--text-primary)" size={24} />
          </div>
          <div>
            <h1 className={styles.title}>{t("admin.dashboard")}</h1>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Card 1: Quiz Management */}
          <TransitionLink href="/admin/quiz" className={styles.cardLink}>
            <div className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardIconWrapper}>
                  <BookOpen size={24} className={styles.cardIcon} />
                </div>
                <ArrowRight size={20} className={styles.arrowIcon} />
              </div>
              <h2 className={styles.cardTitle}>{t("admin.quizManager")}</h2>
              <p className={styles.cardDescription}>{t("admin.quizDescription")}</p>
            </div>
          </TransitionLink>

          {/* Card 2: Performance */}
          <TransitionLink href="/admin/performance" className={styles.cardLink}>
            <div className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardIconWrapper}>
                  <Trophy size={24} className={styles.cardIconSecondary} />
                </div>
                <ArrowRight size={20} className={styles.arrowIcon} />
              </div>
              <h2 className={styles.cardTitle}>{t("admin.performance")}</h2>
              <p className={styles.cardDescription}>{t("admin.performanceDescription")}</p>
            </div>
          </TransitionLink>
        </div>
      </div>
      <PageMountSignaler />
    </div>
  );
}
