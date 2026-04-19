import { generateQuiz } from "@/core/quiz/generateQuiz";
import type { QuizDifficulty } from "@/core/quiz/quiz.types";

import { auth } from "@/auth";
import { getAIMode, getAIProvider } from "../_server/ai-provider";
import { createLocalUserRepository } from "../_server/user-repository";
import { jsonResponse, readJsonObject, toErrorResponse } from "../_server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    let userApiKey: string | null = null;

    if (session?.user?.id) {
      const userRepo = createLocalUserRepository();
      const settings = await userRepo.getSettings(session.user.id);
      userApiKey = settings.openaiApiKey;
    }

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
        aiProvider: getAIProvider(userApiKey),
      },
    );

    return jsonResponse({
      aiMode: getAIMode(userApiKey),
      quiz,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}