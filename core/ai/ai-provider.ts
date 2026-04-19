import type { GeneratePlanInput, StudyPlan } from "../plan/plan.types";
import type { GenerateQuizInput, Quiz } from "../quiz/quiz.types";

export interface AIProvider {
  generateText(prompt: string): Promise<string>;
  generateQuiz(input: GenerateQuizInput): Promise<Quiz>;
  generatePlan(input: GeneratePlanInput): Promise<StudyPlan>;
}

export interface OpenAIProviderOptions {
  apiKey: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  model?: string;
}

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4.1-mini";

export class OpenAIProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImplementation: typeof fetch;
  private readonly model: string;

  constructor(options: OpenAIProviderOptions) {
    const apiKey = options.apiKey.trim();

    if (apiKey.length === 0) {
      throw new Error("OpenAI apiKey is required.");
    }

    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl?.trim() || DEFAULT_BASE_URL;
    this.fetchImplementation = options.fetch ?? fetch;
    this.model = options.model?.trim() || DEFAULT_MODEL;
  }

  async generateText(prompt: string): Promise<string> {
    return this.requestText(normalizePrompt(prompt));
  }

  async generateQuiz(input: GenerateQuizInput): Promise<Quiz> {
    const content = await this.requestText(buildQuizPrompt(input));

    return parseJsonPayload<Quiz>(content, "OpenAI quiz response is not valid JSON.");
  }

  async generatePlan(input: GeneratePlanInput): Promise<StudyPlan> {
    const content = await this.requestText(buildPlanPrompt(input));

    return parseJsonPayload<StudyPlan>(content, "OpenAI plan response is not valid JSON.");
  }

  private async requestText(prompt: string): Promise<string> {
    const response = await this.fetchImplementation(`${this.baseUrl}/chat/completions`, {
      body: JSON.stringify({
        messages: [
          {
            content: prompt,
            role: "user",
          },
        ],
        model: this.model,
      }),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as unknown;

    return extractMessageContent(payload);
  }
}

function buildPlanPrompt(input: GeneratePlanInput): string {
  return [
    "Generate a study plan as JSON with this exact shape:",
    '{"days":[{"date":"YYYY-MM-DD","tasks":[{"kind":"study|quiz","topic":"string","durationMinutes":45,"description":"string"}]}]}',
    `Exam date: ${input.examDate}`,
    `Topics: ${input.topics.join(", ")}`,
    `Daily study minutes: ${String(input.dailyStudyMinutes)}`,
  ].join("\n");
}

function buildQuizPrompt(input: GenerateQuizInput): string {
  return [
    "Generate a quiz as JSON with this exact shape:",
    '{"topic":"string","difficulty":"easy|medium|hard","questions":[{"prompt":"string","options":["a","b","c","d"],"correctAnswer":"string","explanation":"string"}]}',
    `Topic: ${input.topic}`,
    `Difficulty: ${input.difficulty}`,
    `Previous mistakes: ${input.previousMistakes.join(", ") || "none"}`,
  ].join("\n");
}

function extractMessageContent(payload: unknown): string {
  if (!isRecord(payload)) {
    throw new Error("OpenAI response payload is invalid.");
  }

  const choices = payload.choices;

  if (Array.isArray(choices) && choices.length > 0) {
    const firstChoice = choices[0];

    if (isRecord(firstChoice) && isRecord(firstChoice.message) && typeof firstChoice.message.content === "string") {
      const content = firstChoice.message.content.trim();

      if (content.length > 0) {
        return content;
      }
    }
  }

  if (isRecord(payload.error) && typeof payload.error.message === "string") {
    throw new Error(payload.error.message);
  }

  throw new Error("OpenAI response did not include message content.");
}

function normalizePrompt(prompt: string): string {
  const normalizedPrompt = prompt.trim();

  if (normalizedPrompt.length === 0) {
    throw new Error("Prompt is required.");
  }

  return normalizedPrompt;
}

function parseJsonPayload<T>(content: string, errorMessage: string): T {
  try {
    const parsed = JSON.parse(content) as unknown;

    if (!isRecord(parsed)) {
      throw new Error(errorMessage);
    }

    return parsed as T;
  } catch {
    throw new Error(errorMessage);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}