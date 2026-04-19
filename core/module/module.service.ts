import {
  type CreateModuleInput,
  type CreateModuleResult,
  type GetModuleByIdInput,
  type ListModulesInput,
  type ModuleDetails,
  type ModuleMember,
  type ModuleRepository,
  MODULE_VISIBILITIES,
} from "./module.types";

export interface CreateModuleDependencies {
  now: () => Date;
  repository: ModuleRepository;
}

const OWNER_ROLE = "owner" as const;

export async function createModule(
  input: CreateModuleInput,
  dependencies: CreateModuleDependencies,
): Promise<CreateModuleResult> {
  const normalizedInput = normalizeCreateModuleInput(input);
  const createdAt = dependencies.now();

  const studyModule = await dependencies.repository.createModule({
    ...normalizedInput,
    createdAt,
  });

  const ownerMembership = await dependencies.repository.addMember({
    createdAt,
    moduleId: studyModule.id,
    role: OWNER_ROLE,
    userId: normalizedInput.ownerId,
  });

  return {
    module: studyModule,
    ownerMembership,
  };
}

export async function getModuleById(
  input: GetModuleByIdInput,
  dependencies: CreateModuleDependencies,
): Promise<ModuleDetails> {
  const moduleId = normalizeRequiredString(input.moduleId, "Module id is required.");
  const requesterId = normalizeOptionalString(input.requesterId);
  const studyModule = await dependencies.repository.getModuleById(moduleId);

  if (!studyModule) {
    throw new Error("Module not found.");
  }

  const members = await dependencies.repository.listMembers(moduleId);

  if (studyModule.visibility === "private" && !isModuleMember(requesterId, members)) {
    throw new Error("Private module access requires membership.");
  }

  return {
    ...studyModule,
    members,
  };
}

export async function listModules(
  input: ListModulesInput,
  dependencies: CreateModuleDependencies,
) {
  const requesterId = normalizeOptionalString(input.requesterId);

  return dependencies.repository.listModules(requesterId);
}

function normalizeCreateModuleInput(input: CreateModuleInput): CreateModuleInput {
  const name = input.name.trim();
  const description = input.description.trim();
  const ownerId = input.ownerId.trim();

  if (name.length === 0) {
    throw new Error("Module name is required.");
  }

  if (ownerId.length === 0) {
    throw new Error("Owner id is required.");
  }

  if (!MODULE_VISIBILITIES.includes(input.visibility)) {
    throw new Error("Module visibility is invalid.");
  }

  return {
    description,
    name,
    ownerId,
    visibility: input.visibility,
  };
}

function isModuleMember(requesterId: string | null, members: ModuleMember[]): boolean {
  if (!requesterId) {
    return false;
  }

  return members.some((member) => member.userId === requesterId);
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length === 0 ? null : normalizedValue;
}

function normalizeRequiredString(value: string, errorMessage: string): string {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    throw new Error(errorMessage);
  }

  return normalizedValue;
}