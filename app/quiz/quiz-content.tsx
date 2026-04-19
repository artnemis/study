"use client";

import { type FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { generateQuizApi } from "@/app/_lib/api-client";
import type { QuizResponse } from "@/app/_lib/api-client";
import { useT } from "@/lib/i18n/context";
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
  const t = useT();
  const [form, setForm] = useState({
    topic: searchParams.get("topic") ?? "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    template: "multiple-choice" as "multiple-choice" | "free-response" | "mixed",
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
        template: form.template,
        previousMistakes: form.previousMistakes
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v.length > 0),
      });
      setQuizResult(result);
      setFeedback(`${t.quiz_aiMode}: ${result.aiMode}`);
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <PageHeader title={t.quiz_title} subtitle={t.quiz_subtitle} />

      <Feedback message={feedback} />

      <Panel title={t.quiz_title}>
        <form className="space-y-4" onSubmit={onGenerate}>
          <Field label={t.quiz_topic}>
            <input className={fieldClassName} value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} />
          </Field>
          <Field label={t.quiz_difficulty}>
            <select className={fieldClassName} value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as typeof f.difficulty }))}>
              <option value="easy">{t.quiz_easy}</option>
              <option value="medium">{t.quiz_medium}</option>
              <option value="hard">{t.quiz_hard}</option>
            </select>
          </Field>
          <Field label={t.tmpl_label}>
            <select className={fieldClassName} value={form.template} onChange={(e) => setForm((f) => ({ ...f, template: e.target.value as typeof f.template }))}>
              <option value="multiple-choice">{t.tmpl_multipleChoice}</option>
              <option value="free-response">{t.tmpl_freeResponse}</option>
              <option value="mixed">{t.tmpl_mixed}</option>
            </select>
          </Field>
          <button disabled={isSubmitting} className={primaryButtonClassName} type="submit">
            {isSubmitting ? t.quiz_generating : t.quiz_generate}
          </button>
        </form>
      </Panel>

      {quizResult ? (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-950">
              {t.quiz_title}: {quizResult.quiz.topic}
            </h2>
            <Badge label={quizResult.quiz.difficulty} />
            <Badge label={`AI: ${quizResult.aiMode}`} />
          </div>
          {quizResult.quiz.questions.map((question, index) => (
            <div key={question.prompt} className="rounded-3xl border border-black/8 bg-white/90 p-5 backdrop-blur">
              <h3 className="font-semibold text-slate-950">
                {index + 1}. {question.prompt}
              </h3>
              {question.options.length > 0 ? (
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
              ) : (
                <div className="mt-3 rounded-xl border border-teal-500/20 bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-950">
                  {question.correctAnswer}
                </div>
              )}
              <p className="mt-3 text-sm text-slate-600">
                {question.explanation}
              </p>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
