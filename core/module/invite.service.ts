import {
  INVITABLE_MODULE_ROLES,
  type AcceptInviteInput,
  type AcceptInviteResult,
  type CreateInviteInput,
  type ModuleRepository,
} from "./module.types";

export interface CreateInviteDependencies {
  now: () => Date;
  generateToken: () => string;
  repository: ModuleRepository;
}

export interface AcceptInviteDependencies {
  now: () => Date;
  repository: ModuleRepository;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVITE_EXPIRATION_IN_HOURS = 48;
const MAX_TOKEN_ATTEMPTS = 5;

export async function createInvite(
  input: CreateInviteInput,
  dependencies: CreateInviteDependencies,
) {
  const normalizedInput = normalizeCreateInviteInput(input);
  const token = await generateUniqueToken(dependencies);
  const createdAt = dependencies.now();
  const expiresAt = new Date(createdAt.getTime() + INVITE_EXPIRATION_IN_HOURS * 60 * 60 * 1000);

  return dependencies.repository.createInvite({
    ...normalizedInput,
    acceptedAt: null,
    createdAt,
    expiresAt,
    token,
  });
}

export async function acceptInvite(
  input: AcceptInviteInput,
  dependencies: AcceptInviteDependencies,
): Promise<AcceptInviteResult> {
  const token = normalizeRequiredString(input.token, "Invite token is required.");
  const userId = normalizeRequiredString(input.userId, "User id is required.");
  const invite = await dependencies.repository.findInviteByToken(token);

  if (!invite) {
    throw new Error("Invite token is invalid.");
  }

  if (invite.acceptedAt) {
    throw new Error("Invite has already been used.");
  }

  const acceptedAt = dependencies.now();

  if (invite.expiresAt.getTime() < acceptedAt.getTime()) {
    throw new Error("Invite has expired.");
  }

  const members = await dependencies.repository.listMembers(invite.moduleId);
  const existingMember = members.find((member) => member.userId === userId);
  const member =
    existingMember ??
    (await dependencies.repository.addMember({
      createdAt: acceptedAt,
      moduleId: invite.moduleId,
      role: invite.role,
      userId,
    }));
  const acceptedInvite = await dependencies.repository.markInviteAsAccepted(invite.id, acceptedAt);

  return {
    invite: acceptedInvite,
    member,
  };
}

async function generateUniqueToken(dependencies: CreateInviteDependencies): Promise<string> {
  for (let attempt = 0; attempt < MAX_TOKEN_ATTEMPTS; attempt += 1) {
    const token = normalizeRequiredString(dependencies.generateToken(), "Invite token is invalid.");

    if (!(await dependencies.repository.hasInviteToken(token))) {
      return token;
    }
  }

  throw new Error("Unable to generate a unique invite token.");
}

function normalizeCreateInviteInput(input: CreateInviteInput): CreateInviteInput {
  const moduleId = normalizeRequiredString(input.moduleId, "Module id is required.");
  const email = normalizeRequiredString(input.email, "Invite email is required.").toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("Invite email is invalid.");
  }

  if (!INVITABLE_MODULE_ROLES.includes(input.role)) {
    throw new Error("Invite role is invalid.");
  }

  return {
    email,
    moduleId,
    role: input.role,
  };
}

function normalizeRequiredString(value: string, errorMessage: string): string {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    throw new Error(errorMessage);
  }

  return normalizedValue;
}