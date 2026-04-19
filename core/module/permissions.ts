import type { ModuleRole } from "./module.types";

export type PermissionAction = "read" | "edit" | "updateConfig" | "delete" | "changeRole" | "removeMember";

const ROLE_PERMISSIONS: Record<ModuleRole, PermissionAction[]> = {
  owner: ["read", "edit", "updateConfig", "delete", "changeRole", "removeMember"],
  editor: ["read", "edit", "updateConfig"],
  viewer: ["read"],
};

export function checkPermission(role: ModuleRole, action: PermissionAction): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}
