import { hash } from "bcryptjs";

import { createLocalUserRepository } from "@/app/api/_server/user-repository";
import { jsonResponse, readJsonObject, toErrorResponse } from "@/app/api/_server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await readJsonObject(request);
    const email = String(payload.email ?? "").trim();
    const name = String(payload.name ?? "").trim();
    const password = String(payload.password ?? "");

    if (!email || !name || password.length < 6) {
      return jsonResponse(
        { error: "Email, name (non-empty) and password (min 6 chars) are required." },
        400,
      );
    }

    const userRepo = createLocalUserRepository();
    const existing = await userRepo.findUserByEmail(email);

    if (existing) {
      return jsonResponse({ error: "A user with this email already exists." }, 409);
    }

    const passwordHash = await hash(password, 12);
    const user = await userRepo.createUser({ email, name, passwordHash });

    return jsonResponse({ id: user.id, email: user.email, name: user.name }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
