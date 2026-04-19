import { describe, expect, it, vi } from "vitest";

import type { AIProvider } from "../ai/ai-provider";
import { generatePlan } from "./generatePlan";

describe("generatePlan", () => {
  it("calls AIProvider and validates the output structure", async () => {
    const aiProvider = createAIProviderDouble({
      generatePlan: vi.fn(async () => ({
        days: [
          {
            date: "2026-05-01",
            tasks: [
              {
                description: "Review predicates",
                durationMinutes: 45,
                kind: "study",
                topic: "Logic",
              },
              {
                description: "Solve logic quiz",
                durationMinutes: 30,
                kind: "quiz",
                topic: "Logic",
              },
            ],
          },
        ],
      })),
    });

    await expect(
      generatePlan(
        {
          dailyStudyMinutes: 90,
          examDate: "2026-05-10",
          topics: ["  Logic  ", "Logic"],
        },
        { aiProvider },
      ),
    ).resolves.toEqual({
      days: [
        {
          date: "2026-05-01",
          tasks: [
            {
              description: "Review predicates",
              durationMinutes: 45,
              kind: "study",
              topic: "Logic",
            },
            {
              description: "Solve logic quiz",
              durationMinutes: 30,
              kind: "quiz",
              topic: "Logic",
            },
          ],
        },
      ],
    });

    expect(aiProvider.generatePlan).toHaveBeenCalledWith({
      dailyStudyMinutes: 90,
      examDate: "2026-05-10",
      template: "mixed",
      topics: ["Logic"],
    });
  });

  it("handles invalid AI output", async () => {
    const aiProvider = createAIProviderDouble({
      generatePlan: vi.fn(async () => ({
        days: [
          {
            date: "2026-05-01",
            tasks: [
              {
                description: "Review predicates",
                durationMinutes: 45,
                kind: "study",
                topic: "Logic",
              },
              {
                description: "Quiz",
                durationMinutes: 30,
                kind: "quiz",
                topic: "Logic",
              },
              {
                description: "Extra practice",
                durationMinutes: 20,
                kind: "study",
                topic: "Logic",
              },
              {
                description: "Too much",
                durationMinutes: 10,
                kind: "study",
                topic: "Logic",
              },
            ],
          },
        ],
      })),
    });

    await expect(
      generatePlan(
        {
          dailyStudyMinutes: 120,
          examDate: "2026-05-10",
          topics: ["Logic"],
        },
        { aiProvider },
      ),
    ).rejects.toThrow("Each study day must contain between 1 and 3 tasks.");
  });

  it("rejects invalid input before calling AIProvider", async () => {
    const aiProvider = createAIProviderDouble();

    await expect(
      generatePlan(
        {
          dailyStudyMinutes: 0,
          examDate: "not-a-date",
          topics: [],
        },
        { aiProvider },
      ),
    ).rejects.toThrow("Exam date is invalid.");

    expect(aiProvider.generatePlan).not.toHaveBeenCalled();
  });

  it("rejects empty topics after normalization", async () => {
    const aiProvider = createAIProviderDouble();

    await expect(
      generatePlan(
        {
          dailyStudyMinutes: 60,
          examDate: "2026-05-10",
          topics: ["   ", ""],
        },
        { aiProvider },
      ),
    ).rejects.toThrow("At least 1 topic is required.");
  });

  it("rejects invalid daily study minutes", async () => {
    const aiProvider = createAIProviderDouble();

    await expect(
      generatePlan(
        {
          dailyStudyMinutes: -10,
          examDate: "2026-05-10",
          topics: ["Logic"],
        },
        { aiProvider },
      ),
    ).rejects.toThrow("Daily study minutes must be a positive integer.");
  });

  it("rejects invalid AI payload roots", async () => {
    const aiProvider = createAIProviderDouble({
      generatePlan: vi.fn(async () => ({ days: [] })),
    });

    await expect(
      generatePlan(
        {
          dailyStudyMinutes: 90,
          examDate: "2026-05-10",
          topics: ["Logic"],
        },
        { aiProvider },
      ),
    ).rejects.toThrow("Study plan payload is invalid.");
  });

  it("rejects study days after the exam date", async () => {
    const aiProvider = createAIProviderDouble({
      generatePlan: vi.fn(async () => ({
        days: [
          {
            date: "2026-05-11",
            tasks: [
              {
                description: "Review predicates",
                durationMinutes: 45,
                kind: "study",
                topic: "Logic",
              },
            ],
          },
        ],
      })),
    });

    await expect(
      generatePlan(
        {
          dailyStudyMinutes: 90,
          examDate: "2026-05-10",
          topics: ["Logic"],
        },
        { aiProvider },
      ),
    ).rejects.toThrow("Study day cannot be after the exam date.");
  });

  it("rejects invalid study task topics", async () => {
    const aiProvider = createAIProviderDouble({
      generatePlan: vi.fn(async () => ({
        days: [
          {
            date: "2026-05-01",
            tasks: [
              {
                description: "Review sets",
                durationMinutes: 45,
                kind: "study",
                topic: "Sets",
              },
            ],
          },
        ],
      })),
    });

    await expect(
      generatePlan(
        {
          dailyStudyMinutes: 90,
          examDate: "2026-05-10",
          topics: ["Logic"],
        },
        { aiProvider },
      ),
    ).rejects.toThrow("Study task topic is invalid.");
  });

  it("rejects invalid study task kind, duration, and description", async () => {
    const kindProvider = createAIProviderDouble({
      generatePlan: vi.fn(async () => ({
        days: [
          {
            date: "2026-05-01",
            tasks: [
              {
                description: "Review logic",
                durationMinutes: 45,
                kind: "practice",
                topic: "Logic",
              },
            ],
          },
        ],
      })),
    });

    await expect(
      generatePlan(
        {
          dailyStudyMinutes: 90,
          examDate: "2026-05-10",
          topics: ["Logic"],
        },
        { aiProvider: kindProvider },
      ),
    ).rejects.toThrow("Study task kind is invalid.");

    const durationProvider = createAIProviderDouble({
      generatePlan: vi.fn(async () => ({
        days: [
          {
            date: "2026-05-01",
            tasks: [
              {
                description: "Review logic",
                durationMinutes: 0,
                kind: "study",
                topic: "Logic",
              },
            ],
          },
        ],
      })),
    });

    await expect(
      generatePlan(
        {
          dailyStudyMinutes: 90,
          examDate: "2026-05-10",
          topics: ["Logic"],
        },
        { aiProvider: durationProvider },
      ),
    ).rejects.toThrow("Study task duration is invalid.");

    const descriptionProvider = createAIProviderDouble({
      generatePlan: vi.fn(async () => ({
        days: [
          {
            date: "2026-05-01",
            tasks: [
              {
                description: "   ",
                durationMinutes: 45,
                kind: "study",
                topic: "Logic",
              },
            ],
          },
        ],
      })),
    });

    await expect(
      generatePlan(
        {
          dailyStudyMinutes: 90,
          examDate: "2026-05-10",
          topics: ["Logic"],
        },
        { aiProvider: descriptionProvider },
      ),
    ).rejects.toThrow("Study task description is invalid.");
  });

  it("rejects study days that exceed daily minutes", async () => {
    const aiProvider = createAIProviderDouble({
      generatePlan: vi.fn(async () => ({
        days: [
          {
            date: "2026-05-01",
            tasks: [
              {
                description: "Review logic",
                durationMinutes: 60,
                kind: "study",
                topic: "Logic",
              },
              {
                description: "Quiz logic",
                durationMinutes: 45,
                kind: "quiz",
                topic: "Logic",
              },
            ],
          },
        ],
      })),
    });

    await expect(
      generatePlan(
        {
          dailyStudyMinutes: 90,
          examDate: "2026-05-10",
          topics: ["Logic"],
        },
        { aiProvider },
      ),
    ).rejects.toThrow("Study day exceeds daily study minutes.");
  });
});

function createAIProviderDouble(overrides?: Partial<AIProvider>): AIProvider {
  return {
    generatePlan: vi.fn(async () => ({ days: [] })),
    generateQuiz: vi.fn(),
    generateText: vi.fn(async () => "text"),
    ...overrides,
  };
}