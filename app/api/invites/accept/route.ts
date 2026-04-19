import { acceptInvite } from "@/core/module/invite.service";

import { getModuleRepository } from "../../_server/module-repository";
import { jsonResponse, readJsonObject, toErrorResponse } from "../../_server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await readJsonObject(request);
    const result = await acceptInvite(
      {
        token: String(payload.token ?? ""),
        userId: String(payload.userId ?? ""),
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