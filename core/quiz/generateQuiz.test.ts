import { describe, expect, it, vi } from "vitest";

import type { AIProvider } from "../ai/ai-provider";
import { generateQuiz } from "./generateQuiz";

describe("generateQuiz", () => {
  it("calls the AI provider and validates the returned quiz", async () => {
    const aiProvider = createAIProviderDouble({
      generateQuiz: vi.fn(async () => ({
        difficulty: "easy",
        questions: [
          {
            correctAnswer: "D",
            explanation: "Because.",
            options: ["A", "B", "C", "C", "D"],
            prompt: "Question?",
          },
        ],
        topic: "Ignored by service",
      })),
    });

    await expect(
      generateQuiz(
        {
          difficulty: "hard",
          previousMistakes: ["  fractions  ", "fractions", "equations"],
          topic: "  Algebra  ",
        },
        { aiProvider },
      ),
    ).resolves.toEqual({
      difficulty: "hard",
      questions: [
        {
          correctAnswer: "D",
          explanation: "Because.",
          options: ["A", "B", "C", "D"],
          prompt: "Question?",
          type: "multiple-choice",
        },
      ],
      template: "multiple-choice",
      topic: "Algebra",
    });

    expect(aiProvider.generateQuiz).toHaveBeenCalledWith({
      difficulty: "hard",
      previousMistakes: ["fractions", "equations"],
      template: "multiple-choice",
      topic: "Algebra",
    });
  });

  it("handles invalid AI output", async () => {
    const aiProvider = createAIProviderDouble({
      generateQuiz: vi.fn(async () => ({
        difficulty: "easy",
        questions: [
          {
            correctAnswer: ["A", "B"],
            explanation: "Because.",
            options: ["A", "B", "C", "D"],
            prompt: "Question?",
          },
        ],
        topic: "Algebra",
      })),
    });

    await expect(
      generateQuiz(
        {
          difficulty: "easy",
          previousMistakes: [],
          topic: "Algebra",
        },
        { aiProvider },
      ),
    ).rejects.toThrow("Each question must have exactly 1 correct answer.");
  });

  it("rejects invalid input before calling AI", async () => {
    const aiProvider = createAIProviderDouble();

    await expect(
      generateQuiz(
        {
          difficulty: "easy",
          previousMistakes: [],
          topic: "   ",
        },
        { aiProvider },
      ),
    ).rejects.toThrow("Quiz topic is required.");

    expect(aiProvider.generateQuiz).not.toHaveBeenCalled();
  });

  it("rejects invalid difficulty before calling AI", async () => {
    const aiProvider = createAIProviderDouble();

    await expect(
      generateQuiz(
        {
          difficulty: "legendary" as "easy",
          previousMistakes: [],
          topic: "Algebra",
        },
        { aiProvider },
      ),
    ).rejects.toThrow("Quiz difficulty is invalid.");

    expect(aiProvider.generateQuiz).not.toHaveBeenCalled();
  });
});

function createAIProviderDouble(overrides?: Partial<AIProvider>): AIProvider {
  return {
    generatePlan: vi.fn(),
    generateQuiz: vi.fn(async () => ({
      difficulty: "easy",
      questions: [],
      topic: "Algebra",
    })),
    generateText: vi.fn(async () => "text"),
    ...overrides,
  };
}