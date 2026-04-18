"use client";

import { useTranslation } from "@/lib/i18n";
import { CheckCircle2, HelpCircle, Loader2, Trophy, X, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import useQuizController from "../hooks/useQuizController";
import type { QuizAnswer } from "../types";
import styles from "./styles/QuizModal.module.css";

type QuizModalProps = {
  isOpen: boolean;
  bookId: string;
  chapterNumber: number;
  onClose: () => void;
};

export function QuizModal({ isOpen, bookId, chapterNumber, onClose }: QuizModalProps) {
  const { t } = useTranslation();
  const ctrl = useQuizController({ bookId, chapterNumber });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [shortAnswer, setShortAnswer] = useState("");

  useEffect(() => {
    if (isOpen && chapterNumber > 0) {
      ctrl.loadQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, chapterNumber]);

  useEffect(() => {
    setSelectedOption(null);
    setShortAnswer("");
  }, [ctrl.currentIndex]);

  const handleSubmit = useCallback(() => {
    if (!ctrl.currentQuestion) return;

    const answer: QuizAnswer = {
      questionId: ctrl.currentQuestion.id,
    };

    if (ctrl.currentQuestion.questionType === "short_answer") {
      if (!shortAnswer.trim()) return;
      answer.textAnswer = shortAnswer.trim();
    } else {
      if (selectedOption === null) return;
      answer.selectedIndex = selectedOption;
    }

    ctrl.submitAnswer(answer);
  }, [ctrl, selectedOption, shortAnswer]);

  const handleNext = useCallback(() => {
    if (ctrl.currentIndex === ctrl.questions.length - 1) {
      ctrl.finishQuiz();
    } else {
      ctrl.nextQuestion();
    }
  }, [ctrl]);

  const handleClose = () => {
    ctrl.resetQuiz();
    onClose();
  };

  if (!isOpen) return null;

  const currentAnswer = ctrl.answers.find((a) => a.questionId === ctrl.currentQuestion?.id);
  const progress =
    ctrl.totalQuestions > 0 ? ((ctrl.currentIndex + 1) / ctrl.totalQuestions) * 100 : 0;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div onClick={(e) => e.stopPropagation()} className={styles.modal}>
        {/* Header (matches Mockup) */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <div className={styles.helpCircleBox}>
              <HelpCircle size={18} color="var(--accent-primary)" />
            </div>
            <div>
              <div className={styles.modalTitle}>{t("quiz.title")}</div>
            </div>
          </div>
          <div className={styles.modalSubtitle} style={{ marginLeft: "auto" }}>
            {t("mockup.quiz.questionCount", { current: ctrl.currentIndex + 1, total: ctrl.totalQuestions })}
          </div>
        </div>


        <div className={styles.scrollArea}>
          {/* Loading state */}
          {ctrl.isLoading && (
            <div className={styles.loadingState}>
              <div className={styles.loadingIconWrapper}>
                <Loader2 size={24} className="text-accent-primary animate-spin" />
              </div>
              <p className={styles.loadingText}>{t("common.loading")}</p>
            </div>
          )}

          {/* No questions */}
          {!ctrl.isLoading && ctrl.totalQuestions === 0 && ctrl.quizState === "idle" && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconCircle}>
                <span className={styles.emptyIconText}>?</span>
              </div>
              <p className={styles.emptyText}>{t("quiz.noQuestions")}</p>
            </div>
          )}

          {/* Question */}
          {ctrl.currentQuestion && ctrl.quizState !== "complete" && (
            <div className={styles.questionContainer}>
              {/* Question text */}
              <p className={styles.questionText}>{ctrl.currentQuestion.question}</p>

              {/* MC Options */}
              {ctrl.currentQuestion.questionType === "multiple_choice" && (
                <div className={styles.optionsList}>
                  {(ctrl.currentQuestion.options ?? []).map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isReviewing = ctrl.quizState === "reviewing";
                    const isCorrect = idx === ctrl.currentQuestion!.correctIndex;
                    const wasChosen = currentAnswer?.selectedIndex === idx;

                    let stateClass = "";
                    let innerContent = <span className="text-[14px]">{opt}</span>;

                    if (isReviewing) {
                      if (isCorrect) {
                        stateClass = styles.optionBtnCorrect;
                        innerContent = (
                          <div className="flex items-center justify-between w-full">
                            <span>{opt}</span>
                            <CheckCircle2 size={16} />
                          </div>
                        );
                      } else if (wasChosen) {
                        stateClass = styles.optionBtnIncorrect;
                        innerContent = (
                          <div className="flex items-center justify-between w-full">
                            <span>{opt}</span>
                            <XCircle size={16} />
                          </div>
                        );
                      } else {
                        stateClass = styles.optionBtnDisabled;
                      }
                    } else if (isSelected) {
                      stateClass = styles.optionBtnSelected;
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isReviewing}
                        onClick={() => setSelectedOption(idx)}
                        className={`${styles.optionBtn} ${stateClass}`}
                      >
                        {innerContent}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* True/False */}
              {ctrl.currentQuestion.questionType === "true_false" && (
                <div className={styles.trueFalseGrid}>
                  {[0, 1].map((idx) => {
                    const label = idx === 0 ? t("quiz.true") : t("quiz.false");
                    const isSelected = selectedOption === idx;
                    const isReviewing = ctrl.quizState === "reviewing";
                    const isCorrect = idx === ctrl.currentQuestion!.correctIndex;
                    const wasChosen = currentAnswer?.selectedIndex === idx;

                    let stateClass = "";
                    let innerContent = <span className={styles.tfLabel}>{label}</span>;

                    if (isReviewing) {
                      if (isCorrect) {
                        stateClass = styles.optionBtnCorrect;
                        innerContent = (
                          <div className="flex w-full items-center justify-center gap-2">
                            <CheckCircle2 size={16} /> {label}
                          </div>
                        );
                      } else if (wasChosen) {
                        stateClass = styles.optionBtnIncorrect;
                        innerContent = (
                          <div className="flex w-full items-center justify-center gap-2">
                            <XCircle size={16} /> {label}
                          </div>
                        );
                      } else {
                        stateClass = styles.optionBtnDisabled;
                      }
                    } else if (isSelected) {
                      stateClass = styles.optionBtnSelected;
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isReviewing}
                        onClick={() => setSelectedOption(idx)}
                        className={`${styles.tfButton} ${stateClass}`}
                      >
                        {innerContent}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short Answer */}
              {ctrl.currentQuestion.questionType === "short_answer" && (
                <div className={styles.shortAnswerContainer}>
                  {ctrl.quizState !== "reviewing" && (
                    <textarea
                      value={shortAnswer}
                      onChange={(e) => setShortAnswer(e.target.value)}
                      placeholder={t("quiz.shortAnswerPlaceholder")}
                      className={styles.textarea}
                    />
                  )}
                  {ctrl.isGrading && (
                    <div className={styles.gradingStatus}>
                      <Loader2 size={16} className="text-accent-primary animate-spin" />
                      <span className="animate-pulse">{t("quiz.grading")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Review feedback */}
              {ctrl.quizState === "reviewing" && currentAnswer && (
                <div
                  className={`${styles.feedbackContainer} ${currentAnswer.isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}
                >
                  <div className={styles.feedbackHeader}>
                    {currentAnswer.isCorrect ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                    <span
                      className={`${styles.feedbackTitle} ${currentAnswer.isCorrect ? "text-green-500" : "text-red-500"}`}
                    >
                      {currentAnswer.isCorrect ? t("quiz.correct") : t("quiz.incorrect")}
                    </span>
                  </div>

                  {currentAnswer.feedback && (
                    <p className={styles.feedbackText}>{currentAnswer.feedback}</p>
                  )}

                  {ctrl.currentQuestion?.explanation && (
                    <div className={styles.explanationBox}>
                      <strong>{t("quiz.explanation")}: </strong>
                      {ctrl.currentQuestion.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Complete screen */}
          {ctrl.quizState === "complete" && ctrl.score !== null && (
            <div className={styles.completeScreen}>
              <div className={styles.trophyCircle}>
                <Trophy size={28} className="text-white" />
              </div>

              <h2 className={styles.completeTitle}>{t("quiz.quizComplete")}</h2>

              <div className={styles.scoreContainer}>
                <p className={styles.scoreBig}>
                  {ctrl.score}/{ctrl.totalQuestions}
                </p>
                <p className={styles.scoreSmall}>
                  {t("quiz.completedPercent", {
                    percent: Math.round((ctrl.score / (ctrl.totalQuestions || 1)) * 100),
                  })}
                </p>
              </div>

              {/* Question summary text aligned standard mode */}
              <div className={styles.detailsList}>
                <h3 className={styles.detailsHeader}>{t("quiz.resultsDetail")}</h3>
                {ctrl.questions.map((q, i) => {
                  const ans = ctrl.answers.find((a) => a.questionId === q.id);
                  return (
                    <div key={q.id} className={styles.detailRow}>
                      <div className="mt-0.5 shrink-0">
                        {ans?.isCorrect ? (
                          <CheckCircle2 size={14} className="text-green-500" />
                        ) : (
                          <XCircle size={14} className="text-red-500" />
                        )}
                      </div>
                      <div className={styles.detailQuestion}>
                        <span className={styles.detailNumber}>
                          {t("quiz.questionNumber", { number: i + 1 })}
                        </span>
                        {q.question}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.completeActions}>
                {/* <button
                  className={styles.retryBtn}
                  onClick={() => {
                    ctrl.resetQuiz();
                    ctrl.loadQuestions();
                  }}
                >
                  {t("quiz.tryAgain")}
                </button> */}
                <button className={styles.actionBtn} onClick={handleClose}>
                  {t("quiz.finish")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress bar above actions */}
        {ctrl.quizState !== "complete" && ctrl.totalQuestions > 0 && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* ── Sticky Footer: Action Buttons ── */}
        {ctrl.currentQuestion && ctrl.quizState !== "complete" && (
          <div className={styles.stickyFooter}>
            <div className="flex gap-3">
              {ctrl.quizState === "active" && (
                <button
                  onClick={handleSubmit}
                  className={styles.actionBtn}
                  disabled={
                    ctrl.isGrading ||
                    (ctrl.currentQuestion.questionType === "short_answer"
                      ? !shortAnswer.trim()
                      : selectedOption === null)
                  }
                >
                  {ctrl.isGrading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      {t("quiz.grading")}
                    </span>
                  ) : (
                    t("quiz.submit")
                  )}
                </button>
              )}
              {ctrl.quizState === "reviewing" && (
                <button className={styles.actionBtn} onClick={handleNext}>
                  {ctrl.currentIndex === ctrl.questions.length - 1
                    ? t("quiz.score")
                    : t("quiz.next")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
