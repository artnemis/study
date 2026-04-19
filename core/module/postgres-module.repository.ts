import { randomUUID } from "node:crypto";

import type {
  ModuleInvite,
  ModuleMember,
  ModuleRepository,
  StudyModule,
} from "./module.types";

export interface SqlQueryResult<Row> {
  rows: Row[];
}

export type SqlExecutor = <Row extends object>(
  query: string,
  values?: readonly unknown[],
) => Promise<SqlQueryResult<Row>>;

interface StudyModuleRow {
  id: string;
  name: string;
  description: string;
  visibility: string;
  owner_id: string;
  created_at: Date | string;
}

interface ModuleMemberRow {
  module_id: string;
  user_id: string;
  role: string;
  created_at: Date | string;
}

interface ModuleInviteRow {
  id: string;
  module_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: Date | string;
  created_at: Date | string;
  accepted_at: Date | string | null;
}

export function createPostgresModuleRepository(execute: SqlExecutor): ModuleRepository {
  return {
    addMember: async (member) => {
      const result = await execute<ModuleMemberRow>(
        `insert into module_members (module_id, user_id, role, created_at)
         values ($1, $2, $3, $4)
         on conflict (module_id, user_id) do update set role = excluded.role
         returning module_id, user_id, role, created_at`,
        [member.moduleId, member.userId, member.role, member.createdAt.toISOString()],
      );

      return mapModuleMember(result.rows[0]);
    },
    createInvite: async (invite) => {
      const inviteId = randomUUID();
      const result = await execute<ModuleInviteRow>(
        `insert into module_invites (id, module_id, email, role, token, expires_at, created_at, accepted_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         returning id, module_id, email, role, token, expires_at, created_at, accepted_at`,
        [
          inviteId,
          invite.moduleId,
          invite.email,
          invite.role,
          invite.token,
          invite.expiresAt.toISOString(),
          invite.createdAt.toISOString(),
          invite.acceptedAt,
        ],
      );

      return mapModuleInvite(result.rows[0]);
    },
    createModule: async (input) => {
      const moduleId = randomUUID();
      const result = await execute<StudyModuleRow>(
        `insert into study_modules (id, name, description, visibility, owner_id, created_at)
         values ($1, $2, $3, $4, $5, $6)
         returning id, name, description, visibility, owner_id, created_at`,
        [moduleId, input.name, input.description, input.visibility, input.ownerId, input.createdAt.toISOString()],
      );

      return mapStudyModule(result.rows[0]);
    },
    findInviteByToken: async (token) => {
      const result = await execute<ModuleInviteRow>(
        `select id, module_id, email, role, token, expires_at, created_at, accepted_at
         from module_invites
         where token = $1
         limit 1`,
        [token],
      );

      return result.rows[0] ? mapModuleInvite(result.rows[0]) : null;
    },
    getModuleById: async (moduleId) => {
      const result = await execute<StudyModuleRow>(
        `select id, name, description, visibility, owner_id, created_at
         from study_modules
         where id = $1
         limit 1`,
        [moduleId],
      );

      return result.rows[0] ? mapStudyModule(result.rows[0]) : null;
    },
    hasInviteToken: async (token) => {
      const result = await execute<{ token: string }>(
        `select token from module_invites where token = $1 limit 1`,
        [token],
      );

      return result.rows.length > 0;
    },
    listMembers: async (moduleId) => {
      const result = await execute<ModuleMemberRow>(
        `select module_id, user_id, role, created_at
         from module_members
         where module_id = $1
         order by created_at asc`,
        [moduleId],
      );

      return result.rows.map((row) => mapModuleMember(row));
    },
    listModules: async (requesterId) => {
      const values: unknown[] = [];
      let query = `
        select distinct m.id, m.name, m.description, m.visibility, m.owner_id, m.created_at
        from study_modules m
      `;

      if (requesterId) {
        values.push(requesterId);
        query += `
          left join module_members mm on mm.module_id = m.id
          where m.visibility = 'public' or mm.user_id = $1
        `;
      } else {
        query += `
          where m.visibility = 'public'
        `;
      }

      query += ` order by m.created_at desc`;

      const result = await execute<StudyModuleRow>(query, values);

      return result.rows.map((row) => mapStudyModule(row));
    },
    markInviteAsAccepted: async (inviteId, acceptedAt) => {
      const result = await execute<ModuleInviteRow>(
        `update module_invites
         set accepted_at = $2
         where id = $1
         returning id, module_id, email, role, token, expires_at, created_at, accepted_at`,
        [inviteId, acceptedAt.toISOString()],
      );

      return mapModuleInvite(result.rows[0]);
    },
  };
}

function mapStudyModule(row: StudyModuleRow): StudyModule {
  return {
    createdAt: toDate(row.created_at),
    description: row.description,
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    visibility: row.visibility as StudyModule["visibility"],
  };
}

function mapModuleMember(row: ModuleMemberRow): ModuleMember {
  return {
    createdAt: toDate(row.created_at),
    moduleId: row.module_id,
    role: row.role as ModuleMember["role"],
    userId: row.user_id,
  };
}

function mapModuleInvite(row: ModuleInviteRow): ModuleInvite {
  return {
    acceptedAt: row.accepted_at ? toDate(row.accepted_at) : null,
    createdAt: toDate(row.created_at),
    email: row.email,
    expiresAt: toDate(row.expires_at),
    id: row.id,
    moduleId: row.module_id,
    role: row.role as ModuleInvite["role"],
    token: row.token,
  };
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}