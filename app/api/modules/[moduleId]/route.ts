import { auth } from "@/auth";
import { getModuleById } from "@/core/module/module.service";

import { getModuleRepository, getStorageMode } from "../../_server/module-repository";
import { jsonResponse, toErrorResponse } from "../../_server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ moduleId: string }> },
) {
  try {
    const session = await auth();
    const { moduleId } = await context.params;
    const studyModule = await getModuleById(
      {
        moduleId,
        requesterId: session?.user?.id ?? null,
      },
      {
        now: () => new Date(),
        repository: getModuleRepository(),
      },
    );

    return jsonResponse({
      ...studyModule,
      storageMode: getStorageMode(),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}