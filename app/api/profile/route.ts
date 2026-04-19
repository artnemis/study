import { auth } from "@/auth";
import { createLocalUserRepository } from "@/app/api/_server/user-repository";
import { jsonResponse, readJsonObject, toErrorResponse } from "@/app/api/_server/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userRepo = createLocalUserRepository();
    const settings = await userRepo.getSettings(session.user.id);

    return jsonResponse({
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      locale: settings.locale,
      hasOpenaiKey: !!settings.openaiApiKey,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const payload = await readJsonObject(request);
    const userRepo = createLocalUserRepository();

    const patch: { openaiApiKey?: string | null; locale?: string } = {};

    if ("openaiApiKey" in payload) {
      const key = payload.openaiApiKey;
      patch.openaiApiKey = typeof key === "string" && key.trim().length > 0 ? key.trim() : null;
    }

    if ("locale" in payload) {
      const loc = String(payload.locale ?? "");
      if (["it", "en", "fr", "es", "de"].includes(loc)) {
        patch.locale = loc;
      }
    }

    const settings = await userRepo.updateSettings(session.user.id, patch);

    return jsonResponse({
      locale: settings.locale,
      hasOpenaiKey: !!settings.openaiApiKey,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
