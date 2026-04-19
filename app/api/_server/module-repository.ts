import type { ModuleRepository } from "@/core/module/module.types";
import { createPostgresModuleRepository } from "@/core/module/postgres-module.repository";

import { postgresQuery } from "./database";
import { createLocalModuleRepository } from "./local-module-repository";

let repository: ModuleRepository | null = null;

export function getModuleRepository(): ModuleRepository {
  if (!repository) {
    repository = process.env.DATABASE_URL?.trim()
      ? createPostgresModuleRepository(postgresQuery)
      : createLocalModuleRepository();
  }

  return repository;
}

export function getStorageMode(): "local-json" | "postgres" {
  return process.env.DATABASE_URL?.trim() ? "postgres" : "local-json";
}