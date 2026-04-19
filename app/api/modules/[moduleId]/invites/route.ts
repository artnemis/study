import { auth } from "@/auth";
import { createInvite } from "@/core/module/invite.service";
import type { InvitableModuleRole } from "@/core/module/module.types";

import { requireModulePermission } from "../../../_server/module-access";
import { getModuleRepository } from "../../../_server/module-repository";
import { jsonResponse, readJsonObject, toErrorResponse } from "../../../_server/http";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ moduleId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonResponse({ error: "Authentication required." }, 401);
    }

    const { moduleId } = await context.params;
    await requireModulePermission(moduleId, session.user.id, "updateConfig");
    const payload = await readJsonObject(request);
    const invite = await createInvite(
      {
        email: String(payload.email ?? ""),
        moduleId,
        role: String(payload.role ?? "viewer") as InvitableModuleRole,
      },
      {
        generateToken: () => crypto.randomUUID().replace(/-/g, ""),
        now: () => new Date(),
        repository: getModuleRepository(),
      },
    );

    return jsonResponse(invite, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}