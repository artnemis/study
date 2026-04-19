"use client";

import {
  type FormEvent,
  startTransition,
  useDeferredValue,
  useState,
} from "react";

import {
  acceptInviteApi,
  createInviteApi,
  createModuleApi,
  generatePlanApi,
  generateQuizApi,
} from "@/app/_lib/api-client";
import { useModule } from "@/hooks/useModule";
import { useModuleCatalog } from "@/hooks/useModuleCatalog";
import type { ModuleInvite } from "@/core/module/module.types";
import type { PlanResponse } from "@/app/_lib/api-client";
import type { QuizResponse } from "@/app/_lib/api-client";

interface CreateModuleFormState {
  description: string;
  name: string;
  ownerId: string;
  visibility: "public" | "private";
}

interface InviteFormState {
  email: string;
  role: "editor" | "viewer";
}

interface QuizFormState {
  difficulty: "easy" | "medium" | "hard";
  previousMistakes: string;
  topic: string;
}

export function MvpShell() {
  const [requesterId, setRequesterId] = useState("demo-owner");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createForm, setCreateForm] = useState<CreateModuleFormState>({
    description: "",
    name: "",
    ownerId: "demo-owner",
    visibility: "public",
  });
  const [inviteForm, setInviteForm] = useState<InviteFormState>({
    email: "",
    role: "viewer",
  });
  const [acceptForm, setAcceptForm] = useState({
    token: "",
    userId: "",
  });
  const [quizForm, setQuizForm] = useState<QuizFormState>({
    difficulty: "medium",
    previousMistakes: "",
    topic: "",
  });
  const [planForm, setPlanForm] = useState({
    dailyStudyMinutes: "90",
    examDate: "",
    topics: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<ModuleInvite | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResponse | null>(null);
  const [planResult, setPlanResult] = useState<PlanResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const catalog = useModuleCatalog(requesterId);
  const activeModuleId =
    selectedModuleId && catalog.modules.some((studyModule) => studyModule.id === selectedModuleId)
      ? selectedModuleId
      : catalog.modules[0]?.id ?? null;
  const moduleDetails = useModule(activeModuleId, {
    enabled: activeModuleId !== null,
    requesterId,
  });
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const filteredModules = catalog.modules.filter((studyModule) => {
    const query = deferredSearchQuery.trim().toLowerCase();

    if (query.length === 0) {
      return true;
    }

    return (
      studyModule.name.toLowerCase().includes(query) ||
      studyModule.description.toLowerCase().includes(query) ||
      studyModule.visibility.toLowerCase().includes(query)
    );
  });

  async function onCreateModule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createModuleApi(createForm);
      setCreateForm({
        description: "",
        name: "",
        ownerId: createForm.ownerId,
        visibility: "public",
      });
      setFeedback(`Module created: ${result.module.name}`);
      startTransition(() => {
        setSelectedModuleId(result.module.id);
      });
      await catalog.reload();
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onCreateInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeModuleId) {
      setFeedback("Select a module before creating an invite.");

      return;
    }

    setIsSubmitting(true);

    try {
      const invite = await createInviteApi({
        email: inviteForm.email,
        moduleId: activeModuleId,
        role: inviteForm.role,
      });

      setInviteResult(invite);
      setInviteForm({ email: "", role: inviteForm.role });
      setFeedback(`Invite token created for ${invite.email}`);
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onAcceptInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await acceptInviteApi(acceptForm);

      setAcceptForm({ token: "", userId: "" });
      setFeedback(`Invite accepted for module ${result.member.moduleId}`);
      setRequesterId(result.member.userId);
      startTransition(() => {
        setSelectedModuleId(result.member.moduleId);
      });
      await catalog.reload();
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onGenerateQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const topic = quizForm.topic.trim().length > 0 ? quizForm.topic : moduleDetails.module?.name ?? "";

      const nextQuiz = await generateQuizApi({
        difficulty: quizForm.difficulty,
        previousMistakes: quizForm.previousMistakes
          .split(",")
          .map((value) => value.trim())
          .filter((value) => value.length > 0),
        topic,
      });

      setQuizResult(nextQuiz);
      setFeedback(`Quiz generated in ${nextQuiz.aiMode} mode.`);
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onGeneratePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const topics = planForm.topics
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

      const nextPlan = await generatePlanApi({
        dailyStudyMinutes: Number(planForm.dailyStudyMinutes),
        examDate: planForm.examDate,
        topics: topics.length > 0 ? topics : moduleDetails.module ? [moduleDetails.module.name] : [],
      });

      setPlanResult(nextPlan);
      setFeedback(`Study plan generated in ${nextPlan.aiMode} mode.`);
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10">
      <section className="grid gap-4 rounded-4xl border border-black/10 bg-[linear-gradient(135deg,#fff7e8_0%,#f4fbf7_45%,#eef5ff_100%)] p-6 shadow-[0_24px_80px_rgba(18,38,35,0.12)] lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-black/60 backdrop-blur">
            Artnemis MVP
          </div>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
              AI exam prep that already works end-to-end.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
              Create a study module, inspect members, mint invite tokens, accept collaboration invites, and generate quizzes plus study plans from the same dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-700">
            <Badge label={`Storage: ${catalog.storageMode ?? "loading"}`} />
            <Badge label={`Modules: ${String(catalog.modules.length)}`} />
            <Badge label={`Viewer Id: ${requesterId.trim() || "anonymous"}`} />
          </div>
        </div>
        <div className="rounded-3xl border border-white/60 bg-white/80 p-4 backdrop-blur">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Active Requester
          </label>
          <input
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500"
            value={requesterId}
            onChange={(event) => setRequesterId(event.target.value)}
            placeholder="demo-owner"
          />
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Use an owner or collaborator id to browse private modules and validate invite acceptance flows without authentication wiring.
          </p>
        </div>
      </section>

      {feedback ? (
        <div className="rounded-2xl border border-teal-900/10 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {feedback}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr_1fr]">
        <Panel title="Module Catalog" subtitle="Public modules and any private modules visible to the current requester.">
          <div className="space-y-3">
            <input
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Filter by title, summary or visibility"
            />
            <div className="space-y-2">
              {catalog.isLoading ? <EmptyState label="Loading modules..." /> : null}
              {!catalog.isLoading && filteredModules.length === 0 ? <EmptyState label="No visible modules yet." /> : null}
              {filteredModules.map((studyModule) => (
                <button
                  key={studyModule.id}
                  type="button"
                  onClick={() => startTransition(() => setSelectedModuleId(studyModule.id))}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                    activeModuleId === studyModule.id
                      ? "border-teal-600 bg-teal-50"
                      : "border-black/8 bg-white hover:border-black/20 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-slate-950">{studyModule.name}</h2>
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-white">
                      {studyModule.visibility}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{studyModule.description}</p>
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Module Workspace" subtitle="Create modules, inspect details and manage collaboration in one place.">
          <form className="space-y-3" onSubmit={onCreateModule}>
            <Field label="Module name">
              <input className={fieldClassName} value={createForm.name} onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))} placeholder="Oral Analysis Crash Pack" />
            </Field>
            <Field label="Description">
              <textarea className={`${fieldClassName} min-h-24 resize-y`} value={createForm.description} onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))} placeholder="Topics, exam angle and collaboration scope" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Owner id">
                <input className={fieldClassName} value={createForm.ownerId} onChange={(event) => setCreateForm((current) => ({ ...current, ownerId: event.target.value }))} placeholder="demo-owner" />
              </Field>
              <Field label="Visibility">
                <select className={fieldClassName} value={createForm.visibility} onChange={(event) => setCreateForm((current) => ({ ...current, visibility: event.target.value as "public" | "private" }))}>
                  <option value="public">public</option>
                  <option value="private">private</option>
                </select>
              </Field>
            </div>
            <button disabled={isSubmitting} className={primaryButtonClassName} type="submit">
              Create module
            </button>
          </form>

          <div className="mt-6 rounded-3xl border border-black/8 bg-stone-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Selected module</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  {moduleDetails.module?.name ?? "Choose a module"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {moduleDetails.module?.description ?? "Module details will appear here after selection."}
                </p>
              </div>
              {moduleDetails.module ? <Badge label={moduleDetails.module.visibility} /> : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric label="Members" value={String(moduleDetails.module?.members.length ?? 0)} />
              <Metric label="Owner" value={moduleDetails.module?.ownerId ?? "-"} />
            </div>
            {moduleDetails.error ? <p className="mt-4 text-sm text-rose-700">{moduleDetails.error.message}</p> : null}
          </div>

          <form className="mt-6 space-y-3" onSubmit={onCreateInvite}>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Field label="Invite email">
                <input className={fieldClassName} value={inviteForm.email} onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))} placeholder="colleague@example.com" />
              </Field>
              <Field label="Role">
                <select className={fieldClassName} value={inviteForm.role} onChange={(event) => setInviteForm((current) => ({ ...current, role: event.target.value as "editor" | "viewer" }))}>
                  <option value="viewer">viewer</option>
                  <option value="editor">editor</option>
                </select>
              </Field>
            </div>
            <button disabled={isSubmitting || !activeModuleId} className={secondaryButtonClassName} type="submit">
              Mint invite token
            </button>
            {inviteResult ? (
              <div className="rounded-2xl border border-amber-900/10 bg-amber-50 p-4 text-sm text-amber-950">
                <div className="font-semibold">Latest invite token</div>
                <div className="mt-1 break-all font-mono text-xs">{inviteResult.token}</div>
                <div className="mt-1">Expires: {new Date(inviteResult.expiresAt).toLocaleString()}</div>
              </div>
            ) : null}
          </form>

          <form className="mt-6 space-y-3" onSubmit={onAcceptInvite}>
            <Field label="Accept invite token">
              <input className={fieldClassName} value={acceptForm.token} onChange={(event) => setAcceptForm((current) => ({ ...current, token: event.target.value }))} placeholder="Paste a token to create membership" />
            </Field>
            <Field label="User id">
              <input className={fieldClassName} value={acceptForm.userId} onChange={(event) => setAcceptForm((current) => ({ ...current, userId: event.target.value }))} placeholder="viewer-1" />
            </Field>
            <button disabled={isSubmitting} className={secondaryButtonClassName} type="submit">
              Accept invite
            </button>
          </form>
        </Panel>

        <div className="grid gap-6">
          <Panel title="Quiz Generator" subtitle="Drive the quiz route end-to-end through the selected topic context.">
            <form className="space-y-3" onSubmit={onGenerateQuiz}>
              <Field label="Topic">
                <input className={fieldClassName} value={quizForm.topic} onChange={(event) => setQuizForm((current) => ({ ...current, topic: event.target.value }))} placeholder="Linear Algebra" />
              </Field>
              <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
                <Field label="Difficulty">
                  <select className={fieldClassName} value={quizForm.difficulty} onChange={(event) => setQuizForm((current) => ({ ...current, difficulty: event.target.value as typeof current.difficulty }))}>
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                  </select>
                </Field>
                <Field label="Previous mistakes">
                  <input className={fieldClassName} value={quizForm.previousMistakes} onChange={(event) => setQuizForm((current) => ({ ...current, previousMistakes: event.target.value }))} placeholder="comma, separated, misconceptions" />
                </Field>
              </div>
              <button disabled={isSubmitting} className={primaryButtonClassName} type="submit">
                Generate quiz
              </button>
            </form>
            {quizResult ? (
              <div className="mt-4 space-y-3">
                <Badge label={`AI mode: ${quizResult.aiMode}`} />
                {quizResult.quiz.questions.map((question, index) => (
                  <div key={question.prompt} className="rounded-2xl border border-black/8 bg-stone-50 p-4 text-sm text-slate-700">
                    <div className="font-semibold text-slate-950">Q{index + 1}. {question.prompt}</div>
                    <ul className="mt-3 space-y-1.5">
                      {question.options.map((option) => (
                        <li key={option} className={`rounded-xl px-3 py-2 ${option === question.correctAnswer ? "bg-teal-100 text-teal-950" : "bg-white"}`}>
                          {option}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs leading-5 text-slate-600">{question.explanation}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </Panel>

          <Panel title="Study Plan Generator" subtitle="Generate a day-by-day schedule with validated task limits.">
            <form className="space-y-3" onSubmit={onGeneratePlan}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Exam date">
                  <input className={fieldClassName} type="date" value={planForm.examDate} onChange={(event) => setPlanForm((current) => ({ ...current, examDate: event.target.value }))} />
                </Field>
                <Field label="Daily minutes">
                  <input className={fieldClassName} type="number" min="30" step="15" value={planForm.dailyStudyMinutes} onChange={(event) => setPlanForm((current) => ({ ...current, dailyStudyMinutes: event.target.value }))} />
                </Field>
              </div>
              <Field label="Topics">
                <textarea className={`${fieldClassName} min-h-24 resize-y`} value={planForm.topics} onChange={(event) => setPlanForm((current) => ({ ...current, topics: event.target.value }))} placeholder="comma-separated topics" />
              </Field>
              <button disabled={isSubmitting} className={primaryButtonClassName} type="submit">
                Generate plan
              </button>
            </form>
            {planResult ? (
              <div className="mt-4 space-y-3">
                <Badge label={`AI mode: ${planResult.aiMode}`} />
                {planResult.plan.days.map((day) => (
                  <div key={day.date} className="rounded-2xl border border-black/8 bg-stone-50 p-4 text-sm text-slate-700">
                    <div className="font-semibold text-slate-950">{day.date}</div>
                    <div className="mt-3 space-y-2">
                      {day.tasks.map((task) => (
                        <div key={`${day.date}-${task.topic}-${task.kind}-${task.durationMinutes}`} className="rounded-xl bg-white px-3 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-slate-950">{task.topic}</span>
                            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-white">
                              {task.kind}
                            </span>
                          </div>
                          <p className="mt-2 text-slate-600">{task.description}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{task.durationMinutes} minutes</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </Panel>
        </div>
      </section>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
      {label}
    </span>
  );
}

function Panel({ children, subtitle, title }: { children: React.ReactNode; subtitle: string; title: string }) {
  return (
    <section className="rounded-4xl border border-black/8 bg-white/90 p-5 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mb-4 space-y-1">
        <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">{title}</h2>
        <p className="text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-black/10 bg-stone-50 px-4 py-5 text-sm text-slate-500">{label}</div>;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error.";
}

const fieldClassName =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500";

const primaryButtonClassName =
  "inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300";

const secondaryButtonClassName =
  "inline-flex items-center justify-center rounded-full border border-slate-900/15 bg-stone-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-slate-400";