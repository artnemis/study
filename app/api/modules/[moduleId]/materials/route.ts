import { auth } from "@/auth";
import { requireModulePermission } from "@/app/api/_server/module-access";
import { getModuleRepository } from "@/app/api/_server/module-repository";
import { jsonResponse, toErrorResponse } from "@/app/api/_server/http";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

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
    await requireModulePermission(moduleId, session.user.id, "edit");
    const repository = getModuleRepository();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonResponse({ error: "File is required." }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonResponse({ error: "File exceeds 10 MB limit." }, 400);
    }

    if (!ALLOWED_TYPES.has(file.type) && !file.name.toLowerCase().endsWith(".txt")) {
      return jsonResponse({ error: "Unsupported file type. Use PDF, PPTX, DOCX, or TXT." }, 400);
    }

    const estimatedTokens = Math.round(file.size / 4); // rough estimate: ~4 bytes per token
    const contentPreview = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")
      ? (await file.text()).trim().slice(0, 16000)
      : null;

    const material = await repository.addMaterial({
      contentPreview,
      estimatedTokens,
      filename: file.name,
      mimeType: file.type || (file.name.toLowerCase().endsWith(".txt") ? "text/plain" : "application/octet-stream"),
      moduleId,
      sizeBytes: file.size,
      uploadedAt: new Date(),
    });

    return jsonResponse({ material });
  } catch (error) {
    return toErrorResponse(error);
  }
}
