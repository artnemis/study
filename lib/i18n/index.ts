export const LOCALES = ["it", "en", "fr", "es", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export interface Dictionary {
  // Nav
  nav_dashboard: string;
  nav_modules: string;
  nav_quiz: string;
  nav_plans: string;
  nav_profile: string;
  nav_signIn: string;
  nav_signOut: string;

  // Landing
  landing_title: string;
  landing_subtitle: string;
  landing_cta: string;
  landing_feature1_title: string;
  landing_feature1_desc: string;
  landing_feature2_title: string;
  landing_feature2_desc: string;
  landing_feature3_title: string;
  landing_feature3_desc: string;
  landing_feature4_title: string;
  landing_feature4_desc: string;

  // Dashboard
  dash_title: string;
  dash_subtitle: string;
  dash_totalModules: string;
  dash_publicModules: string;
  dash_privateModules: string;
  dash_noModules: string;
  dash_createFirst: string;
  dash_newModule: string;
  dash_goModules: string;
  dash_goQuiz: string;
  dash_goPlan: string;
  dash_storage: string;
  dash_ai: string;

  // Modules
  mod_title: string;
  mod_subtitle: string;
  mod_createNew: string;
  mod_name: string;
  mod_description: string;
  mod_visibility: string;
  mod_public: string;
  mod_private: string;
  mod_create: string;
  mod_cancel: string;
  mod_noModules: string;
  mod_view: string;
  mod_owner: string;
  mod_createdAt: string;
  mod_creating: string;

  // Module detail
  detail_back: string;
  detail_members: string;
  detail_invite: string;
  detail_email: string;
  detail_role: string;
  detail_sendInvite: string;
  detail_inviteSent: string;
  detail_copyToken: string;
  detail_quiz: string;
  detail_plan: string;
  detail_noMembers: string;
  detail_sending: string;

  // Quiz
  quiz_title: string;
  quiz_subtitle: string;
  quiz_topic: string;
  quiz_difficulty: string;
  quiz_easy: string;
  quiz_medium: string;
  quiz_hard: string;
  quiz_generate: string;
  quiz_generating: string;
  quiz_question: string;
  quiz_correct: string;
  quiz_wrong: string;
  quiz_score: string;
  quiz_submit: string;
  quiz_aiMode: string;

  // Plans
  plan_title: string;
  plan_subtitle: string;
  plan_topics: string;
  plan_topicsPlaceholder: string;
  plan_examDate: string;
  plan_dailyMinutes: string;
  plan_generate: string;
  plan_generating: string;
  plan_week: string;
  plan_aiMode: string;

  // Profile
  profile_title: string;
  profile_subtitle: string;
  profile_name: string;
  profile_email: string;
  profile_language: string;
  profile_apiKey: string;
  profile_apiKeyPlaceholder: string;
  profile_apiKeyHelp: string;
  profile_save: string;
  profile_saving: string;
  profile_saved: string;
  profile_removeKey: string;
  profile_keySet: string;
  profile_keyNotSet: string;

  // Auth
  auth_signIn: string;
  auth_signUp: string;
  auth_email: string;
  auth_password: string;
  auth_name: string;
  auth_noAccount: string;
  auth_hasAccount: string;
  auth_signingIn: string;
  auth_signingUp: string;
  auth_error: string;

  // Common
  common_loading: string;
  common_error: string;
  common_retry: string;
}

export const DEFAULT_LOCALE: Locale = "en";
