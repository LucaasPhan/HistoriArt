"use client";

import { useTranslation } from "@/lib/i18n";
import { CheckCircle, Loader2, Trophy, X, XCircle, Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import useQuizController from "../hooks/useQuizController";
import type { QuizAnswer } from "../types";

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

  const currentAnswer = ctrl.answers.find(
    (a) => a.questionId === ctrl.currentQuestion?.id,
  );
  const progress = ctrl.totalQuestions > 0
    ? ((ctrl.currentIndex + 1) / ctrl.totalQuestions) * 100
    : 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-card border border-border-subtle rounded-[var(--radius-xl)] w-[92%] max-w-[600px] max-h-[85vh] p-[25px] flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-5 duration-300"
      >
        {/* Header (matches EditBookDialog) */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent-gradient flex items-center justify-center shrink-0">
              <Trophy size={18} color="white" />
            </div>
            <div>
              <div className="text-[18px] font-bold text-text-primary leading-tight">
                {t("quiz.title") || "Bài kiểm tra"}
              </div>
              {ctrl.quizState !== "complete" && ctrl.totalQuestions > 0 && (
                <div className="text-[13px] text-text-secondary mt-[2px]">
                  {t("quiz.question")} {ctrl.currentIndex + 1} {t("quiz.of")} {ctrl.totalQuestions}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-md bg-bg-secondary border border-border-subtle flex items-center justify-center text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        {ctrl.quizState !== "complete" && ctrl.totalQuestions > 0 && (
          <div className="h-1 bg-border-subtle rounded-full mb-5 shrink-0 overflow-hidden">
            <div
              className="h-full bg-accent-primary transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex flex-col gap-5 overflow-y-auto p-1 flex-1">
          {/* Loading state */}
          {ctrl.isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-3 bg-bg-secondary rounded-full mb-4">
                <Loader2 size={24} className="animate-spin text-accent-primary" />
              </div>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-widest">{t("common.loading")}</p>
            </div>
          )}

          {/* No questions */}
          {!ctrl.isLoading && ctrl.totalQuestions === 0 && ctrl.quizState === "idle" && (
            <div className="text-center py-16 text-text-tertiary flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mb-4">
                <span className="opacity-50 text-2xl">?</span>
              </div>
              <p className="font-semibold text-sm">{t("quiz.noQuestions")}</p>
            </div>
          )}

          {/* Question */}
          {ctrl.currentQuestion && ctrl.quizState !== "complete" && (
            <div className="flex flex-col gap-4">
              {/* Question text */}
              <p className="text-[16px] font-bold text-text-primary leading-relaxed">
                {ctrl.currentQuestion.question}
              </p>

              {/* MC Options */}
              {ctrl.currentQuestion.questionType === "multiple_choice" && (
                <div className="flex flex-col gap-3">
                  {(ctrl.currentQuestion.options ?? []).map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isReviewing = ctrl.quizState === "reviewing";
                    const isCorrect = idx === ctrl.currentQuestion!.correctIndex;
                    const wasChosen = currentAnswer?.selectedIndex === idx;

                    let stateClass = "bg-bg-primary border-border-subtle hover:border-text-tertiary text-text-primary";
                    let innerContent = <span className="text-[14px]">{opt}</span>;

                    if (isReviewing) {
                      if (isCorrect) {
                        stateClass = "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400";
                        innerContent = <div className="flex items-center gap-2"><CheckCircle size={16} /> <span className="text-[14px]">{opt}</span></div>;
                      } else if (wasChosen) {
                        stateClass = "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400 opacity-70";
                        innerContent = <div className="flex items-center gap-2"><XCircle size={16} /> <span className="text-[14px]">{opt}</span></div>;
                      } else {
                        stateClass = "bg-bg-primary border-border-subtle opacity-50";
                      }
                    } else if (isSelected) {
                      stateClass = "border-accent-primary shadow-[0_0_0_3px_rgba(124,58,237,0.15)] bg-bg-primary";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isReviewing}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left p-[16px] rounded-[var(--radius-md)] border transition-all ${stateClass} ${isReviewing ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {innerContent}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* True/False */}
              {ctrl.currentQuestion.questionType === "true_false" && (
                <div className="flex gap-3">
                  {[0, 1].map((idx) => {
                    const label = idx === 0 ? t("quiz.true") : t("quiz.false");
                    const isSelected = selectedOption === idx;
                    const isReviewing = ctrl.quizState === "reviewing";
                    const isCorrect = idx === ctrl.currentQuestion!.correctIndex;
                    const wasChosen = currentAnswer?.selectedIndex === idx;

                    let stateClass = "bg-bg-primary border-border-subtle hover:border-text-tertiary text-text-primary";
                    let innerContent = <span className="text-[14px] font-semibold text-center w-full">{label}</span>;
                    
                    if (isReviewing) {
                      if (isCorrect) {
                        stateClass = "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400";
                        innerContent = <div className="flex items-center justify-center gap-2 w-full"><CheckCircle size={16} /> {label}</div>;
                      }
                      else if (wasChosen) {
                        stateClass = "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400 opacity-70";
                        innerContent = <div className="flex items-center justify-center gap-2 w-full"><XCircle size={16} /> {label}</div>;
                      }
                      else {
                        stateClass = "bg-bg-primary border-border-subtle opacity-50";
                      }
                    } else if (isSelected) {
                      stateClass = "border-accent-primary shadow-[0_0_0_3px_rgba(124,58,237,0.15)] bg-bg-primary";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isReviewing}
                        onClick={() => setSelectedOption(idx)}
                        className={`flex-1 p-[16px] rounded-[var(--radius-md)] border transition-all ${stateClass} ${isReviewing ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {innerContent}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short Answer */}
              {ctrl.currentQuestion.questionType === "short_answer" && (
                <div className="flex flex-col">
                  {ctrl.quizState !== "reviewing" && (
                    <textarea
                      value={shortAnswer}
                      onChange={(e) => setShortAnswer(e.target.value)}
                      placeholder="Nhập câu trả lời của bạn..."
                      className="w-full min-h-[100px] p-[12px_16px] bg-bg-primary border border-border-subtle rounded-[var(--radius-md)] text-text-primary text-[14px] resize-y focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] outline-none transition-all font-sans"
                    />
                  )}
                  {ctrl.isGrading && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-text-secondary text-sm bg-bg-secondary p-4 rounded-xl">
                      <Loader2 size={16} className="animate-spin text-accent-primary" />
                      <span className="animate-pulse">{t("quiz.grading")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Review feedback */}
              {ctrl.quizState === "reviewing" && currentAnswer && (
                <div className={`mt-2 p-4 rounded-[var(--radius-md)] border ${currentAnswer.isCorrect ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {currentAnswer.isCorrect ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                    <span className={`text-[14px] font-bold ${currentAnswer.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                      {currentAnswer.isCorrect ? t("quiz.correct") : t("quiz.incorrect")}
                    </span>
                  </div>
                  
                  {currentAnswer.feedback && (
                    <p className="text-[14px] text-text-primary leading-relaxed mt-2 mb-0">
                      {currentAnswer.feedback}
                    </p>
                  )}
                  
                  {ctrl.currentQuestion?.explanation && (
                    <div className="mt-3 text-[13px] text-text-secondary leading-relaxed border-t border-border-subtle/40 pt-3">
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
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-accent-gradient flex items-center justify-center mx-auto mb-4 shadow-[0_4px_16px_rgba(124,58,237,0.3)]">
                <Trophy size={28} className="text-white" />
              </div>

              <h2 className="text-[20px] font-bold text-text-primary mb-1">
                {t("quiz.quizComplete")}
              </h2>

              <div className="mb-6">
                <p className="text-[32px] font-bold text-accent-primary mb-0">
                  {ctrl.score}/{ctrl.totalQuestions}
                </p>
                <p className="text-[14px] text-text-secondary mt-1">
                  Đã hoàn thành {Math.round((ctrl.score / (ctrl.totalQuestions || 1)) * 100)}%
                </p>
              </div>

              {/* Question summary text aligned standard mode */}
              <div className="flex flex-col gap-2 mb-8 text-left bg-bg-secondary p-4 rounded-[var(--radius-md)] border border-border-subtle">
                <h3 className="text-[13px] font-bold text-text-primary border-b border-border-subtle/50 pb-2 mb-2">Chi tiết kết quả</h3>
                {ctrl.questions.map((q, i) => {
                  const ans = ctrl.answers.find((a) => a.questionId === q.id);
                  return (
                    <div key={q.id} className="flex items-start gap-2 py-1">
                      <div className="shrink-0 mt-0.5">
                        {ans?.isCorrect ? (
                          <CheckCircle size={14} className="text-green-500" />
                        ) : (
                          <XCircle size={14} className="text-red-500" />
                        )}
                      </div>
                      <div className="text-[13px] text-text-secondary">
                        <span className="font-semibold text-text-primary mr-1">Câu {i + 1}:</span>
                        {q.question}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center mt-6">
                <button
                  className="px-6 py-2.5 rounded-[var(--radius-md)] bg-bg-secondary text-text-secondary border border-border-subtle font-semibold text-[14px] hover:bg-bg-tertiary hover:text-text-primary transition-all"
                  onClick={() => {
                    ctrl.resetQuiz();
                    ctrl.loadQuestions();
                  }}
                >
                  {t("quiz.tryAgain")}
                </button>
                <button
                  className="px-7 py-2.5 rounded-[var(--radius-md)] bg-accent-gradient text-white font-semibold text-[14px] border-none hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(124,58,237,0.3)] transition-all"
                  onClick={handleClose}
                >
                  Hoàn tất
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sticky Footer: Action Buttons ── */}
        {ctrl.currentQuestion && ctrl.quizState !== "complete" && (
          <div className="flex items-center justify-end shrink-0 mt-2">
            <div className="flex gap-3">
              {ctrl.quizState === "active" && (
                <button
                  onClick={handleSubmit}
                  className="px-7 py-2.5 rounded-[var(--radius-md)] bg-accent-gradient text-white font-semibold text-[14px] border-none transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:-translate-y-[1px] hover:not-disabled:shadow-[0_4px_16px_rgba(124,58,237,0.3)] flex items-center justify-center min-w-[120px]"
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
                  ) : t("quiz.submit")}
                </button>
              )}
              {ctrl.quizState === "reviewing" && (
                <button
                  className="px-7 py-2.5 rounded-[var(--radius-md)] bg-accent-gradient text-white font-semibold text-[14px] border-none transition-all hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(124,58,237,0.3)] min-w-[120px]"
                  onClick={handleNext}
                >
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
