import { randomUUID } from "node:crypto";

import type {
  CreateMaterialRecord,
  ModuleInvite,
  ModuleMember,
  ModuleRepository,
  StudyModule,
  StudyMaterial,
  UpdateMaterialTopicsRecord,
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

interface StudyMaterialRow {
  id: string;
  module_id: string;
  filename: string;
  mime_type: string;
  content_preview: string | null;
  size_bytes: number;
  extracted_topics: string[];
  estimated_tokens: number;
  uploaded_at: Date | string;
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
    addMaterial: async (input: CreateMaterialRecord) => {
      const materialId = randomUUID();
      const result = await execute<StudyMaterialRow>(
        `insert into study_materials (id, module_id, filename, mime_type, content_preview, size_bytes, extracted_topics, estimated_tokens, uploaded_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         returning id, module_id, filename, mime_type, content_preview, size_bytes, extracted_topics, estimated_tokens, uploaded_at`,
        [
          materialId,
          input.moduleId,
          input.filename,
          input.mimeType,
          input.contentPreview ?? null,
          input.sizeBytes,
          [],
          input.estimatedTokens,
          input.uploadedAt.toISOString(),
        ],
      );

      return mapStudyMaterial(result.rows[0]);
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

      if (!result.rows[0]) {
        return null;
      }

      const studyModule = mapStudyModule(result.rows[0]);
      const materials = await listMaterialsForModule(execute, moduleId);

      return {
        ...studyModule,
        materials,
      };
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
    updateMaterialTopics: async (input: UpdateMaterialTopicsRecord) => {
      const result = await execute<StudyMaterialRow>(
        `update study_materials
         set extracted_topics = $3
         where module_id = $1 and id = $2
         returning id, module_id, filename, mime_type, content_preview, size_bytes, extracted_topics, estimated_tokens, uploaded_at`,
        [input.moduleId, input.materialId, input.extractedTopics],
      );

      if (!result.rows[0]) {
        throw new Error("Material not found.");
      }

      return mapStudyMaterial(result.rows[0]);
    },
  };
}

async function listMaterialsForModule(execute: SqlExecutor, moduleId: string): Promise<StudyMaterial[]> {
  const result = await execute<StudyMaterialRow>(
    `select id, module_id, filename, mime_type, content_preview, size_bytes, extracted_topics, estimated_tokens, uploaded_at
     from study_materials
     where module_id = $1
     order by uploaded_at desc`,
    [moduleId],
  );

  return result.rows.map((row) => mapStudyMaterial(row));
}

function mapStudyModule(row: StudyModuleRow): StudyModule {
  return {
    createdAt: toDate(row.created_at),
    curriculum: [],
    description: row.description,
    id: row.id,
    materials: [],
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

function mapStudyMaterial(row: StudyMaterialRow): StudyMaterial {
  return {
    contentPreview: row.content_preview ?? null,
    estimatedTokens: row.estimated_tokens,
    extractedTopics: row.extracted_topics ?? [],
    filename: row.filename,
    id: row.id,
    mimeType: row.mime_type,
    moduleId: row.module_id,
    sizeBytes: row.size_bytes,
    uploadedAt: toDate(row.uploaded_at),
  };
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}