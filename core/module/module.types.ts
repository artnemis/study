export const MODULE_VISIBILITIES = ["public", "private"] as const;

export type ModuleVisibility = (typeof MODULE_VISIBILITIES)[number];

export const MODULE_ROLES = ["owner", "editor", "viewer"] as const;

export type ModuleRole = (typeof MODULE_ROLES)[number];

export const INVITABLE_MODULE_ROLES = ["editor", "viewer"] as const;

export type InvitableModuleRole = (typeof INVITABLE_MODULE_ROLES)[number];

/* ─────────── Curriculum (structured content) ─────────── */

export const LESSON_TYPES = ["reading", "video", "exercise", "quiz"] as const;
export type LessonType = (typeof LESSON_TYPES)[number];

export interface ModuleLesson {
  id: string;
  title: string;
  type: LessonType;
  durationMinutes: number;
  content: string;
  completed: boolean;
}

export interface ModuleSection {
  id: string;
  title: string;
  order: number;
  lessons: ModuleLesson[];
}

/* ─────────── Uploaded study materials ─────────── */

export interface StudyMaterial {
  id: string;
  moduleId: string;
  filename: string;
  mimeType: string;
  contentPreview: string | null;
  sizeBytes: number;
  extractedTopics: string[];
  estimatedTokens: number;
  uploadedAt: Date;
}

export interface CreateMaterialRecord {
  moduleId: string;
  filename: string;
  mimeType: string;
  contentPreview?: string | null;
  sizeBytes: number;
  estimatedTokens: number;
  uploadedAt: Date;
}

export interface UpdateMaterialTopicsRecord {
  moduleId: string;
  materialId: string;
  extractedTopics: string[];
}

/* ─────────── Core module ─────────── */

export interface StudyModule {
  id: string;
  name: string;
  description: string;
  visibility: ModuleVisibility;
  ownerId: string;
  createdAt: Date;
  curriculum: ModuleSection[];
  materials: StudyMaterial[];
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
  addMaterial(input: CreateMaterialRecord): Promise<StudyMaterial>;
  createModule(input: CreateModuleRecord): Promise<StudyModule>;
  createInvite(input: CreateInviteRecord): Promise<ModuleInvite>;
  findInviteByToken(token: string): Promise<ModuleInvite | null>;
  getModuleById(moduleId: string): Promise<StudyModule | null>;
  hasInviteToken(token: string): Promise<boolean>;
  listModules(requesterId?: string | null): Promise<StudyModule[]>;
  listMembers(moduleId: string): Promise<ModuleMember[]>;
  markInviteAsAccepted(inviteId: string, acceptedAt: Date): Promise<ModuleInvite>;
  updateMaterialTopics(input: UpdateMaterialTopicsRecord): Promise<StudyMaterial>;
}