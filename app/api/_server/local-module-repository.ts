import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

import type {
  CreateMaterialRecord,
  ModuleInvite,
  ModuleMember,
  ModuleRepository,
  ModuleSection,
  StudyMaterial,
  StudyModule,
  UpdateMaterialTopicsRecord,
} from "@/core/module/module.types";

interface LocalStoreFile {
  invites: Array<SerializedModuleInvite>;
  members: Array<SerializedModuleMember>;
  modules: Array<SerializedStudyModule>;
}

interface SerializedStudyModule {
  id: string;
  name: string;
  description: string;
  visibility: StudyModule["visibility"];
  ownerId: string;
  createdAt: string;
  curriculum: ModuleSection[];
  materials: SerializedStudyMaterial[];
}

interface SerializedStudyMaterial {
  id: string;
  moduleId: string;
  filename: string;
  mimeType: string;
  contentPreview: string | null;
  sizeBytes: number;
  extractedTopics: string[];
  estimatedTokens: number;
  uploadedAt: string;
}

interface SerializedModuleMember {
  moduleId: string;
  userId: string;
  role: ModuleMember["role"];
  createdAt: string;
}

interface SerializedModuleInvite {
  id: string;
  moduleId: string;
  email: string;
  role: ModuleInvite["role"];
  token: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
}

const LOCAL_STORE_PATH = path.join(process.cwd(), ".data", "artnemis-mvp.json");

export function createLocalModuleRepository(): ModuleRepository {
  return {
    addMember: async (member) => {
      const store = await readStore();
      const memberIndex = store.members.findIndex(
        (entry) => entry.moduleId === member.moduleId && entry.userId === member.userId,
      );
      const serializedMember = serializeMember(member);

      if (memberIndex >= 0) {
        store.members[memberIndex] = serializedMember;
      } else {
        store.members.push(serializedMember);
      }

      await writeStore(store);

      return deserializeMember(serializedMember);
    },
    addMaterial: async (input: CreateMaterialRecord) => {
      const store = await readStore();
      const moduleIndex = store.modules.findIndex((entry) => entry.id === input.moduleId);

      if (moduleIndex < 0) {
        throw new Error("Module not found.");
      }

      const material: StudyMaterial = {
        contentPreview: input.contentPreview ?? null,
        estimatedTokens: input.estimatedTokens,
        extractedTopics: [],
        filename: input.filename,
        id: randomUUID(),
        mimeType: input.mimeType,
        moduleId: input.moduleId,
        sizeBytes: input.sizeBytes,
        uploadedAt: input.uploadedAt,
      };

      store.modules[moduleIndex] = {
        ...store.modules[moduleIndex],
        materials: [...(store.modules[moduleIndex].materials ?? []), serializeMaterial(material)],
      };
      await writeStore(store);

      return material;
    },
    createInvite: async (input) => {
      const store = await readStore();
      const invite: ModuleInvite = {
        acceptedAt: null,
        createdAt: input.createdAt,
        email: input.email,
        expiresAt: input.expiresAt,
        id: randomUUID(),
        moduleId: input.moduleId,
        role: input.role,
        token: input.token,
      };

      store.invites.push(serializeInvite(invite));
      await writeStore(store);

      return invite;
    },
    createModule: async (input) => {
      const store = await readStore();
      const studyModule: StudyModule = {
        createdAt: input.createdAt,
        curriculum: [],
        description: input.description,
        id: randomUUID(),
        materials: [],
        name: input.name,
        ownerId: input.ownerId,
        visibility: input.visibility,
      };

      store.modules.push(serializeModule(studyModule));
      await writeStore(store);

      return studyModule;
    },
    findInviteByToken: async (token) => {
      const store = await readStore();
      const invite = store.invites.find((entry) => entry.token === token);

      return invite ? deserializeInvite(invite) : null;
    },
    getModuleById: async (moduleId) => {
      const store = await readStore();
      const studyModule = store.modules.find((entry) => entry.id === moduleId);

      return studyModule ? deserializeModule(studyModule) : null;
    },
    hasInviteToken: async (token) => {
      const store = await readStore();

      return store.invites.some((entry) => entry.token === token);
    },
    listMembers: async (moduleId) => {
      const store = await readStore();

      return store.members.filter((entry) => entry.moduleId === moduleId).map((entry) => deserializeMember(entry));
    },
    listModules: async (requesterId) => {
      const store = await readStore();
      const visibleModuleIds = new Set(
        requesterId
          ? store.members.filter((entry) => entry.userId === requesterId).map((entry) => entry.moduleId)
          : [],
      );

      return store.modules
        .filter((entry) => entry.visibility === "public" || visibleModuleIds.has(entry.id))
        .sort((left, right) => (left.createdAt > right.createdAt ? -1 : 1))
        .map((entry) => deserializeModule(entry));
    },
    markInviteAsAccepted: async (inviteId, acceptedAt) => {
      const store = await readStore();
      const inviteIndex = store.invites.findIndex((entry) => entry.id === inviteId);

      if (inviteIndex < 0) {
        throw new Error("Invite token is invalid.");
      }

      const updatedInvite = {
        ...store.invites[inviteIndex],
        acceptedAt: acceptedAt.toISOString(),
      } satisfies SerializedModuleInvite;
      store.invites[inviteIndex] = updatedInvite;
      await writeStore(store);

      return deserializeInvite(updatedInvite);
    },
    updateMaterialTopics: async (input: UpdateMaterialTopicsRecord) => {
      const store = await readStore();
      const moduleIndex = store.modules.findIndex((entry) => entry.id === input.moduleId);

      if (moduleIndex < 0) {
        throw new Error("Module not found.");
      }

      const materialIndex = (store.modules[moduleIndex].materials ?? []).findIndex(
        (entry) => entry.id === input.materialId,
      );

      if (materialIndex < 0) {
        throw new Error("Material not found.");
      }

      const updatedMaterial: SerializedStudyMaterial = {
        ...store.modules[moduleIndex].materials[materialIndex],
        extractedTopics: input.extractedTopics,
      };

      const nextMaterials = [...store.modules[moduleIndex].materials];
      nextMaterials[materialIndex] = updatedMaterial;
      store.modules[moduleIndex] = {
        ...store.modules[moduleIndex],
        materials: nextMaterials,
      };

      await writeStore(store);

      return deserializeMaterial(updatedMaterial);
    },
  };
}

