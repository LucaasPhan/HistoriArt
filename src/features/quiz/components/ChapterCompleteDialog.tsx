"use client";

import { useTranslation } from "@/lib/i18n";
import { GraduationCap, X } from "lucide-react";
import { useState } from "react";
import styles from "./styles/ChapterCompleteDialog.module.css";

type ChapterCompleteDialogProps = {
  isOpen: boolean;
  bookId: string;
  chapterNumber: number;
  onStartQuiz: () => void;
  onSkip: () => void;
  onDontShowAgain: () => void;
};

export function ChapterCompleteDialog({
  isOpen,
  bookId,
  chapterNumber,
  onStartQuiz,
  onSkip,
  onDontShowAgain,
}: ChapterCompleteDialogProps) {
  const { t } = useTranslation();
  const [dontShow, setDontShow] = useState(false);

  if (!isOpen) return null;

  const handleSkip = () => {
    if (dontShow) {
      // Save suppress preference
      fetch("/api/quiz/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, suppressPopup: true }),
      }).catch(console.error);
      onDontShowAgain();
    } else {
      onSkip();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleSkip}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={styles.modal}
        style={{ maxWidth: "420px" }}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <div className={styles.quizIcon}>
              <GraduationCap size={32} color="white" />
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={(e) => {
              e.preventDefault();
              handleSkip();
            }}
          >
            <X size={20} />
          </button>
        </div>
        <h2 className={styles.title}>{t("quiz.chapterComplete")}</h2>

        <p className={styles.promptText}>{t("quiz.takeQuizPrompt")}</p>

        <div className={styles.buttonGroup}>
          <button className={styles.actionBtn} onClick={onStartQuiz}>
            {t("quiz.startQuiz")}
          </button>

          <button className={styles.skipBtn} onClick={handleSkip}>
            {t("quiz.skipQuiz")}
          </button>
        </div>

        <label className={styles.footerLabel}>
          <input
            type="checkbox"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
            className={styles.checkbox}
          />
          {t("quiz.dontShowAgain")}
        </label>
      </div>
    </div>
  );
}
