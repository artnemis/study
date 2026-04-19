import { QUIZ_DIFFICULTIES, QUIZ_TEMPLATES, type Quiz, type QuizDifficulty, type QuizQuestion, type QuizTemplate } from "./quiz.types";

export function validateQuiz(input: unknown): Quiz {
  if (!isRecord(input)) {
    throw new Error("Quiz payload is invalid.");
  }

  const topic = normalizeRequiredString(input.topic, "Quiz topic is required.");
  const difficulty = normalizeDifficulty(input.difficulty);
  const template = normalizeTemplate(input.template);
  const rawQuestions = input.questions;

  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    throw new Error("Quiz must contain at least 1 question.");
  }

  return {
    difficulty,
    questions: rawQuestions.map((question) => validateQuestion(question, template)),
    template,
    topic,
  };
}

function normalizeTemplate(value: unknown): QuizTemplate {
  if (typeof value === "string" && QUIZ_TEMPLATES.includes(value as QuizTemplate)) {
    return value as QuizTemplate;
  }
  return "multiple-choice";
}

function normalizeDifficulty(value: unknown): QuizDifficulty {
  if (typeof value !== "string" || !QUIZ_DIFFICULTIES.includes(value as QuizDifficulty)) {
    throw new Error("Quiz difficulty is invalid.");
  }

  return value as QuizDifficulty;
}

function validateQuestion(question: unknown, template: QuizTemplate): QuizQuestion {
  if (!isRecord(question)) {
    throw new Error("Quiz question is invalid.");
  }

  const prompt = normalizeRequiredString(question.prompt, "Question prompt is required.");
  const explanation = normalizeRequiredString(question.explanation, "Question explanation is required.");

  const type = normalizeQuestionType(question.type, question.options, template);

  if (type === "free-response") {
    const correctAnswer = normalizeRequiredString(question.correctAnswer, "Each question must have exactly 1 correct answer.");
    return {
      correctAnswer,
      explanation,
      options: [],
      prompt,
      type: "free-response",
    };
  }

  const correctAnswer = normalizeCorrectAnswer(question.correctAnswer);
  const options = normalizeOptions(question.options);

  if (!options.includes(correctAnswer)) {
    throw new Error("Correct answer must match one of the options.");
  }

  return {
    correctAnswer,
    explanation,
    options,
    prompt,
    type: "multiple-choice",
  };
}

function normalizeQuestionType(
  value: unknown,
  options: unknown,
  template: QuizTemplate,
): QuizQuestion["type"] {
  if (template === "free-response") {
    return "free-response";
  }

  if (template === "multiple-choice") {
    return "multiple-choice";
  }

  if (value === "free-response" || value === "multiple-choice") {
    return value;
  }

  if (Array.isArray(options) && options.length === 0) {
    return "free-response";
  }

  return "multiple-choice";
}

function normalizeCorrectAnswer(value: unknown): string {
  if (Array.isArray(value)) {
    const normalizedAnswers = value
      .filter((answer): answer is string => typeof answer === "string")
      .map((answer) => answer.trim())
      .filter((answer) => answer.length > 0);

    if (normalizedAnswers.length !== 1) {
      throw new Error("Each question must have exactly 1 correct answer.");
    }

    return normalizedAnswers[0];
  }

  return normalizeRequiredString(value, "Each question must have exactly 1 correct answer.");
}

function normalizeOptions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new Error("Each question must have exactly 4 unique options.");
  }

  const uniqueOptions = Array.from(
    new Set(
      value
        .filter((option): option is string => typeof option === "string")
        .map((option) => option.trim())
        .filter((option) => option.length > 0),
    ),
  );

  if (uniqueOptions.length !== 4) {
    throw new Error("Each question must have exactly 4 unique options.");
  }

  return uniqueOptions;
}

function normalizeRequiredString(value: unknown, errorMessage: string): string {
  if (typeof value !== "string") {
    throw new Error(errorMessage);
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    throw new Error(errorMessage);
  }

  return normalizedValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}