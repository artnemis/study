export interface AppUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

export interface UserSettings {
  userId: string;
  openaiApiKey: string | null;
  locale: string;
}

export interface UserRepository {
  createUser(input: { email: string; name: string; passwordHash: string }): Promise<AppUser>;
  findUserByEmail(email: string): Promise<AppUser | null>;
  findUserById(id: string): Promise<AppUser | null>;
  getSettings(userId: string): Promise<UserSettings>;
  updateSettings(userId: string, patch: Partial<Pick<UserSettings, "openaiApiKey" | "locale">>): Promise<UserSettings>;
}