async function readStore(): Promise<LocalStoreFile> {
  try {
    const content = await readFile(LOCAL_STORE_PATH, "utf8");
    const parsed = JSON.parse(content) as LocalStoreFile;

    return {
      invites: parsed.invites ?? [],
      members: parsed.members ?? [],
      modules: parsed.modules ?? [],
    };
  } catch {
    const initialStore = createSeedStore();

    await writeStore(initialStore);

    return initialStore;
  }
}

async function writeStore(store: LocalStoreFile): Promise<void> {
  await mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
  await writeFile(LOCAL_STORE_PATH, JSON.stringify(store, null, 2));
}

function createSeedStore(): LocalStoreFile {
  const createdAt = new Date("2026-04-19T09:00:00.000Z");
  const moduleId = "demo-module-linear-algebra";

  return {
    invites: [],
    members: [
      serializeMember({
        createdAt,
        moduleId,
        role: "owner",
        userId: "demo-owner",
      }),
    ],
    modules: [
      serializeModule({
        createdAt,
        curriculum: [],
        description: "Matrices, determinants, eigenspaces and solved oral-exam prompts.",
        id: moduleId,
        materials: [],
        name: "Linear Algebra Sprint",
        ownerId: "demo-owner",
        visibility: "public",
      }),
    ],
  };
}

function serializeModule(studyModule: StudyModule): SerializedStudyModule {
  return {
    createdAt: studyModule.createdAt.toISOString(),
    curriculum: studyModule.curriculum ?? [],
    description: studyModule.description,
    id: studyModule.id,
    materials: (studyModule.materials ?? []).map((material) => serializeMaterial(material)),
    name: studyModule.name,
    ownerId: studyModule.ownerId,
    visibility: studyModule.visibility,
  };
}

function deserializeModule(studyModule: SerializedStudyModule): StudyModule {
  return {
    createdAt: new Date(studyModule.createdAt),
    curriculum: studyModule.curriculum ?? [],
    description: studyModule.description,
    id: studyModule.id,
    materials: (studyModule.materials ?? []).map((material) => deserializeMaterial(material)),
    name: studyModule.name,
    ownerId: studyModule.ownerId,
    visibility: studyModule.visibility,
  };
}

function serializeMaterial(material: StudyMaterial): SerializedStudyMaterial {
  return {
    contentPreview: material.contentPreview,
    estimatedTokens: material.estimatedTokens,
    extractedTopics: material.extractedTopics,
    filename: material.filename,
    id: material.id,
    mimeType: material.mimeType,
    moduleId: material.moduleId,
    sizeBytes: material.sizeBytes,
    uploadedAt: material.uploadedAt.toISOString(),
  };
}

function deserializeMaterial(material: SerializedStudyMaterial): StudyMaterial {
  return {
    contentPreview: material.contentPreview ?? null,
    estimatedTokens: material.estimatedTokens,
    extractedTopics: material.extractedTopics,
    filename: material.filename,
    id: material.id,
    mimeType: material.mimeType,
    moduleId: material.moduleId,
    sizeBytes: material.sizeBytes,
    uploadedAt: new Date(material.uploadedAt),
  };
}

function serializeMember(member: ModuleMember): SerializedModuleMember {
  return {
    createdAt: member.createdAt.toISOString(),
    moduleId: member.moduleId,
    role: member.role,
    userId: member.userId,
  };
}

function deserializeMember(member: SerializedModuleMember): ModuleMember {
  return {
    createdAt: new Date(member.createdAt),
    moduleId: member.moduleId,
    role: member.role,
    userId: member.userId,
  };
}

function serializeInvite(invite: ModuleInvite): SerializedModuleInvite {
  return {
    acceptedAt: invite.acceptedAt?.toISOString() ?? null,
    createdAt: invite.createdAt.toISOString(),
    email: invite.email,
    expiresAt: invite.expiresAt.toISOString(),
    id: invite.id,
    moduleId: invite.moduleId,
    role: invite.role,
    token: invite.token,
  };
}

function deserializeInvite(invite: SerializedModuleInvite): ModuleInvite {
  return {
    acceptedAt: invite.acceptedAt ? new Date(invite.acceptedAt) : null,
    createdAt: new Date(invite.createdAt),
    email: invite.email,
    expiresAt: new Date(invite.expiresAt),
    id: invite.id,
    moduleId: invite.moduleId,
    role: invite.role,
    token: invite.token,
  };
}