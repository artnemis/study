"use client";

import Link from "next/link";
import { type FormEvent, use, useState } from "react";
import { useSession } from "next-auth/react";
import { acceptInviteApi, createInviteApi } from "@/app/_lib/api-client";
import { getDisplayCurriculum } from "@/core/module/module-curriculum";
import { useModule } from "@/hooks/useModule";
import { useT } from "@/lib/i18n/context";
import type { ModuleInvite } from "@/core/module/module.types";
import {
  Badge,
  Feedback,
  Field,
  Metric,
  Panel,
  fieldClassName,
  secondaryButtonClassName,
  toMessage,
} from "@/app/_components/ui";

export default function ModuleDetailPage(props: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(props.params);
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;
  const t = useT();
  const moduleDetails = useModule(moduleId, {
    enabled: true,
    requesterId: userId,
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invite form
  const [inviteForm, setInviteForm] = useState({ email: "", role: "viewer" as "editor" | "viewer" });
  const [inviteResult, setInviteResult] = useState<ModuleInvite | null>(null);

  // Accept form
  const [acceptForm, setAcceptForm] = useState({ token: "" });

  async function onCreateInvite(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const invite = await createInviteApi({ email: inviteForm.email, moduleId, role: inviteForm.role });
      setInviteResult(invite);
      setInviteForm({ email: "", role: inviteForm.role });
      setFeedback(`${t.detail_inviteSent} (${invite.email})`);
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onAcceptInvite(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);
    try {
      await acceptInviteApi({ token: acceptForm.token, userId });
      setAcceptForm({ token: "" });
      setFeedback(t.detail_inviteSent);
      await moduleDetails.reload();
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const mod = moduleDetails.module;
  const curriculum = mod ? getDisplayCurriculum(mod) : [];
  const isAuthenticated = status === "authenticated" && !!userId;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <Link href="/modules" className="hover:text-teal-700">← {t.detail_back}</Link>
      </div>

      <Feedback message={feedback} />

      {moduleDetails.isLoading ? (
        <p className="text-sm text-slate-500">{t.common_loading}</p>
      ) : moduleDetails.error ? (
        <p className="text-sm text-rose-700">{moduleDetails.error.message}</p>
      ) : mod ? (
        <>
          {/* Header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">{mod.name}</h1>
              <Badge label={mod.visibility} />
            </div>
            <p className="text-sm text-slate-600">{mod.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Metric label={t.mod_owner} value={mod.ownerId} />
            <Metric label={t.detail_members} value={String(mod.members.length)} />
          </div>

          {/* Members list */}
          <Panel title={t.detail_members}>
            {mod.members.length === 0 ? (
              <p className="text-sm text-slate-500">{t.detail_noMembers}</p>
            ) : (
              <div className="space-y-2">
                {mod.members.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between rounded-2xl border border-black/8 bg-stone-50 px-4 py-3 text-sm">
                    <span className="font-medium text-slate-950">{member.userId}</span>
                    <Badge label={member.role} />
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Create invite */}
            <Panel title={t.detail_invite}>
              {isAuthenticated ? (
                <form className="space-y-3" onSubmit={onCreateInvite}>
                  <Field label={t.detail_email}>
                    <input className={fieldClassName} value={inviteForm.email} onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))} placeholder="user@example.com" />
                  </Field>
                  <Field label={t.detail_role}>
                    <select className={fieldClassName} value={inviteForm.role} onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value as "editor" | "viewer" }))}>
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                  </Field>
                  <button disabled={isSubmitting} className={secondaryButtonClassName} type="submit">
                    {isSubmitting ? t.detail_sending : t.detail_sendInvite}
                  </button>
                  {inviteResult ? (
                    <div className="rounded-2xl border border-amber-900/10 bg-amber-50 p-4 text-sm text-amber-950">
                      <div className="font-semibold">{t.detail_copyToken}</div>
                      <div className="mt-1 break-all font-mono text-xs">{inviteResult.token}</div>
                    </div>
                  ) : null}
                </form>
              ) : (
                <div className="space-y-3 text-sm text-slate-600">
                  <p>{t.common_signInRequired}</p>
                  <Link href="/auth/sign-in" className={secondaryButtonClassName}>
                    {t.auth_signIn}
                  </Link>
                </div>
              )}
            </Panel>

            {/* Accept invite */}
            <Panel title={t.detail_acceptInvite}>
              {isAuthenticated ? (
                <form className="space-y-3" onSubmit={onAcceptInvite}>
                  <Field label="Token">
                    <input className={fieldClassName} value={acceptForm.token} onChange={(e) => setAcceptForm((f) => ({ ...f, token: e.target.value }))} />
                  </Field>
                  <button disabled={isSubmitting} className={secondaryButtonClassName} type="submit">
                    {t.detail_acceptInvite}
                  </button>
                </form>
              ) : (
                <div className="space-y-3 text-sm text-slate-600">
                  <p>{t.common_signInRequired}</p>
                  <Link href="/auth/sign-in" className={secondaryButtonClassName}>
                    {t.auth_signIn}
                  </Link>
                </div>
              )}
            </Panel>
          </div>

          {/* Quick links */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/modules/${encodeURIComponent(mod.id)}/curriculum`}
              className="group rounded-3xl border border-black/8 bg-white/90 p-5 text-center backdrop-blur transition hover:border-teal-500/30 hover:shadow-lg"
            >
              <div className="mb-2 text-2xl">📚</div>
              <h3 className="font-semibold text-slate-950 group-hover:text-teal-800">{t.curr_title}</h3>
              <p className="mt-1 text-xs text-slate-500">{curriculum.length} {t.curr_section.toLowerCase()}</p>
            </Link>
            <Link
              href={`/modules/${encodeURIComponent(mod.id)}/materials`}
              className="group rounded-3xl border border-black/8 bg-white/90 p-5 text-center backdrop-blur transition hover:border-teal-500/30 hover:shadow-lg"
            >
              <div className="mb-2 text-2xl">📄</div>
              <h3 className="font-semibold text-slate-950 group-hover:text-teal-800">{t.mat_title}</h3>
              <p className="mt-1 text-xs text-slate-500">{mod.materials?.length ?? 0} file</p>
            </Link>
            <Link
              href={`/quiz?topic=${encodeURIComponent(mod.name)}`}
              className="group rounded-3xl border border-black/8 bg-white/90 p-5 text-center backdrop-blur transition hover:border-teal-500/30 hover:shadow-lg"
            >
              <div className="mb-2 text-2xl">🧠</div>
              <h3 className="font-semibold text-slate-950 group-hover:text-teal-800">{t.detail_quiz}</h3>
            </Link>
            <Link
              href={`/plans?topics=${encodeURIComponent(mod.name)}`}
              className="group rounded-3xl border border-black/8 bg-white/90 p-5 text-center backdrop-blur transition hover:border-teal-500/30 hover:shadow-lg"
            >
              <div className="mb-2 text-2xl">📅</div>
              <h3 className="font-semibold text-slate-950 group-hover:text-teal-800">{t.detail_plan}</h3>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
