import { checkPermission, type PermissionAction } from "@/core/module/permissions";
import type { ModuleRole, StudyModule } from "@/core/module/module.types";

import { getModuleRepository } from "./module-repository";

export async function requireModulePermission(
  moduleId: string,
  userId: string,
  action: PermissionAction,
): Promise<{ module: StudyModule; role: ModuleRole }> {
  const repository = getModuleRepository();
  const studyModule = await repository.getModuleById(moduleId);

  if (!studyModule) {
    throw new Error("Module not found.");
  }

  const members = await repository.listMembers(moduleId);
  const role = resolveModuleRole(studyModule, members, userId);

  if (!role || !checkPermission(role, action)) {
    throw new Error("Permission denied for this module.");
  }

  return {
    module: studyModule,
    role,
  };
}

function resolveModuleRole(
  studyModule: StudyModule,
  members: Array<{ userId: string; role: ModuleRole }>,
  userId: string,
): ModuleRole | null {
  if (studyModule.ownerId === userId) {
    return "owner";
  }

  return members.find((member) => member.userId === userId)?.role ?? null;
}