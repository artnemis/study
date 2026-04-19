import type { AIProvider } from "@/core/ai/ai-provider";
import { OpenAIProvider } from "@/core/ai/ai-provider";
import type { GeneratePlanInput } from "@/core/plan/plan.types";
import type { GenerateQuizInput, Quiz } from "@/core/quiz/quiz.types";

class DemoAIProvider implements AIProvider {
  async generateText(prompt: string): Promise<string> {
    if (prompt.includes("Return a JSON array of topic strings")) {
      return JSON.stringify(buildDemoTopics(prompt));
    }

    return `Demo provider response: ${prompt.trim()}`;
  }

  async generateQuiz(input: GenerateQuizInput): Promise<Quiz> {
    return {
      difficulty: input.difficulty,
      questions: [
        buildQuestion(input.topic, 1, input.template),
        buildQuestion(input.topic, 2, input.template),
        buildQuestion(input.topic, 3, input.template),
      ],
      template: input.template ?? "multiple-choice",
      topic: input.topic,
    };
  }

  async generatePlan(input: GeneratePlanInput) {
    const examDate = new Date(input.examDate);
    const baseDate = new Date(examDate.getTime());
    baseDate.setDate(examDate.getDate() - Math.min(input.topics.length + 1, 5));
    const template = input.template ?? "mixed";

    return {
      days: input.topics.map((topic, index) => {
        const currentDate = new Date(baseDate.getTime());
        currentDate.setDate(baseDate.getDate() + index);
        const studyMinutes = Math.max(30, Math.floor(input.dailyStudyMinutes * 0.65));
        const quizMinutes = Math.max(20, Math.min(45, input.dailyStudyMinutes - studyMinutes));

        return {
          date: currentDate.toISOString().slice(0, 10),
          tasks: [
            {
              description: `Review core theory and solved examples for ${topic}.`,
              durationMinutes: studyMinutes,
              kind: "study" as const,
              topic,
            },
            buildPracticeTask(topic, template, quizMinutes, index),
          ],
        };
      }),
    };
  }
}

export function getAIProvider(userApiKey?: string | null): AIProvider {
  const apiKey = userApiKey?.trim() || process.env.OPENAI_API_KEY?.trim();

  if (apiKey) {
    return new OpenAIProvider({ apiKey });
  }

  return new DemoAIProvider();
}

export function getAIMode(userApiKey?: string | null): "demo" | "openai" {
  return (userApiKey?.trim() || process.env.OPENAI_API_KEY?.trim()) ? "openai" : "demo";
}

function buildQuestion(topic: string, index: number, template = "multiple-choice") {
  const resolvedTemplate = template === "mixed"
    ? index % 2 === 0
      ? "free-response"
      : "multiple-choice"
    : template;
  const prompt = `Which statement best captures the key idea of ${topic} item ${index}?`;
  const correctAnswer = `The core principle of ${topic} item ${index}`;

  if (resolvedTemplate === "free-response") {
    return {
      correctAnswer,
      explanation: `The demo provider anchors every answer to the main concept being revised for ${topic}.`,
      options: [] as string[],
      prompt,
      type: "free-response" as const,
    };
  }

  return {
    correctAnswer,
    explanation: `The demo provider anchors every answer to the main concept being revised for ${topic}.`,
    options: [
      correctAnswer,
      `A common misconception about ${topic} item ${index}`,
      `An unrelated definition from a different topic`,
      `A partially true but incomplete claim about ${topic}`,
    ],
    prompt,
    type: "multiple-choice" as const,
  };
}

function buildPracticeTask(
  topic: string,
  template: GeneratePlanInput["template"],
  durationMinutes: number,
  index: number,
) {
  if (template === "free-response") {
    return {
      description: `Write a concise free-response explanation covering the core ideas of ${topic}.`,
      durationMinutes,
      kind: "exercise" as const,
      topic,
    };
  }

  if (template === "mixed") {
    return index % 2 === 0
      ? {
          description: `Run a mixed quiz on ${topic} with multiple-choice and short written answers.`,
          durationMinutes,
          kind: "quiz" as const,
          topic,
        }
      : {
          description: `Review mistakes and summarise ${topic} in your own words.`,
          durationMinutes,
          kind: "review" as const,
          topic,
        };
  }

  return {
    description: `Run a short adaptive multiple-choice quiz on ${topic}.`,
    durationMinutes,
    kind: "quiz" as const,
    topic,
  };
}

function buildDemoTopics(prompt: string): string[] {
  const source = prompt.match(/(?:Text|Context):\n([\s\S]*)$/)?.[1] ?? prompt;
  const normalizedSource = source
    .replace(/\.[a-z0-9]{1,5}\b/gi, " ")
    .replace(/[_/\\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const stopWords = new Set([
    "about",
    "application",
    "concept",
    "concepts",
    "context",
    "content",
    "demo",
    "description",
    "file",
    "filename",
    "infer",
    "introduction",
    "likely",
    "main",
    "material",
    "metadata",
    "module",
    "notes",
    "plain",
    "private",
    "response",
    "smoke",
    "study",
    "test",
    "text",
    "topic",
    "topics",
    "type",
  ]);

  const words = normalizedSource
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !/^\d+$/.test(word) && !stopWords.has(word));
  const candidates: string[] = [];

  for (let index = 0; index < words.length; index += 1) {
    const current = words[index];
    const next = words[index + 1];

    if (next && current.length > 3 && next.length > 3) {
      candidates.push(toTopicLabel(`${current} ${next}`));
    }

    if (current.length > 6) {
      candidates.push(toTopicLabel(current));
    }
  }

  const normalizedTopics = Array.from(new Set(candidates)).slice(0, 8);

  return normalizedTopics.length > 0 ? normalizedTopics : ["Core Concepts", "Practice Review"];
}

function toTopicLabel(value: string): string {
  return value
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}