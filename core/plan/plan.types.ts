export const STUDY_TASK_KINDS = ["study", "quiz", "review", "exercise"] as const;

export type StudyTaskKind = (typeof STUDY_TASK_KINDS)[number];

export const PLAN_TEMPLATES = ["multiple-choice", "free-response", "mixed"] as const;

export type PlanTemplate = (typeof PLAN_TEMPLATES)[number];

export interface StudyTask {
  kind: StudyTaskKind;
  topic: string;
  durationMinutes: number;
  description: string;
}

export interface StudyDay {
  date: string;
  tasks: StudyTask[];
}

export interface StudyPlan {
  days: StudyDay[];
}

export interface GeneratePlanInput {
  examDate: string;
  topics: string[];
  dailyStudyMinutes: number;
  template?: PlanTemplate;
  moduleId?: string;
}