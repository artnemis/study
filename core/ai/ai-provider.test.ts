import { describe, expect, it, vi } from "vitest";

import { OpenAIProvider } from "./ai-provider";

describe("OpenAIProvider", () => {
  it("rejects a blank api key", () => {
    expect(() => new OpenAIProvider({ apiKey: "   " })).toThrow("OpenAI apiKey is required.");
  });

  it("returns generated text content", async () => {
    const fetchImplementation = vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "  generated text  ",
              },
            },
          ],
        }),
        {
          status: 200,
        },
      ),
    );

    const provider = new OpenAIProvider({
      apiKey: "secret",
      fetch: fetchImplementation,
    });

    await expect(provider.generateText("  hello world  ")).resolves.toBe("generated text");
    expect(fetchImplementation).toHaveBeenCalledTimes(1);
  });

  it("rejects blank prompts before sending a request", async () => {
    const fetchImplementation = vi.fn();
    const provider = new OpenAIProvider({
      apiKey: "secret",
      fetch: fetchImplementation,
    });

    await expect(provider.generateText("   ")).rejects.toThrow("Prompt is required.");
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it("parses quiz JSON content", async () => {
    const fetchImplementation = vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  difficulty: "easy",
                  questions: [
                    {
                      correctAnswer: "A",
                      explanation: "Because.",
                      options: ["A", "B", "C", "D"],
                      prompt: "Question?",
                    },
                  ],
                  topic: "Geometry",
                }),
              },
            },
          ],
        }),
        {
          status: 200,
        },
      ),
    );

    const provider = new OpenAIProvider({
      apiKey: "secret",
      fetch: fetchImplementation,
    });

    await expect(
      provider.generateQuiz({
        difficulty: "easy",
        previousMistakes: [],
        template: "multiple-choice",
        topic: "Geometry",
      }),
    ).resolves.toEqual({
      difficulty: "easy",
      questions: [
        {
          correctAnswer: "A",
          explanation: "Because.",
          options: ["A", "B", "C", "D"],
          prompt: "Question?",
        },
      ],
      topic: "Geometry",
    });
  });

  it("throws when the request fails", async () => {
    const fetchImplementation = vi.fn(async () => new Response("{}", { status: 500 }));

    const provider = new OpenAIProvider({
      apiKey: "secret",
      fetch: fetchImplementation,
    });

    await expect(
      provider.generatePlan({
        dailyStudyMinutes: 120,
        examDate: "2026-06-01",
        topics: ["Logic"],
      }),
    ).rejects.toThrow("OpenAI request failed with status 500.");
  });

  it("surfaces API error messages when content is missing", async () => {
    const fetchImplementation = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: {
            message: "Rate limit exceeded.",
          },
        }),
        {
          status: 200,
        },
      ),
    );
    const provider = new OpenAIProvider({
      apiKey: "secret",
      fetch: fetchImplementation,
    });

    await expect(provider.generateText("hello")).rejects.toThrow("Rate limit exceeded.");
  });

  it("rejects invalid response payloads", async () => {
    const fetchImplementation = vi.fn(async () => new Response(JSON.stringify("invalid"), { status: 200 }));
    const provider = new OpenAIProvider({
      apiKey: "secret",
      fetch: fetchImplementation,
    });

    await expect(provider.generateText("hello")).rejects.toThrow("OpenAI response payload is invalid.");
  });

  it("rejects empty content without an API error", async () => {
    const fetchImplementation = vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "   ",
              },
            },
          ],
        }),
        {
          status: 200,
        },
      ),
    );
    const provider = new OpenAIProvider({
      apiKey: "secret",
      fetch: fetchImplementation,
    });

    await expect(provider.generateText("hello")).rejects.toThrow(
      "OpenAI response did not include message content.",
    );
  });

  it("throws when JSON content is invalid", async () => {
    const fetchImplementation = vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "not json",
              },
            },
          ],
        }),
        {
          status: 200,
        },
      ),
    );

    const provider = new OpenAIProvider({
      apiKey: "secret",
      fetch: fetchImplementation,
    });

    await expect(
      provider.generatePlan({
        dailyStudyMinutes: 120,
        examDate: "2026-06-01",
        topics: ["Logic"],
      }),
    ).rejects.toThrow("OpenAI plan response is not valid JSON.");
  });

  it("rejects non-object JSON for quiz generation", async () => {
    const fetchImplementation = vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify(["not", "an", "object"]),
              },
            },
          ],
        }),
        {
          status: 200,
        },
      ),
    );
    const provider = new OpenAIProvider({
      apiKey: "secret",
      fetch: fetchImplementation,
    });

    await expect(
      provider.generateQuiz({
        difficulty: "easy",
        previousMistakes: [],
        template: "multiple-choice",
        topic: "Geometry",
      }),
    ).rejects.toThrow("OpenAI quiz response is not valid JSON.");
  });
});