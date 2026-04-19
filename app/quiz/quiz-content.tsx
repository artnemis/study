"use client";

import { type FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { generateQuizApi } from "@/app/_lib/api-client";
import type { QuizResponse } from "@/app/_lib/api-client";
import {
  Badge,
  Feedback,
  Field,
  PageHeader,
  Panel,
  fieldClassName,
  primaryButtonClassName,
  toMessage,
} from "@/app/_components/ui";

export default function QuizContent() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    topic: searchParams.get("topic") ?? "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    previousMistakes: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onGenerate(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await generateQuizApi({
        topic: form.topic,
        difficulty: form.difficulty,
        previousMistakes: form.previousMistakes
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v.length > 0),
      });
      setQuizResult(result);
      setFeedback(`Quiz generato in modalità ${result.aiMode}.`);
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <PageHeader title="Quiz Generator" subtitle="Genera quiz personalizzati con l'intelligenza artificiale." />

      <Feedback message={feedback} />

      <Panel title="Configura il quiz">
        <form className="space-y-4" onSubmit={onGenerate}>
          <Field label="Argomento">
            <input className={fieldClassName} value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} placeholder="es. Algebra Lineare" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Difficoltà">
              <select className={fieldClassName} value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as typeof f.difficulty }))}>
                <option value="easy">Facile</option>
                <option value="medium">Medio</option>
                <option value="hard">Difficile</option>
              </select>
            </Field>
            <Field label="Errori precedenti">
              <input className={fieldClassName} value={form.previousMistakes} onChange={(e) => setForm((f) => ({ ...f, previousMistakes: e.target.value }))} placeholder="separati da virgola" />
            </Field>
          </div>
          <button disabled={isSubmitting} className={primaryButtonClassName} type="submit">
            {isSubmitting ? "Generazione..." : "Genera quiz"}
          </button>
        </form>
      </Panel>

      {quizResult ? (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-950">
              Quiz: {quizResult.quiz.topic}
            </h2>
            <Badge label={quizResult.quiz.difficulty} />
            <Badge label={`AI: ${quizResult.aiMode}`} />
          </div>
          {quizResult.quiz.questions.map((question, index) => (
            <div key={question.prompt} className="rounded-3xl border border-black/8 bg-white/90 p-5 backdrop-blur">
              <h3 className="font-semibold text-slate-950">
                {index + 1}. {question.prompt}
              </h3>
              <ul className="mt-3 space-y-2">
                {question.options.map((option) => (
                  <li
                    key={option}
                    className={`rounded-xl px-4 py-2.5 text-sm ${
                      option === question.correctAnswer
                        ? "border border-teal-500/20 bg-teal-50 font-medium text-teal-950"
                        : "border border-black/5 bg-stone-50 text-slate-700"
                    }`}
                  >
                    {option}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-slate-600">
                <span className="font-medium">Spiegazione:</span> {question.explanation}
              </p>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
