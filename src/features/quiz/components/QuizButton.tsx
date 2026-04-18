"use client";

import { useTranslation } from "@/lib/i18n";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";

type QuizButtonProps = {
  bookId: string;
  currentChapter: number;
  completedChapters: number[];
  onClick: () => void;
};

export function QuizButton({
  currentChapter,
  completedChapters,
  onClick,
}: QuizButtonProps) {
  const { t, language } = useTranslation();

  // Show active button if the user has completed at least one chapter
  const hasCompletedChapters = completedChapters.length > 0;
  const latestCompleted = Math.max(0, ...completedChapters);
  const isActive = hasCompletedChapters && latestCompleted >= 1;

  const handleClick = () => {
    if (!isActive) {
      const msg = language === "vi" 
        ? "Vui lòng đọc xong ít nhất một chương trước khi làm bài!" 
        : "Please finish reading at least one chapter before taking the quiz!";
      toast(msg, { position: "bottom-right" });
      return;
    }
    onClick();
  };

  return (
    <button
      className="toolbar-btn"
      title={t("quiz.openQuiz")}
      onClick={handleClick}
      style={{
        position: "relative",
      }}
    >
      <HelpCircle size={20} />
      {isActive && (
        <span
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--accent-primary)",
          }}
        />
      )}
    </button>
  );
}
