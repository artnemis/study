import { generatePlan } from "@/core/plan/generatePlan";

import { getAIMode, getAIProvider } from "../_server/ai-provider";
import { jsonResponse, readJsonObject, toErrorResponse } from "../_server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await readJsonObject(request);
    const plan = await generatePlan(
      {
        dailyStudyMinutes: Number(payload.dailyStudyMinutes ?? 0),
        examDate: String(payload.examDate ?? ""),
        topics: Array.isArray(payload.topics) ? payload.topics.map((value) => String(value)) : [],
      },
      {
        aiProvider: getAIProvider(),
      },
    );

    return jsonResponse({
      aiMode: getAIMode(),
      plan,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}