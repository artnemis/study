import { describe, expect, it, vi } from "vitest";

import { createPostgresModuleRepository, type SqlExecutor } from "./postgres-module.repository";

const FIXED_DATE = new Date("2026-04-19T09:00:00.000Z");

describe("createPostgresModuleRepository", () => {
  it("creates modules and maps database rows", async () => {
    const execute = vi.fn<SqlExecutor>(async () => ({
      rows: [
        {
          created_at: FIXED_DATE.toISOString(),
          description: "Linear algebra notes",
          id: "module-1",
          name: "Linear Algebra",
          owner_id: "user-1",
          visibility: "public",
        },
      ],
    }));
    const repository = createPostgresModuleRepository(execute);

    await expect(
      repository.createModule({
        createdAt: FIXED_DATE,
        description: "Linear algebra notes",
        name: "Linear Algebra",
        ownerId: "user-1",
        visibility: "public",
      }),
    ).resolves.toEqual({
      createdAt: FIXED_DATE,
      description: "Linear algebra notes",
      id: "module-1",
      name: "Linear Algebra",
      ownerId: "user-1",
      visibility: "public",
    });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("adds members and updates existing memberships", async () => {
    const execute = vi.fn<SqlExecutor>(async () => ({
      rows: [
        {
          created_at: FIXED_DATE,
          module_id: "module-1",
          role: "editor",
          user_id: "user-2",
        },
      ],
    }));
    const repository = createPostgresModuleRepository(execute);

    await expect(
      repository.addMember({
        createdAt: FIXED_DATE,
        moduleId: "module-1",
        role: "editor",
        userId: "user-2",
      }),
    ).resolves.toEqual({
      createdAt: FIXED_DATE,
      moduleId: "module-1",
      role: "editor",
      userId: "user-2",
    });
  });

  it("lists modules for public access and scoped access", async () => {
    const execute = vi
      .fn<SqlExecutor>()
      .mockResolvedValueOnce({
        rows: [
          {
            created_at: FIXED_DATE,
            description: "Public notes",
            id: "module-1",
            name: "Public Module",
            owner_id: "user-1",
            visibility: "public",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            created_at: FIXED_DATE,
            description: "Private notes",
            id: "module-2",
            name: "Private Module",
            owner_id: "user-2",
            visibility: "private",
          },
        ],
      });
    const repository = createPostgresModuleRepository(execute);

    await expect(repository.listModules(null)).resolves.toHaveLength(1);
    await expect(repository.listModules("user-2")).resolves.toHaveLength(1);
    expect(execute.mock.calls[0]?.[1]).toEqual([]);
    expect(execute.mock.calls[1]?.[1]).toEqual(["user-2"]);
  });

  it("gets a module by id or null", async () => {
    const execute = vi
      .fn<SqlExecutor>()
      .mockResolvedValueOnce({
        rows: [
          {
            created_at: FIXED_DATE,
            description: "Module notes",
            id: "module-1",
            name: "Module",
            owner_id: "user-1",
            visibility: "public",
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] });
    const repository = createPostgresModuleRepository(execute);

    await expect(repository.getModuleById("module-1")).resolves.toMatchObject({ id: "module-1" });
    await expect(repository.getModuleById("missing")).resolves.toBeNull();
  });

  it("creates invites and resolves invite lookups", async () => {
    const execute = vi
      .fn<SqlExecutor>()
      .mockResolvedValueOnce({
        rows: [
          {
            accepted_at: null,
            created_at: FIXED_DATE,
            email: "student@example.com",
            expires_at: new Date(FIXED_DATE.getTime() + 1000).toISOString(),
            id: "invite-1",
            module_id: "module-1",
            role: "viewer",
            token: "token-1",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            accepted_at: null,
            created_at: FIXED_DATE,
            email: "student@example.com",
            expires_at: new Date(FIXED_DATE.getTime() + 1000).toISOString(),
            id: "invite-1",
            module_id: "module-1",
            role: "viewer",
            token: "token-1",
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] });
    const repository = createPostgresModuleRepository(execute);

    await expect(
      repository.createInvite({
        acceptedAt: null,
        createdAt: FIXED_DATE,
        email: "student@example.com",
        expiresAt: new Date(FIXED_DATE.getTime() + 1000),
        moduleId: "module-1",
        role: "viewer",
        token: "token-1",
      }),
    ).resolves.toMatchObject({
      email: "student@example.com",
      token: "token-1",
    });
    await expect(repository.findInviteByToken("token-1")).resolves.toMatchObject({ token: "token-1" });
    await expect(repository.findInviteByToken("missing")).resolves.toBeNull();
  });

  it("checks token existence", async () => {
    const execute = vi
      .fn<SqlExecutor>()
      .mockResolvedValueOnce({ rows: [{ token: "token-1" }] })
      .mockResolvedValueOnce({ rows: [] });
    const repository = createPostgresModuleRepository(execute);

    await expect(repository.hasInviteToken("token-1")).resolves.toBe(true);
    await expect(repository.hasInviteToken("missing")).resolves.toBe(false);
  });

  it("lists members and marks invites as accepted", async () => {
    const execute = vi
      .fn<SqlExecutor>()
      .mockResolvedValueOnce({
        rows: [
          {
            created_at: FIXED_DATE.toISOString(),
            module_id: "module-1",
            role: "owner",
            user_id: "user-1",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            accepted_at: FIXED_DATE.toISOString(),
            created_at: FIXED_DATE.toISOString(),
            email: "student@example.com",
            expires_at: FIXED_DATE.toISOString(),
            id: "invite-1",
            module_id: "module-1",
            role: "viewer",
            token: "token-1",
          },
        ],
      });
    const repository = createPostgresModuleRepository(execute);

    await expect(repository.listMembers("module-1")).resolves.toEqual([
      {
        createdAt: FIXED_DATE,
        moduleId: "module-1",
        role: "owner",
        userId: "user-1",
      },
    ]);
    await expect(repository.markInviteAsAccepted("invite-1", FIXED_DATE)).resolves.toMatchObject({
      acceptedAt: FIXED_DATE,
      id: "invite-1",
    });
  });
});