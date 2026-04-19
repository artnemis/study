import { describe, expect, it, vi } from "vitest";

import { createModule, getModuleById, listModules } from "./module.service";
import type {
  CreateModuleRecord,
  CreateInviteRecord,
  ModuleMember,
  ModuleRepository,
  ModuleInvite,
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
        curriculum: [],
        description: "Comprehensive notes for topology.",
        id: "module-1",
        materials: [],
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

describe("getModuleById", () => {
  it("returns the module with members", async () => {
    const repository = createRepositoryDouble();

    await expect(
      getModuleById(
        {
          moduleId: "module-1",
          requesterId: null,
        },
        {
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).resolves.toEqual({
      createdAt: FIXED_DATE,
      curriculum: [],
      description: "Comprehensive notes for topology.",
      id: "module-1",
      materials: [],
      members: [
        {
          createdAt: FIXED_DATE,
          moduleId: "module-1",
          role: "owner",
          userId: "user-123",
        },
      ],
      name: "Topology 101",
      ownerId: "user-123",
      visibility: "public",
    });
  });

  it("rejects private access without membership", async () => {
    const repository = createRepositoryDouble({
      getModuleById: vi.fn(async () => ({
        createdAt: FIXED_DATE,
        curriculum: [],
        description: "Private notes",
        id: "module-1",
        materials: [],
        name: "Topology 101",
        ownerId: "user-123",
        visibility: "private",
      })),
    });

    await expect(
      getModuleById(
        {
          moduleId: "module-1",
          requesterId: "user-999",
        },
        {
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).rejects.toThrow("Private module access requires membership.");
  });

  it("allows private access for members", async () => {
    const repository = createRepositoryDouble({
      getModuleById: vi.fn(async () => ({
        createdAt: FIXED_DATE,
        curriculum: [],
        description: "Private notes",
        id: "module-1",
        materials: [],
        name: "Topology 101",
        ownerId: "user-123",
        visibility: "private",
      })),
    });

    await expect(
      getModuleById(
        {
          moduleId: "module-1",
          requesterId: "user-123",
        },
        {
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).resolves.toMatchObject({
      id: "module-1",
      visibility: "private",
    });
  });

  it("rejects missing module ids", async () => {
    const repository = createRepositoryDouble();

    await expect(
      getModuleById(
        {
          moduleId: "   ",
          requesterId: "user-123",
        },
        {
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).rejects.toThrow("Module id is required.");
  });

  it("rejects unknown modules", async () => {
    const repository = createRepositoryDouble({
      getModuleById: vi.fn(async () => null),
    });

    await expect(
      getModuleById(
        {
          moduleId: "module-404",
          requesterId: "user-123",
        },
        {
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).rejects.toThrow("Module not found.");
  });
});

describe("listModules", () => {
  it("normalizes requester id before loading visible modules", async () => {
    const repository = createRepositoryDouble();

    await expect(
      listModules(
        {
          requesterId: "  user-123  ",
        },
        {
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).resolves.toEqual([
      {
        createdAt: FIXED_DATE,
        curriculum: [],
        description: "Comprehensive notes for topology.",
        id: "module-1",
        materials: [],
        name: "Topology 101",
        ownerId: "user-123",
        visibility: "public",
      },
    ]);

    expect(repository.listModules).toHaveBeenCalledWith("user-123");
  });

  it("passes null requester ids when blank", async () => {
    const repository = createRepositoryDouble();

    await listModules(
      {
        requesterId: "   ",
      },
      {
        now: () => FIXED_DATE,
        repository,
      },
    );

    expect(repository.listModules).toHaveBeenCalledWith(null);
  });
});

function createRepositoryDouble(overrides?: Partial<ModuleRepository>): ModuleRepository {
  return {
    addMember: vi.fn(async (member: ModuleMember) => member),
    addMaterial: vi.fn(async (input) => ({
      ...input,
      extractedTopics: [],
      id: "material-1",
    })),
    createInvite: vi.fn(async (input: CreateInviteRecord): Promise<ModuleInvite> => ({
      ...input,
      id: "invite-1",
    })),
    createModule: vi.fn(async (input: CreateModuleRecord): Promise<StudyModule> => ({
      ...input,
      curriculum: [],
      id: "module-1",
      materials: [],
    })),
    findInviteByToken: vi.fn(async () => null),
    getModuleById: vi.fn(async () => ({
      createdAt: FIXED_DATE,
      curriculum: [],
      description: "Comprehensive notes for topology.",
      id: "module-1",
      materials: [],
      name: "Topology 101",
      ownerId: "user-123",
      visibility: "public",
    })),
    hasInviteToken: vi.fn(async () => false),
    listModules: vi.fn(async () => [
      {
        createdAt: FIXED_DATE,
        curriculum: [],
        description: "Comprehensive notes for topology.",
        id: "module-1",
        materials: [],
        name: "Topology 101",
        ownerId: "user-123",
        visibility: "public",
      },
    ]),
    listMembers: vi.fn(async () => [
      {
        createdAt: FIXED_DATE,
        moduleId: "module-1",
        role: "owner",
        userId: "user-123",
      },
    ]),
    markInviteAsAccepted: vi.fn(async (inviteId: string, acceptedAt: Date): Promise<ModuleInvite> => ({
      acceptedAt,
      createdAt: FIXED_DATE,
      email: "student@example.com",
      expiresAt: new Date(FIXED_DATE.getTime() + 48 * 60 * 60 * 1000),
      id: inviteId,
      moduleId: "module-1",
      role: "viewer",
      token: "invite-token",
    })),
    updateMaterialTopics: vi.fn(async () => ({
      estimatedTokens: 100,
      extractedTopics: ["Topic"],
      filename: "notes.txt",
      id: "material-1",
      mimeType: "text/plain",
      moduleId: "module-1",
      sizeBytes: 400,
      uploadedAt: FIXED_DATE,
    })),
    ...overrides,
  };
}