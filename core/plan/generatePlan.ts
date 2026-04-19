import type { AIProvider } from "../ai/ai-provider";
import {
  STUDY_TASK_KINDS,
  type GeneratePlanInput,
  type StudyDay,
  type StudyPlan,
  type StudyTask,
  type StudyTaskKind,
} from "./plan.types";

export interface GeneratePlanDependencies {
  aiProvider: AIProvider;
}

export async function generatePlan(
  input: GeneratePlanInput,
  dependencies: GeneratePlanDependencies,
): Promise<StudyPlan> {
  const normalizedInput = normalizeGeneratePlanInput(input);
  const generatedPlan = await dependencies.aiProvider.generatePlan(normalizedInput);

  return validateStudyPlan(generatedPlan, normalizedInput);
}

function normalizeGeneratePlanInput(input: GeneratePlanInput): GeneratePlanInput {
  const examDate = input.examDate.trim();
  const topics = Array.from(new Set(input.topics.map((topic) => topic.trim()).filter((topic) => topic.length > 0)));

  if (!isValidDateString(examDate)) {
    throw new Error("Exam date is invalid.");
  }

  if (topics.length === 0) {
    throw new Error("At least 1 topic is required.");
  }

  if (!Number.isInteger(input.dailyStudyMinutes) || input.dailyStudyMinutes <= 0) {
    throw new Error("Daily study minutes must be a positive integer.");
  }

  return {
    dailyStudyMinutes: input.dailyStudyMinutes,
    examDate,
    topics,
  };
}

function validateStudyPlan(plan: unknown, input: GeneratePlanInput): StudyPlan {
  if (!isRecord(plan) || !Array.isArray(plan.days) || plan.days.length === 0) {
    throw new Error("Study plan payload is invalid.");
  }

  const examTimestamp = new Date(input.examDate).getTime();

  return {
    days: plan.days.map((day) => validateStudyDay(day, input.topics, input.dailyStudyMinutes, examTimestamp)),
  };
}

function validateStudyDay(
  day: unknown,
  allowedTopics: string[],
  dailyStudyMinutes: number,
  examTimestamp: number,
): StudyDay {
  if (!isRecord(day)) {
    throw new Error("Study day is invalid.");
  }

  if (typeof day.date !== "string" || !isValidDateString(day.date)) {
    throw new Error("Study day date is invalid.");
  }

  const dayTimestamp = new Date(day.date).getTime();

  if (dayTimestamp > examTimestamp) {
    throw new Error("Study day cannot be after the exam date.");
  }

  if (!Array.isArray(day.tasks) || day.tasks.length === 0 || day.tasks.length > 3) {
    throw new Error("Each study day must contain between 1 and 3 tasks.");
  }

  const tasks = day.tasks.map((task) => validateStudyTask(task, allowedTopics));
  const totalDurationMinutes = tasks.reduce((sum, task) => sum + task.durationMinutes, 0);

  if (totalDurationMinutes > dailyStudyMinutes) {
    throw new Error("Study day exceeds daily study minutes.");
  }

  return {
    date: day.date,
    tasks,
  };
}

function validateStudyTask(task: unknown, allowedTopics: string[]): StudyTask {
  if (!isRecord(task)) {
    throw new Error("Study task is invalid.");
  }

  if (typeof task.kind !== "string" || !STUDY_TASK_KINDS.includes(task.kind as StudyTaskKind)) {
    throw new Error("Study task kind is invalid.");
  }

  const kind = task.kind as StudyTaskKind;

  if (typeof task.topic !== "string") {
    throw new Error("Study task topic is invalid.");
  }

  const topic = task.topic.trim();

  if (topic.length === 0 || !allowedTopics.includes(topic)) {
    throw new Error("Study task topic is invalid.");
  }

  if (typeof task.durationMinutes !== "number" || !Number.isInteger(task.durationMinutes) || task.durationMinutes <= 0) {
    throw new Error("Study task duration is invalid.");
  }

  const durationMinutes = task.durationMinutes;

  if (typeof task.description !== "string") {
    throw new Error("Study task description is invalid.");
  }

  const description = task.description.trim();

  if (description.length === 0) {
    throw new Error("Study task description is invalid.");
  }

  return {
    description,
    durationMinutes,
    kind,
    topic,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidDateString(value: string): boolean {
  return Number.isFinite(new Date(value).getTime());
}