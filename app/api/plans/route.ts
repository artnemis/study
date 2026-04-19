import { generatePlan } from "@/core/plan/generatePlan";

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
    const plan = await generatePlan(
      {
        dailyStudyMinutes: Number(payload.dailyStudyMinutes ?? 0),
        examDate: String(payload.examDate ?? ""),
        topics: Array.isArray(payload.topics) ? payload.topics.map((value) => String(value)) : [],
      },
      {
        aiProvider: getAIProvider(userApiKey),
      },
    );

    return jsonResponse({
      aiMode: getAIMode(userApiKey),
      plan,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}