"use client";

import Link from "next/link";
import { type FormEvent, use, useState } from "react";
import { acceptInviteApi, createInviteApi, getModuleApi } from "@/app/_lib/api-client";
import { useModule } from "@/hooks/useModule";
import type { ModuleInvite } from "@/core/module/module.types";
import {
  Badge,
  Feedback,
  Field,
  Metric,
  Panel,
  fieldClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  toMessage,
} from "@/app/_components/ui";

export default function ModuleDetailPage(props: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(props.params);
  const [requesterId] = useState("demo-owner");
  const moduleDetails = useModule(moduleId, {
    enabled: true,
    fetcher: async (id) => getModuleApi(id, requesterId),
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invite form
  const [inviteForm, setInviteForm] = useState({ email: "", role: "viewer" as "editor" | "viewer" });
  const [inviteResult, setInviteResult] = useState<ModuleInvite | null>(null);

  // Accept form
  const [acceptForm, setAcceptForm] = useState({ token: "", userId: "" });

  async function onCreateInvite(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const invite = await createInviteApi({ email: inviteForm.email, moduleId, role: inviteForm.role });
      setInviteResult(invite);
      setInviteForm({ email: "", role: inviteForm.role });
      setFeedback(`Token invito creato per ${invite.email}`);
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onAcceptInvite(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await acceptInviteApi(acceptForm);
      setAcceptForm({ token: "", userId: "" });
      setFeedback(`Invito accettato per il modulo ${result.member.moduleId}`);
      await moduleDetails.reload();
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const mod = moduleDetails.module;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <Link href="/modules" className="hover:text-teal-700">← Moduli</Link>
      </div>

      <Feedback message={feedback} />

      {moduleDetails.isLoading ? (
        <p className="text-sm text-slate-500">Caricamento...</p>
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
            <Metric label="Owner" value={mod.ownerId} />
            <Metric label="Membri" value={String(mod.members.length)} />
          </div>

          {/* Members list */}
          <Panel title="Membri">
            {mod.members.length === 0 ? (
              <p className="text-sm text-slate-500">Nessun membro.</p>
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
            <Panel title="Crea invito">
              <form className="space-y-3" onSubmit={onCreateInvite}>
                <Field label="Email">
                  <input className={fieldClassName} value={inviteForm.email} onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))} placeholder="collega@example.com" />
                </Field>
                <Field label="Ruolo">
                  <select className={fieldClassName} value={inviteForm.role} onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value as "editor" | "viewer" }))}>
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                </Field>
                <button disabled={isSubmitting} className={secondaryButtonClassName} type="submit">
                  Genera token invito
                </button>
                {inviteResult ? (
                  <div className="rounded-2xl border border-amber-900/10 bg-amber-50 p-4 text-sm text-amber-950">
                    <div className="font-semibold">Token invito</div>
                    <div className="mt-1 break-all font-mono text-xs">{inviteResult.token}</div>
                    <div className="mt-1 text-xs">Scade: {new Date(inviteResult.expiresAt).toLocaleString()}</div>
                  </div>
                ) : null}
              </form>
            </Panel>

            {/* Accept invite */}
            <Panel title="Accetta invito">
              <form className="space-y-3" onSubmit={onAcceptInvite}>
                <Field label="Token">
                  <input className={fieldClassName} value={acceptForm.token} onChange={(e) => setAcceptForm((f) => ({ ...f, token: e.target.value }))} placeholder="Incolla il token ricevuto" />
                </Field>
                <Field label="User id">
                  <input className={fieldClassName} value={acceptForm.userId} onChange={(e) => setAcceptForm((f) => ({ ...f, userId: e.target.value }))} placeholder="viewer-1" />
                </Field>
                <button disabled={isSubmitting} className={secondaryButtonClassName} type="submit">
                  Accetta invito
                </button>
              </form>
            </Panel>
          </div>

          {/* Quick links to quiz and plans */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href={`/quiz?topic=${encodeURIComponent(mod.name)}`}
              className="group rounded-3xl border border-black/8 bg-white/90 p-5 text-center backdrop-blur transition hover:border-teal-500/30 hover:shadow-lg"
            >
              <div className="mb-2 text-2xl">🧠</div>
              <h3 className="font-semibold text-slate-950 group-hover:text-teal-800">Genera quiz</h3>
              <p className="mt-1 text-sm text-slate-600">Crea un quiz su &quot;{mod.name}&quot;</p>
            </Link>
            <Link
              href={`/plans?topics=${encodeURIComponent(mod.name)}`}
              className="group rounded-3xl border border-black/8 bg-white/90 p-5 text-center backdrop-blur transition hover:border-teal-500/30 hover:shadow-lg"
            >
              <div className="mb-2 text-2xl">📅</div>
              <h3 className="font-semibold text-slate-950 group-hover:text-teal-800">Piano di studio</h3>
              <p className="mt-1 text-sm text-slate-600">Pianifica lo studio per &quot;{mod.name}&quot;</p>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
