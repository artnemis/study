export const MODULE_VISIBILITIES = ["public", "private"] as const;

export type ModuleVisibility = (typeof MODULE_VISIBILITIES)[number];

export const MODULE_ROLES = ["owner", "editor", "viewer"] as const;

export type ModuleRole = (typeof MODULE_ROLES)[number];

export const INVITABLE_MODULE_ROLES = ["editor", "viewer"] as const;

export type InvitableModuleRole = (typeof INVITABLE_MODULE_ROLES)[number];

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

export interface ModuleDetails extends StudyModule {
  members: ModuleMember[];
}

export interface ModuleInvite {
  id: string;
  moduleId: string;
  email: string;
  role: InvitableModuleRole;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt: Date | null;
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

export interface ListModulesInput {
  requesterId?: string | null;
}

export interface GetModuleByIdInput {
  moduleId: string;
  requesterId?: string | null;
}

export interface CreateInviteInput {
  moduleId: string;
  email: string;
  role: InvitableModuleRole;
}

export interface CreateInviteRecord extends CreateInviteInput {
  token: string;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt: null;
}

export interface AcceptInviteInput {
  token: string;
  userId: string;
}

export interface AcceptInviteResult {
  invite: ModuleInvite;
  member: ModuleMember;
}

export interface ModuleRepository {
  addMember(member: ModuleMember): Promise<ModuleMember>;
  createModule(input: CreateModuleRecord): Promise<StudyModule>;
  createInvite(input: CreateInviteRecord): Promise<ModuleInvite>;
  findInviteByToken(token: string): Promise<ModuleInvite | null>;
  getModuleById(moduleId: string): Promise<StudyModule | null>;
  hasInviteToken(token: string): Promise<boolean>;
  listModules(requesterId?: string | null): Promise<StudyModule[]>;
  listMembers(moduleId: string): Promise<ModuleMember[]>;
  markInviteAsAccepted(inviteId: string, acceptedAt: Date): Promise<ModuleInvite>;
}