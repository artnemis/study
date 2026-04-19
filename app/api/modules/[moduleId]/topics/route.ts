import { auth } from "@/auth";
import { getAIProvider } from "@/app/api/_server/ai-provider";
import { requireModulePermission } from "@/app/api/_server/module-access";
import { getModuleRepository } from "@/app/api/_server/module-repository";
import { createLocalUserRepository } from "@/app/api/_server/user-repository";
import { jsonResponse, readJsonObject, toErrorResponse } from "@/app/api/_server/http";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse({ error: "Authentication required." }, 401);
    }

    const { moduleId } = await params;
    const repository = getModuleRepository();
    const { module } = await requireModulePermission(moduleId, session.user.id, "edit");

    const userRepo = createLocalUserRepository();
    const settings = await userRepo.getSettings(session.user.id);
    const aiProvider = getAIProvider(settings.openaiApiKey);

    const payload = await readJsonObject(request);
    const materialId = String(payload.materialId ?? "").trim();
    const content = String(payload.content ?? "").trim();
    const material = materialId.length > 0 ? module.materials.find((entry) => entry.id === materialId) ?? null : null;

    if (!material && content.length === 0) {
      return jsonResponse({ error: "Content or material id is required for topic extraction." }, 400);
    }

    if (materialId.length > 0 && !material) {
      throw new Error("Material not found.");
    }

    const extractionSource = content.length > 0
      ? content.slice(0, 16000)
      : material?.contentPreview && material.contentPreview.trim().length > 0
        ? material.contentPreview.slice(0, 16000)
      : [
          `Module: ${module.name}`,
          module.description ? `Module description: ${module.description}` : null,
          material ? `Material filename: ${material.filename}` : null,
          material ? `Material type: ${material.mimeType}` : null,
          "Infer the most likely study topics from this module context and file metadata.",
        ]
          .filter((line): line is string => Boolean(line))
          .join("\n");

    const estimatedTokens = content.length > 0 ? Math.ceil(content.length / 4) : material?.estimatedTokens ?? 0;
    const estimatedCalls = Math.ceil(estimatedTokens / 4000);
    const costPer1kTokens = 0.00015;
    const estimatedCost = estimatedCalls * 4000 * (costPer1kTokens / 1000);

    const prompt = [
      "Extract the main study topics from the following text.",
      "Return a JSON array of topic strings, maximum 15 topics.",
      "Each topic should be concise (2-6 words).",
      "Example: [\"Linear Algebra Basics\", \"Matrix Operations\", \"Eigenvalues\"]",
      "",
      content.length > 0 ? "Text:" : "Context:",
      extractionSource,
    ].join("\n");

    const response = await aiProvider.generateText(prompt);

    let topics: string[] = [];
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        topics = parsed
          .filter((t): t is string => typeof t === "string")
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
          .slice(0, 15);
      }
    } catch {
      topics = response
        .split("\n")
        .map((line) => line.replace(/^[-*\d.]+\s*/, "").trim())
        .filter((line) => line.length > 0 && line.length < 100)
        .slice(0, 15);
    }

    const normalizedTopics = Array.from(
      new Set(topics.map((topic) => topic.trim()).filter((topic) => topic.length > 0)),
    ).slice(0, 15);

    const updatedMaterial = material
      ? await repository.updateMaterialTopics({
          extractedTopics: normalizedTopics,
          materialId: material.id,
          moduleId,
        })
      : null;

    return jsonResponse({
      moduleId,
      material: updatedMaterial,
      topics: normalizedTopics,
      estimatedTokens,
      estimatedCost: `$${estimatedCost.toFixed(4)}`,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
