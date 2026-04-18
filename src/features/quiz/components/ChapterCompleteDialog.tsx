"use client";

import { useTranslation } from "@/lib/i18n";
import { BookOpen, GraduationCap } from "lucide-react";
import { useState } from "react";

type ChapterCompleteDialogProps = {
  isOpen: boolean;
  chapterNumber: number;
  bookId: string;
  onStartQuiz: () => void;
  onSkip: () => void;
  onDontShowAgain: () => void;
};

export function ChapterCompleteDialog({
  isOpen,
  chapterNumber,
  bookId,
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={handleSkip}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-card border border-border-subtle rounded-[24px] p-10 max-w-[420px] w-full text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-glow rounded-full -mr-16 -mt-16 opacity-20 blur-2xl" />
        
        <div className="w-16 h-16 rounded-full bg-accent-gradient flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-primary/20 relative z-10">
          <GraduationCap size={32} className="text-white" />
        </div>

        <h2 className="text-[22px] font-bold text-text-primary mb-2 m-0 relative z-10">
          {t("quiz.chapterComplete")}
        </h2>

        <div className="flex items-center justify-center gap-1.5 text-sm text-text-secondary/70 font-semibold mb-2 relative z-10">
          <BookOpen size={14} className="text-accent-primary" />
          {t("dashboard.chapter")} {chapterNumber}
        </div>

        <p className="text-[15px] text-text-secondary mb-8 m-0 leading-relaxed font-medium relative z-10">
          {t("quiz.takeQuizPrompt")}
        </p>

        <div className="flex flex-col gap-3 relative z-10">
          <button
            className="btn-primary w-full py-3.5 rounded-xl font-bold shadow-lg shadow-accent-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={onStartQuiz}
          >
            {t("quiz.startQuiz")}
          </button>

          <button
            className="btn-ghost w-full py-3 rounded-xl font-bold text-text-secondary hover:text-text-primary transition-all active:scale-[0.98]"
            onClick={handleSkip}
          >
            {t("quiz.skipQuiz")}
          </button>
        </div>

        <label className="flex items-center justify-center gap-2 mt-6 text-xs text-text-tertiary cursor-pointer hover:text-text-secondary transition-colors relative z-10 pt-2 border-t border-border-subtle/50">
          <input
            type="checkbox"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
            className="accent-accent-primary cursor-pointer"
          />
          {t("quiz.dontShowAgain")}
        </label>
      </div>
    </div>
  );
}
