"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useSession } from "next-auth/react";
import { getDisplayCurriculum } from "@/core/module/module-curriculum";
import { useModule } from "@/hooks/useModule";
import { useT } from "@/lib/i18n/context";
import type { ModuleSection } from "@/core/module/module.types";
import {
  Badge,
  EmptyState,
  Feedback,
  PageHeader,
} from "@/app/_components/ui";

export default function CurriculumPage(props: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(props.params);
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const t = useT();
  const moduleDetails = useModule(moduleId, {
    enabled: true,
    requesterId: userId,
  });

  const mod = moduleDetails.module;
  const sections: ModuleSection[] = mod ? getDisplayCurriculum(mod) : [];

  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const completedLessons = sections.reduce(
    (sum, s) => sum + s.lessons.filter((l) => l.completed).length,
    0,
  );
  const totalMinutes = sections.reduce(
    (sum, s) => sum + s.lessons.reduce((ls, l) => ls + l.durationMinutes, 0),
    0,
  );

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <Link href={`/modules/${encodeURIComponent(moduleId)}`} className="hover:text-teal-700">
          ← {t.common_back}
        </Link>
      </div>

      {moduleDetails.isLoading ? (
        <p className="text-sm text-slate-500">{t.common_loading}</p>
      ) : moduleDetails.error ? (
        <Feedback message={moduleDetails.error.message} variant="error" />
      ) : mod ? (
        <>
          <PageHeader title={`${t.curr_title} — ${mod.name}`} subtitle={mod.description} />

          {/* Progress bar */}
          <div className="rounded-2xl border border-black/8 bg-white/90 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {completedLessons}/{totalLessons} {t.curr_lessonsCount} · {totalMinutes} min
              </span>
              <span className="font-semibold text-teal-800">{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-teal-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {sections.length === 0 ? (
            <EmptyState
              icon="📚"
              label={t.curr_noSections}
            />
          ) : (
            <div className="space-y-3">
              {sections.map((section, sectionIndex) => {
                const sectionCompleted = section.lessons.filter((l) => l.completed).length;
                const sectionTotal = section.lessons.length;
                const sectionMinutes = section.lessons.reduce((sum, l) => sum + l.durationMinutes, 0);

                return (
                  <SectionAccordion
                    key={section.id}
                    section={section}
                    index={sectionIndex}
                    completed={sectionCompleted}
                    total={sectionTotal}
                    totalMinutes={sectionMinutes}
                    t={t}
                  />
                );
              })}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

const LESSON_TYPE_ICONS: Record<string, string> = {
  reading: "📖",
  video: "🎬",
  exercise: "✍️",
  quiz: "🧠",
};

function SectionAccordion({
  section,
  index,
  completed,
  total,
  totalMinutes,
  t,
}: {
  section: ModuleSection;
  index: number;
  completed: number;
  total: number;
  totalMinutes: number;
  t: ReturnType<typeof useT>;
}) {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <div className="overflow-hidden rounded-3xl border border-black/8 bg-white/90 backdrop-blur">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-stone-50"
      >
        <div className="flex items-center gap-3">
          <span className={`inline-flex h-6 w-6 items-center justify-center text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>
            ▶
          </span>
          <div>
            <h3 className="font-semibold text-slate-950">
              {t.curr_section} {index + 1}: {section.title}
            </h3>
            <p className="text-xs text-slate-500">
              {completed}/{total} {t.curr_lessonsCount} · {totalMinutes} min
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {completed === total && total > 0 ? (
            <Badge label="✓" variant="success" />
          ) : (
            <span className="text-xs text-slate-400">
              {Math.round((completed / Math.max(total, 1)) * 100)}%
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-black/5 px-5 pb-4">
          {section.lessons.length === 0 ? (
            <p className="py-3 text-sm text-slate-500">{t.curr_noSections}</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {section.lessons.map((lesson, lessonIndex) => (
                <li
                  key={lesson.id}
                  className="flex items-center gap-3 py-3"
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                    lesson.completed
                      ? "bg-teal-100 text-teal-800"
                      : "bg-stone-100 text-slate-500"
                  }`}>
                    {lesson.completed ? "✓" : lessonIndex + 1}
                  </span>
                  <span className="text-sm" title={LESSON_TYPE_ICONS[lesson.type] ?? ""}>
                    {LESSON_TYPE_ICONS[lesson.type] ?? "📝"}
                  </span>
                  <span className={`flex-1 text-sm ${lesson.completed ? "text-slate-400 line-through" : "text-slate-900"}`}>
                    {lesson.title}
                  </span>
                  <span className="text-xs text-slate-400">{lesson.durationMinutes} min</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
