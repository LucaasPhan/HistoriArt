"use client";

import { useTranslation } from "@/lib/i18n";
import { useCallback, useEffect, useRef, useState } from "react";
import type { QuizAnswer, QuizQuestion, QuizState } from "../types";

type UseQuizControllerArgs = {
  bookId: string;
  chapterNumber: number;
};

export default function useQuizController({ bookId, chapterNumber }: UseQuizControllerArgs) {
  const { language, t } = useTranslation();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const resultSavedRef = useRef(false);

  const loadQuestions = useCallback(async () => {
    if (!bookId || !chapterNumber) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/quiz/${bookId}/${chapterNumber}`);
      if (!res.ok) return;
      const data = await res.json();
      setQuestions(data.questions ?? []);
      setQuizState(data.questions?.length > 0 ? "active" : "idle");
      setCurrentIndex(0);
      setAnswers([]);
      setScore(null);
      resultSavedRef.current = false;
    } catch (err) {
      console.error("Failed to load quiz questions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [bookId, chapterNumber]);

  const submitAnswer = useCallback(
    async (answer: QuizAnswer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) return;

      let graded = { ...answer };

      if (question.questionType === "short_answer") {
        // AI grading for short answer
        setIsGrading(true);
        try {
          const res = await fetch("/api/quiz/grade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userAnswer: answer.textAnswer,
              acceptedAnswers: question.acceptedAnswers ?? [],
              question: question.question,
              language,
            }),
          });
          const data = await res.json();
          graded.isCorrect = data.isCorrect;
          graded.feedback = data.feedback;
        } catch {
          graded.isCorrect = false;
          graded.feedback = t("quiz.gradingError");
        } finally {
          setIsGrading(false);
        }
      } else {
        // Local grading for MC and T/F
        graded.isCorrect = answer.selectedIndex === question.correctIndex;
      }

      setAnswers((prev) => [...prev, graded]);
      setQuizState("reviewing");
    },
    [questions],
  );

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setQuizState("active");
    } else {
      // All questions answered — calculate score
      const correctCount = answers.filter((a) => a.isCorrect).length;
      setScore(correctCount);
      setQuizState("complete");
    }
  }, [currentIndex, questions.length, answers]);

  const finishQuiz = useCallback(async () => {
    if (resultSavedRef.current) return;
    resultSavedRef.current = true;

    const correctCount = answers.filter((a) => a.isCorrect).length;
    setScore(correctCount);
    setQuizState("complete");

    try {
      await fetch("/api/quiz/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          chapterNumber,
          score: correctCount,
          totalQuestions: questions.length,
        }),
      });
    } catch (err) {
      console.error("Failed to save quiz result:", err);
    }
  }, [answers, bookId, chapterNumber, questions.length]);

  // Save partial results on unmount (e.g. closing modal mid-quiz)
  useEffect(() => {
    return () => {
      if (quizState === "active" || quizState === "reviewing") {
        if (answers.length > 0 && !resultSavedRef.current) {
          resultSavedRef.current = true;
          const correctCount = answers.filter((a) => a.isCorrect).length;
          navigator.sendBeacon(
            "/api/quiz/results",
            JSON.stringify({
              bookId,
              chapterNumber,
              score: correctCount,
              totalQuestions: answers.length,
            }),
          );
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetQuiz = useCallback(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setScore(null);
    setQuizState("idle");
    resultSavedRef.current = false;
  }, []);

  return {
    questions,
    currentIndex,
    currentQuestion: questions[currentIndex] ?? null,
    answers,
    quizState,
    isLoading,
    isGrading,
    score,
    totalQuestions: questions.length,
    loadQuestions,
    submitAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz,
  };
}
