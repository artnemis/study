import {
  type CreateModuleInput,
  type CreateModuleResult,
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