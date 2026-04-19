export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new Error("Request body must be valid JSON.");
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new Error("Request body must be a JSON object.");
  }

  return payload as Record<string, unknown>;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

export function toErrorResponse(error: unknown): Response {
  const message = error instanceof Error ? error.message : "Internal server error.";
  const status = inferStatusCode(message);

  return Response.json(
    {
      error: status >= 500 ? "Internal server error." : message,
    },
    { status },
  );
}

function inferStatusCode(message: string): number {
  if (message.includes("not found")) {
    return 404;
  }

  if (message.includes("requires membership")) {
    return 403;
  }

  if (message.includes("DATABASE_URL")) {
    return 500;
  }

  if (
    message.includes("required") ||
    message.includes("invalid") ||
    message.includes("expired") ||
    message.includes("already") ||
    message.includes("Unable") ||
    message.includes("must")
  ) {
    return 400;
  }

  return 500;
}