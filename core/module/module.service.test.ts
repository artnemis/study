import { describe, expect, it, vi } from "vitest";

import { createModule } from "./module.service";
import type {
  CreateModuleRecord,
  ModuleMember,
  ModuleRepository,
  StudyModule,
} from "./module.types";

const FIXED_DATE = new Date("2026-04-19T09:00:00.000Z");

describe("createModule", () => {
  it("assigns the owner role and persists the module", async () => {
    const repository = createRepositoryDouble();

    const result = await createModule(
      {
        description: "  Comprehensive notes for topology.  ",
        name: "  Topology 101  ",
        ownerId: "  user-123  ",
        visibility: "private",
      },
      {
        now: () => FIXED_DATE,
        repository,
      },
    );

    expect(repository.createModule).toHaveBeenCalledWith({
      createdAt: FIXED_DATE,
      description: "Comprehensive notes for topology.",
      name: "Topology 101",
      ownerId: "user-123",
      visibility: "private",
    } satisfies CreateModuleRecord);

    expect(repository.addMember).toHaveBeenCalledWith({
      createdAt: FIXED_DATE,
      moduleId: "module-1",
      role: "owner",
      userId: "user-123",
    } satisfies ModuleMember);

    expect(result).toEqual({
      module: {
        createdAt: FIXED_DATE,
        description: "Comprehensive notes for topology.",
        id: "module-1",
        name: "Topology 101",
        ownerId: "user-123",
        visibility: "private",
      },
      ownerMembership: {
        createdAt: FIXED_DATE,
        moduleId: "module-1",
        role: "owner",
        userId: "user-123",
      },
    });
  });

  it("rejects an invalid visibility value", async () => {
    const repository = createRepositoryDouble();

    await expect(
      createModule(
        {
          description: "Exam prep",
          name: "Algorithms",
          ownerId: "user-123",
          visibility: "internal" as "public",
        },
        {
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).rejects.toThrow("Module visibility is invalid.");

    expect(repository.createModule).not.toHaveBeenCalled();
    expect(repository.addMember).not.toHaveBeenCalled();
  });

  it("rejects a blank module name", async () => {
    const repository = createRepositoryDouble();

    await expect(
      createModule(
        {
          description: "Exam prep",
          name: "   ",
          ownerId: "user-123",
          visibility: "public",
        },
        {
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).rejects.toThrow("Module name is required.");
  });

  it("rejects a blank owner id", async () => {
    const repository = createRepositoryDouble();

    await expect(
      createModule(
        {
          description: "Exam prep",
          name: "Algorithms",
          ownerId: "   ",
          visibility: "public",
        },
        {
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).rejects.toThrow("Owner id is required.");
  });
});

function createRepositoryDouble(): ModuleRepository {
  return {
    addMember: vi.fn(async (member: ModuleMember) => member),
    createModule: vi.fn(async (input: CreateModuleRecord): Promise<StudyModule> => ({
      ...input,
      id: "module-1",
    })),
  };
}