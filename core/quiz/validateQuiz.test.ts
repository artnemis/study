import { describe, expect, it } from "vitest";

import { validateQuiz } from "./validateQuiz";

describe("validateQuiz", () => {
  it("removes duplicate options and returns a normalized quiz", () => {
    expect(
      validateQuiz({
        difficulty: "medium",
        questions: [
          {
            correctAnswer: "D",
            explanation: "Because.",
            options: ["A", "B", "C", "C", "D"],
            prompt: "What is correct?",
          },
        ],
        topic: "Algebra",
      }),
    ).toEqual({
      difficulty: "medium",
      questions: [
        {
          correctAnswer: "D",
          explanation: "Because.",
          options: ["A", "B", "C", "D"],
          prompt: "What is correct?",
        },
      ],
      topic: "Algebra",
    });
  });

  it("rejects questions with less than 4 options", () => {
    expect(() =>
      validateQuiz({
        difficulty: "easy",
        questions: [
          {
            correctAnswer: "A",
            explanation: "Because.",
            options: ["A", "B", "C"],
            prompt: "Question?",
          },
        ],
        topic: "Logic",
      }),
    ).toThrow("Each question must have exactly 4 unique options.");
  });

  it("rejects questions with multiple correct answers", () => {
    expect(() =>
      validateQuiz({
        difficulty: "hard",
        questions: [
          {
            correctAnswer: ["A", "B"],
            explanation: "Because.",
            options: ["A", "B", "C", "D"],
            prompt: "Question?",
          },
        ],
        topic: "Statistics",
      }),
    ).toThrow("Each question must have exactly 1 correct answer.");
  });

  it("rejects invalid quiz payloads", () => {
    expect(() => validateQuiz(null)).toThrow("Quiz payload is invalid.");
  });

  it("rejects invalid quiz difficulty", () => {
    expect(() =>
      validateQuiz({
        difficulty: "expert",
        questions: [
          {
            correctAnswer: "A",
            explanation: "Because.",
            options: ["A", "B", "C", "D"],
            prompt: "Question?",
          },
        ],
        topic: "Logic",
      }),
    ).toThrow("Quiz difficulty is invalid.");
  });

  it("rejects quizzes without questions", () => {
    expect(() =>
      validateQuiz({
        difficulty: "easy",
        questions: [],
        topic: "Logic",
      }),
    ).toThrow("Quiz must contain at least 1 question.");
  });

  it("rejects correct answers that are not part of the options", () => {
    expect(() =>
      validateQuiz({
        difficulty: "medium",
        questions: [
          {
            correctAnswer: "Z",
            explanation: "Because.",
            options: ["A", "B", "C", "D"],
            prompt: "Question?",
          },
        ],
        topic: "Logic",
      }),
    ).toThrow("Correct answer must match one of the options.");
  });

  it("accepts a single correct answer provided as an array", () => {
    expect(
      validateQuiz({
        difficulty: "easy",
        questions: [
          {
            correctAnswer: ["A"],
            explanation: "Because.",
            options: ["A", "B", "C", "D"],
            prompt: "Question?",
          },
        ],
        topic: "Logic",
      }),
    ).toMatchObject({
      questions: [
        {
          correctAnswer: "A",
        },
      ],
    });
  });

  it("rejects invalid question records", () => {
    expect(() =>
      validateQuiz({
        difficulty: "easy",
        questions: [null],
        topic: "Logic",
      }),
    ).toThrow("Quiz question is invalid.");
  });
});