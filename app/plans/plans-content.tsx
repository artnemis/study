"use client";

import { type FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { generatePlanApi } from "@/app/_lib/api-client";
import type { PlanResponse } from "@/app/_lib/api-client";
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

export default function PlansContent() {
  const searchParams = useSearchParams();
  const t = useT();
  const [form, setForm] = useState({
    examDate: "",
    dailyStudyMinutes: "90",
    topics: searchParams.get("topics") ?? "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<PlanResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onGenerate(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const topics = form.topics
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      const result = await generatePlanApi({
        examDate: form.examDate,
        dailyStudyMinutes: Number(form.dailyStudyMinutes),
        topics,
      });
      setPlanResult(result);
      setFeedback(`${t.plan_aiMode}: ${result.aiMode}`);
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <PageHeader title={t.plan_title} subtitle={t.plan_subtitle} />

      <Feedback message={feedback} />

      <Panel title={t.plan_title}>
        <form className="space-y-4" onSubmit={onGenerate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.plan_examDate}>
              <input className={fieldClassName} type="date" value={form.examDate} onChange={(e) => setForm((f) => ({ ...f, examDate: e.target.value }))} />
            </Field>
            <Field label={t.plan_dailyMinutes}>
              <input className={fieldClassName} type="number" min="30" step="15" value={form.dailyStudyMinutes} onChange={(e) => setForm((f) => ({ ...f, dailyStudyMinutes: e.target.value }))} />
            </Field>
          </div>
          <Field label={t.plan_topics}>
            <textarea className={`${fieldClassName} min-h-20 resize-y`} value={form.topics} onChange={(e) => setForm((f) => ({ ...f, topics: e.target.value }))} placeholder={t.plan_topicsPlaceholder} />
          </Field>
          <button disabled={isSubmitting} className={primaryButtonClassName} type="submit">
            {isSubmitting ? t.plan_generating : t.plan_generate}
          </button>
        </form>
      </Panel>

      {planResult ? (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-950">{t.plan_title}</h2>
            <Badge label={`AI: ${planResult.aiMode}`} />
          </div>
          {planResult.plan.days.map((day) => (
            <div key={day.date} className="rounded-3xl border border-black/8 bg-white/90 p-5 backdrop-blur">
              <h3 className="text-lg font-semibold text-slate-950">{day.date}</h3>
              <div className="mt-3 space-y-2">
                {day.tasks.map((task) => (
                  <div key={`${day.date}-${task.topic}-${task.kind}`} className="rounded-2xl border border-black/5 bg-stone-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-950">{task.topic}</span>
                      <div className="flex items-center gap-2">
                        <Badge label={task.kind} />
                        <span className="text-xs text-slate-500">{task.durationMinutes} min</span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">{task.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
