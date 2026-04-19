import { Pool } from "pg";

import type { SqlExecutor } from "@/core/module/postgres-module.repository";

let pool: Pool | null = null;
let schemaReadyPromise: Promise<void> | null = null;

export const postgresQuery: SqlExecutor = async <Row extends object>(
  query: string,
  values: readonly unknown[] = [],
) => {
  const activePool = getPool();
  await ensureSchema(activePool);

  const result = await activePool.query(query, [...values]);

  return {
    rows: result.rows as Row[],
  };
};

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for PostgreSQL mode.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
    });
  }

  return pool;
}

async function ensureSchema(activePool: Pool): Promise<void> {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await activePool.query(`
        create table if not exists study_modules (
          id text primary key,
          name text not null,
          description text not null,
          visibility text not null check (visibility in ('public', 'private')),
          owner_id text not null,
          created_at timestamptz not null
        );

        create table if not exists module_members (
          module_id text not null references study_modules(id) on delete cascade,
          user_id text not null,
          role text not null check (role in ('owner', 'editor', 'viewer')),
          created_at timestamptz not null,
          primary key (module_id, user_id)
        );

        create table if not exists module_invites (
          id text primary key,
          module_id text not null references study_modules(id) on delete cascade,
          email text not null,
          role text not null check (role in ('editor', 'viewer')),
          token text not null unique,
          expires_at timestamptz not null,
          created_at timestamptz not null,
          accepted_at timestamptz null
        );

        create table if not exists study_materials (
          id text primary key,
          module_id text not null references study_modules(id) on delete cascade,
          filename text not null,
          mime_type text not null,
          content_preview text null,
          size_bytes integer not null,
          extracted_topics text[] not null default '{}',
          estimated_tokens integer not null,
          uploaded_at timestamptz not null
        );

        alter table study_materials add column if not exists content_preview text null;

        create index if not exists idx_module_members_user_id on module_members(user_id);
        create index if not exists idx_module_invites_token on module_invites(token);
        create index if not exists idx_study_materials_module_id on study_materials(module_id);
      `);
    })();
  }

  await schemaReadyPromise;
}