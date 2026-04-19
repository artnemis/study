export const MODULE_VISIBILITIES = ["public", "private"] as const;

export type ModuleVisibility = (typeof MODULE_VISIBILITIES)[number];

export const MODULE_ROLES = ["owner", "editor", "viewer"] as const;

export type ModuleRole = (typeof MODULE_ROLES)[number];

export interface StudyModule {
  id: string;
  name: string;
  description: string;
  visibility: ModuleVisibility;
  ownerId: string;
  createdAt: Date;
}

export interface ModuleMember {
  moduleId: string;
  userId: string;
  role: ModuleRole;
  createdAt: Date;
}

export interface CreateModuleInput {
  name: string;
  description: string;
  visibility: ModuleVisibility;
  ownerId: string;
}

export interface CreateModuleRecord {
  name: string;
  description: string;
  visibility: ModuleVisibility;
  ownerId: string;
  createdAt: Date;
}

export interface CreateModuleResult {
  module: StudyModule;
  ownerMembership: ModuleMember;
}

export interface ModuleRepository {
  addMember(member: ModuleMember): Promise<ModuleMember>;
  createModule(input: CreateModuleRecord): Promise<StudyModule>;
}