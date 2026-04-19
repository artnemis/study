import { createModule, listModules } from "@/core/module/module.service";
import type { ModuleVisibility } from "@/core/module/module.types";

import { getModuleRepository, getStorageMode } from "../_server/module-repository";
import { jsonResponse, readJsonObject, toErrorResponse } from "../_server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const modules = await listModules(
      {
        requesterId: url.searchParams.get("requesterId"),
      },
      {
        now: () => new Date(),
        repository: getModuleRepository(),
      },
    );

    return jsonResponse({
      modules,
      storageMode: getStorageMode(),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await readJsonObject(request);
    const result = await createModule(
      {
        description: String(payload.description ?? ""),
        name: String(payload.name ?? ""),
        ownerId: String(payload.ownerId ?? ""),
        visibility: String(payload.visibility ?? "public") as ModuleVisibility,
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