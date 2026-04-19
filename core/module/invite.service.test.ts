import { describe, expect, it, vi } from "vitest";

import { acceptInvite, createInvite } from "./invite.service";
import type {
  CreateInviteRecord,
  ModuleMember,
  ModuleRepository,
  ModuleInvite,
  StudyModule,
} from "./module.types";

const FIXED_DATE = new Date("2026-04-19T09:00:00.000Z");

describe("createInvite", () => {
  it("generates a secure token and sets a 48 hour expiration", async () => {
    const repository = createRepositoryDouble();

    await expect(
      createInvite(
        {
          email: "  Student@Example.com  ",
          moduleId: "  module-1  ",
          role: "viewer",
        },
        {
          generateToken: () => "token-123",
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).resolves.toEqual({
      acceptedAt: null,
      createdAt: FIXED_DATE,
      email: "student@example.com",
      expiresAt: new Date(FIXED_DATE.getTime() + 48 * 60 * 60 * 1000),
      id: "invite-1",
      moduleId: "module-1",
      role: "viewer",
      token: "token-123",
    });
  });

  it("retries when a generated token already exists", async () => {
    const repository = createRepositoryDouble({
      hasInviteToken: vi
        .fn<ModuleRepository["hasInviteToken"]>()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false),
    });

    const generateToken = vi.fn<() => string>().mockReturnValueOnce("taken-token").mockReturnValueOnce("fresh-token");

    await expect(
      createInvite(
        {
          email: "student@example.com",
          moduleId: "module-1",
          role: "editor",
        },
        {
          generateToken,
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).resolves.toMatchObject({
      token: "fresh-token",
    });
  });

  it("rejects invalid invite email and role", async () => {
    const repository = createRepositoryDouble();

    await expect(
      createInvite(
        {
          email: "invalid-email",
          moduleId: "module-1",
          role: "viewer",
        },
        {
          generateToken: () => "token-123",
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).rejects.toThrow("Invite email is invalid.");

    await expect(
      createInvite(
        {
          email: "student@example.com",
          moduleId: "module-1",
          role: "owner" as "viewer",
        },
        {
          generateToken: () => "token-123",
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).rejects.toThrow("Invite role is invalid.");
  });

  it("fails when unique token generation cannot succeed", async () => {
    const repository = createRepositoryDouble({
      hasInviteToken: vi.fn(async () => true),
    });

    await expect(
      createInvite(
        {
          email: "student@example.com",
          moduleId: "module-1",
          role: "viewer",
        },
        {
          generateToken: () => "token-123",
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).rejects.toThrow("Unable to generate a unique invite token.");
  });
});

describe("acceptInvite", () => {
  it("validates the token and creates membership", async () => {
    const repository = createRepositoryDouble({
      findInviteByToken: vi.fn(async () => ({
        acceptedAt: null,
        createdAt: FIXED_DATE,
        email: "student@example.com",
        expiresAt: new Date(FIXED_DATE.getTime() + 48 * 60 * 60 * 1000),
        id: "invite-1",
        moduleId: "module-1",
        role: "editor",
        token: "token-123",
      })),
      listMembers: vi.fn(async () => []),
    });

    await expect(
      acceptInvite(
        {
          token: "token-123",
          userId: "user-999",
        },
        {
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).resolves.toEqual({
      invite: {
        acceptedAt: FIXED_DATE,
        createdAt: FIXED_DATE,
        email: "student@example.com",
        expiresAt: new Date(FIXED_DATE.getTime() + 48 * 60 * 60 * 1000),
        id: "invite-1",
        moduleId: "module-1",
        role: "viewer",
        token: "invite-token",
      },
      member: {
        createdAt: FIXED_DATE,
        moduleId: "module-1",
        role: "editor",
        userId: "user-999",
      },
    });
  });

  it("rejects expired invites", async () => {
    const repository = createRepositoryDouble({
      findInviteByToken: vi.fn(async () => ({
        acceptedAt: null,
        createdAt: FIXED_DATE,
        email: "student@example.com",
        expiresAt: new Date(FIXED_DATE.getTime() - 1),
        id: "invite-1",
        moduleId: "module-1",
        role: "viewer",
        token: "token-123",
      })),
    });

    await expect(
      acceptInvite(
        {
          token: "token-123",
          userId: "user-999",
        },
        {
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).rejects.toThrow("Invite has expired.");
  });

  it("rejects invalid and already used tokens", async () => {
    const missingInviteRepository = createRepositoryDouble();

    await expect(
      acceptInvite(
        {
          token: "missing-token",
          userId: "user-999",
        },
        {
          now: () => FIXED_DATE,
          repository: missingInviteRepository,
        },
      ),
    ).rejects.toThrow("Invite token is invalid.");

    const usedInviteRepository = createRepositoryDouble({
      findInviteByToken: vi.fn(async () => ({
        acceptedAt: FIXED_DATE,
        createdAt: FIXED_DATE,
        email: "student@example.com",
        expiresAt: new Date(FIXED_DATE.getTime() + 48 * 60 * 60 * 1000),
        id: "invite-1",
        moduleId: "module-1",
        role: "viewer",
        token: "token-123",
      })),
    });

    await expect(
      acceptInvite(
        {
          token: "token-123",
          userId: "user-999",
        },
        {
          now: () => FIXED_DATE,
          repository: usedInviteRepository,
        },
      ),
    ).rejects.toThrow("Invite has already been used.");
  });

  it("reuses an existing membership without duplicating it", async () => {
    const existingMember: ModuleMember = {
      createdAt: FIXED_DATE,
      moduleId: "module-1",
      role: "viewer",
      userId: "user-999",
    };
    const repository = createRepositoryDouble({
      findInviteByToken: vi.fn(async () => ({
        acceptedAt: null,
        createdAt: FIXED_DATE,
        email: "student@example.com",
        expiresAt: new Date(FIXED_DATE.getTime() + 48 * 60 * 60 * 1000),
        id: "invite-1",
        moduleId: "module-1",
        role: "viewer",
        token: "token-123",
      })),
      listMembers: vi.fn(async () => [existingMember]),
    });

    await expect(
      acceptInvite(
        {
          token: "token-123",
          userId: "user-999",
        },
        {
          now: () => FIXED_DATE,
          repository,
        },
      ),
    ).resolves.toMatchObject({
      member: existingMember,
    });

    expect(repository.addMember).not.toHaveBeenCalled();
  });
});

function createRepositoryDouble(overrides?: Partial<ModuleRepository>): ModuleRepository {
  return {
    addMember: vi.fn(async (member: ModuleMember) => member),
    createInvite: vi.fn(async (input: CreateInviteRecord): Promise<ModuleInvite> => ({
      ...input,
      id: "invite-1",
    })),
    createModule: vi.fn(async (input): Promise<StudyModule> => ({
      ...input,
      id: "module-1",
    })),
    findInviteByToken: vi.fn(async () => null),
    getModuleById: vi.fn(async () => null),
    hasInviteToken: vi.fn(async () => false),
    listMembers: vi.fn(async () => []),
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
    ...overrides,
  };
}