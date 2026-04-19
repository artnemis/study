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
    const { moduleId } = await context.params;
    const url = new URL(request.url);
    const studyModule = await getModuleById(
      {
        moduleId,
        requesterId: url.searchParams.get("requesterId"),
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