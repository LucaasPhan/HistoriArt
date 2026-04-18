export type QuizQuestion = {
  id: string;
  questionType: "multiple_choice" | "true_false" | "short_answer";
  question: string;
  options?: string[];
  correctIndex?: number;
  acceptedAnswers?: string[];
  explanation?: string;
  chapterNumber: number;
};

export type QuizAnswer = {
  questionId: string;
  selectedIndex?: number;
  textAnswer?: string;
  isCorrect?: boolean;
  feedback?: string;
};

export type QuizState = "idle" | "active" | "reviewing" | "complete";
