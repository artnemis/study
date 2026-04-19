import type { AIProvider } from "../ai/ai-provider";
import { QUIZ_DIFFICULTIES, type GenerateQuizInput, type Quiz } from "./quiz.types";
import { validateQuiz } from "./validateQuiz";

export interface GenerateQuizDependencies {
  aiProvider: AIProvider;
}

export async function generateQuiz(
  input: GenerateQuizInput,
  dependencies: GenerateQuizDependencies,
): Promise<Quiz> {
  const normalizedInput = normalizeGenerateQuizInput(input);
  const generatedQuiz = await dependencies.aiProvider.generateQuiz(normalizedInput);
  const validatedQuiz = validateQuiz(generatedQuiz);

  return {
    ...validatedQuiz,
    difficulty: normalizedInput.difficulty,
    topic: normalizedInput.topic,
  };
}

function normalizeGenerateQuizInput(input: GenerateQuizInput): GenerateQuizInput {
  const topic = input.topic.trim();
  const previousMistakes = Array.from(
    new Set(input.previousMistakes.map((mistake) => mistake.trim()).filter((mistake) => mistake.length > 0)),
  );

  if (topic.length === 0) {
    throw new Error("Quiz topic is required.");
  }

  if (!QUIZ_DIFFICULTIES.includes(input.difficulty)) {
    throw new Error("Quiz difficulty is invalid.");
  }

  return {
    difficulty: input.difficulty,
    previousMistakes,
    topic,
  };
}