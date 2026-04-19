export const QUIZ_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type QuizDifficulty = (typeof QUIZ_DIFFICULTIES)[number];

export interface QuizQuestion {
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  topic: string;
  difficulty: QuizDifficulty;
  questions: QuizQuestion[];
}

export interface GenerateQuizInput {
  topic: string;
  difficulty: QuizDifficulty;
  previousMistakes: string[];
}