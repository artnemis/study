export const STUDY_TASK_KINDS = ["study", "quiz"] as const;

export type StudyTaskKind = (typeof STUDY_TASK_KINDS)[number];

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
}