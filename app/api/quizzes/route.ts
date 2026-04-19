import { generateQuiz } from "@/core/quiz/generateQuiz";
import type { QuizDifficulty } from "@/core/quiz/quiz.types";

import { getAIMode, getAIProvider } from "../_server/ai-provider";
import { jsonResponse, readJsonObject, toErrorResponse } from "../_server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await readJsonObject(request);
    const quiz = await generateQuiz(
      {
        difficulty: String(payload.difficulty ?? "easy") as QuizDifficulty,
        previousMistakes: Array.isArray(payload.previousMistakes)
          ? payload.previousMistakes.map((value) => String(value))
          : [],
        topic: String(payload.topic ?? ""),
      },
      {
        aiProvider: getAIProvider(),
      },
    );

    return jsonResponse({
      aiMode: getAIMode(),
      quiz,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}