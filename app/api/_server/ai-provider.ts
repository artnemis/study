import type { AIProvider } from "@/core/ai/ai-provider";
import { OpenAIProvider } from "@/core/ai/ai-provider";
import type { GeneratePlanInput } from "@/core/plan/plan.types";
import type { GenerateQuizInput, Quiz } from "@/core/quiz/quiz.types";

class DemoAIProvider implements AIProvider {
  async generateText(prompt: string): Promise<string> {
    return `Demo provider response: ${prompt.trim()}`;
  }

  async generateQuiz(input: GenerateQuizInput): Promise<Quiz> {
    return {
      difficulty: input.difficulty,
      questions: [
        buildQuestion(input.topic, 1),
        buildQuestion(input.topic, 2),
        buildQuestion(input.topic, 3),
      ],
      topic: input.topic,
    };
  }

  async generatePlan(input: GeneratePlanInput) {
    const examDate = new Date(input.examDate);
    const baseDate = new Date(examDate.getTime());
    baseDate.setDate(examDate.getDate() - Math.min(input.topics.length + 1, 5));

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
            {
              description: `Run a short adaptive quiz on ${topic}.`,
              durationMinutes: quizMinutes,
              kind: "quiz" as const,
              topic,
            },
          ],
        };
      }),
    };
  }
}

export function getAIProvider(): AIProvider {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (apiKey) {
    return new OpenAIProvider({ apiKey });
  }

  return new DemoAIProvider();
}

export function getAIMode(): "demo" | "openai" {
  return process.env.OPENAI_API_KEY?.trim() ? "openai" : "demo";
}

function buildQuestion(topic: string, index: number) {
  const prompt = `Which statement best captures the key idea of ${topic} item ${index}?`;
  const correctAnswer = `The core principle of ${topic} item ${index}`;

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
  };
}