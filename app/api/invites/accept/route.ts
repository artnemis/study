import { auth } from "@/auth";
import { acceptInvite } from "@/core/module/invite.service";

import { getModuleRepository } from "../../_server/module-repository";
import { jsonResponse, readJsonObject, toErrorResponse } from "../../_server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonResponse({ error: "Authentication required." }, 401);
    }

    const payload = await readJsonObject(request);
    const result = await acceptInvite(
      {
        token: String(payload.token ?? ""),
        userId: session.user.id,
      },
      {
        now: () => new Date(),
        repository: getModuleRepository(),
      },
    );

    return jsonResponse(result, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}