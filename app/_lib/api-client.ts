import type { CreateModuleResult, ModuleDetails, ModuleInvite, StudyMaterial, StudyModule } from "@/core/module/module.types";
import type { StudyPlan, PlanTemplate } from "@/core/plan/plan.types";
import type { Quiz, QuizDifficulty, QuizTemplate } from "@/core/quiz/quiz.types";

export interface CatalogResponse {
  modules: StudyModule[];
  storageMode: "local-json" | "postgres";
}

export interface QuizResponse {
  aiMode: "demo" | "openai";
  quiz: Quiz;
}

export interface PlanResponse {
  aiMode: "demo" | "openai";
  plan: StudyPlan;
}

export interface MaterialUploadResponse {
  material: StudyMaterial;
}

export interface MaterialTopicsResponse {
  estimatedCost: string;
  estimatedTokens: number;
  material: StudyMaterial | null;
  moduleId: string;
  topics: string[];
}

export async function listModulesApi(_requesterId: string | null): Promise<CatalogResponse> {
  void _requesterId;
  const response = await requestJson<CatalogResponse>(new URL("/api/modules", window.location.origin).toString(), {
    cache: "no-store",
  });

  return {
    modules: response.modules.map(normalizeStudyModule),
    storageMode: response.storageMode,
  };
}

export async function getModuleApi(moduleId: string, _requesterId: string | null): Promise<ModuleDetails> {
  void _requesterId;
  const url = new URL(`/api/modules/${encodeURIComponent(moduleId)}`, window.location.origin);

  const response = await requestJson<ModuleDetails>(url.toString(), {
    cache: "no-store",
  });

  return normalizeModuleDetails(response);
}

export async function createModuleApi(input: {
  description: string;
  name: string;
  ownerId: string;
  visibility: "public" | "private";
}): Promise<CreateModuleResult> {
  const response = await requestJson<CreateModuleResult>("/api/modules", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return {
    ownerMembership: normalizeModuleMember(response.ownerMembership),
    module: normalizeStudyModule(response.module),
  };
}

export async function createInviteApi(input: {
  email: string;
  moduleId: string;
  role: "editor" | "viewer";
}): Promise<ModuleInvite> {
  const response = await requestJson<ModuleInvite>(`/api/modules/${encodeURIComponent(input.moduleId)}/invites`, {
    body: JSON.stringify({
      email: input.email,
      role: input.role,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return normalizeModuleInvite(response);
}

export async function acceptInviteApi(input: { token: string; userId: string }) {
  const response = await requestJson<{ invite: ModuleInvite; member: ModuleDetails["members"][number] }>("/api/invites/accept", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return {
    invite: normalizeModuleInvite(response.invite),
    member: normalizeModuleMember(response.member),
  };
}

export async function uploadModuleMaterialApi(moduleId: string, file: File): Promise<MaterialUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await requestJson<MaterialUploadResponse>(`/api/modules/${encodeURIComponent(moduleId)}/materials`, {
    body: formData,
    method: "POST",
  });

  return {
    material: normalizeStudyMaterial(response.material),
  };
}

export async function extractMaterialTopicsApi(moduleId: string, materialId: string): Promise<MaterialTopicsResponse> {
  const response = await requestJson<MaterialTopicsResponse>(`/api/modules/${encodeURIComponent(moduleId)}/topics`, {
    body: JSON.stringify({ materialId }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return {
    ...response,
    material: response.material ? normalizeStudyMaterial(response.material) : null,
  };
}

export async function generateQuizApi(input: {
  difficulty: QuizDifficulty;
  previousMistakes: string[];
  template?: QuizTemplate;
  topic: string;
}): Promise<QuizResponse> {
  return requestJson<QuizResponse>("/api/quizzes", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

export async function generatePlanApi(input: {
  dailyStudyMinutes: number;
  examDate: string;
  template?: PlanTemplate;
  topics: string[];
}): Promise<PlanResponse> {
  return requestJson<PlanResponse>("/api/plans", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Unexpected request failure.");
  }

  return (await response.json()) as T;
}

function normalizeModuleDetails(module: ModuleDetails): ModuleDetails {
  return {
    ...normalizeStudyModule(module),
    members: module.members.map(normalizeModuleMember),
  };
}

function normalizeStudyModule(module: StudyModule): StudyModule {
  return {
    ...module,
    createdAt: new Date(module.createdAt),
    materials: (module.materials ?? []).map(normalizeStudyMaterial),
  };
}

function normalizeStudyMaterial(material: StudyMaterial): StudyMaterial {
  return {
    ...material,
    uploadedAt: new Date(material.uploadedAt),
  };
}

function normalizeModuleInvite(invite: ModuleInvite): ModuleInvite {
  return {
    ...invite,
    expiresAt: new Date(invite.expiresAt),
  };
}

function normalizeModuleMember(member: ModuleDetails["members"][number]): ModuleDetails["members"][number] {
  return {
    ...member,
    createdAt: new Date(member.createdAt),
  };
}