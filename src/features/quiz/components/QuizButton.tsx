import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { HelpCircle, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import styles from "./styles/QuizButton.module.css";

type QuizButtonProps = {
  completedChapters: number[];
  quizzesDone: number[];
  currentChapter: number;
  totalChapters: number;
  onOpenQuiz: (chapter: number) => void;
};

export function QuizButton({
  completedChapters,
  quizzesDone,
  currentChapter,
  totalChapters,
  onOpenQuiz,
}: QuizButtonProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [selectedChapter, setSelectedChapter] = useState(currentChapter);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sync selected chapter with current viewing chapter
  useEffect(() => {
    setSelectedChapter(currentChapter);
  }, [currentChapter]);

  // Show active dot if there is any pending quiz in completed chapters
  const hasPendingQuiz = completedChapters.some((ch) => !quizzesDone.includes(ch));
  const isActive = completedChapters.length > 0;

  const handleQuizClick = () => {
    // 0. Check authentication
    if (!isAuthenticated) {
      toast.error(t("quiz.signinRequired"), {
        position: "bottom-right",
        style: { backgroundColor: "#000", color: "#fff", border: "1px solid #333", borderRadius: "12px" },
      });
      return;
    }

    // 1. Check if the SELECTED chapter is completed
    if (!completedChapters.includes(selectedChapter)) {
      toast(t("quiz.chapterNotCompleted"), {
        position: "bottom-right",
        style: { backgroundColor: "#000", color: "#fff", border: "1px solid #333", borderRadius: "12px" },
      });
      return;
    }

    onOpenQuiz(selectedChapter);
  };

  const handleSelectChapter = (ch: number) => {
    if (!isAuthenticated) {
      toast.error(t("quiz.signinRequired"), {
        position: "bottom-right",
        style: { backgroundColor: "#000", color: "#fff", border: "1px solid #333", borderRadius: "12px" },
      });
      return;
    }

    if (!completedChapters.includes(ch)) {
      toast(t("quiz.chapterNotCompleted"), {
        position: "bottom-right",
        style: { backgroundColor: "#000", color: "#fff", border: "1px solid #333", borderRadius: "12px" },
      });
      return;
    }
    setSelectedChapter(ch);
    onOpenQuiz(ch);
  };

  return (
    <div className={`${styles.quizGroup} ${dropdownOpen ? styles.groupOpen : ""}`}>
      {/* Foreground Quiz Icon Button */}
      <button
        className={`${styles.iconBtn} ${isActive ? styles.iconBtnActive : ""}`}
        title={t("quiz.openQuiz")}
        onClick={handleQuizClick}
      >
        <HelpCircle size={18} />
        {hasPendingQuiz && <span className={styles.activeDot} />}
      </button>

      {/* Background Dropdown Trigger (Layered via pseudo-element) */}
      {totalChapters > 0 && (
        <DropdownMenu onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <div className={styles.chapterSelector}>
              <span className={styles.chapterNumber}>{selectedChapter}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={20}
            className={styles.menuContent}
          >
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => {
              const chDone = quizzesDone.includes(ch);
              const isLocked = !completedChapters.includes(ch);

              return (
                <DropdownMenuItem
                  key={ch}
                  className={`${styles.menuItem} ${isLocked ? styles.menuItemLocked : ""}`}
                  onClick={() => handleSelectChapter(ch)}
                >
                  <span>
                    {t("dashboard.chapter")} {ch}
                  </span>
                  <span className={styles.menuItemInfo}>
                    {isLocked ? <Lock size={12} /> : chDone ? "✓" : ""}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
