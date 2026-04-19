import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

import type { AppUser, UserRepository } from "@/core/auth/auth.types";

interface SerializedUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

interface SerializedSettings {
  userId: string;
  openaiApiKey: string | null;
  locale: string;
}

interface UserStoreFile {
  users: SerializedUser[];
  settings: SerializedSettings[];
}

const STORE_PATH = path.join(process.cwd(), ".data", "artnemis-users.json");

export function createLocalUserRepository(): UserRepository {
  return {
    createUser: async (input) => {
      const store = await readStore();
      const existing = store.users.find((u) => u.email === input.email);

      if (existing) {
        throw new Error("A user with this email already exists.");
      }

      const user: SerializedUser = {
        id: randomUUID(),
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
        createdAt: new Date().toISOString(),
      };

      store.users.push(user);
      store.settings.push({ userId: user.id, openaiApiKey: null, locale: "en" });
      await writeStore(store);

      return deserializeUser(user);
    },

    findUserByEmail: async (email) => {
      const store = await readStore();
      const user = store.users.find((u) => u.email === email);
      return user ? deserializeUser(user) : null;
    },

    findUserById: async (id) => {
      const store = await readStore();
      const user = store.users.find((u) => u.id === id);
      return user ? deserializeUser(user) : null;
    },

    getSettings: async (userId) => {
      const store = await readStore();
      const settings = store.settings.find((s) => s.userId === userId);
      return settings ?? { userId, openaiApiKey: null, locale: "en" };
    },

    updateSettings: async (userId, patch) => {
      const store = await readStore();
      let idx = store.settings.findIndex((s) => s.userId === userId);

      if (idx < 0) {
        store.settings.push({ userId, openaiApiKey: null, locale: "en" });
        idx = store.settings.length - 1;
      }

      if (patch.openaiApiKey !== undefined) store.settings[idx].openaiApiKey = patch.openaiApiKey;
      if (patch.locale !== undefined) store.settings[idx].locale = patch.locale;

      await writeStore(store);
      return store.settings[idx];
    },
  };
}

async function readStore(): Promise<UserStoreFile> {
  try {
    const content = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(content) as UserStoreFile;
    return { users: parsed.users ?? [], settings: parsed.settings ?? [] };
  } catch {
    const initial: UserStoreFile = { users: [], settings: [] };
    await writeStore(initial);
    return initial;
  }
}

async function writeStore(store: UserStoreFile): Promise<void> {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

function deserializeUser(u: SerializedUser): AppUser {
  return { ...u, createdAt: new Date(u.createdAt) };
}
