export const QUIZ_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type QuizDifficulty = (typeof QUIZ_DIFFICULTIES)[number];

export const QUIZ_TEMPLATES = ["multiple-choice", "free-response", "mixed"] as const;

export type QuizTemplate = (typeof QUIZ_TEMPLATES)[number];

export interface QuizQuestion {
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  type: "multiple-choice" | "free-response";
}

export interface Quiz {
  topic: string;
  difficulty: QuizDifficulty;
  template: QuizTemplate;
  questions: QuizQuestion[];
}

export interface GenerateQuizInput {
  topic: string;
  difficulty: QuizDifficulty;
  template?: QuizTemplate;
  moduleId?: string;
  previousMistakes: string[];
}