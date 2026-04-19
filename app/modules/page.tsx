"use client";

import Link from "next/link";
import { type FormEvent, startTransition, useDeferredValue, useState } from "react";
import { useSession } from "next-auth/react";
import { createModuleApi } from "@/app/_lib/api-client";
import { useModuleCatalog } from "@/hooks/useModuleCatalog";
import { useT } from "@/lib/i18n/context";
import {
  Badge,
  EmptyState,
  Feedback,
  Field,
  PageHeader,
  Panel,
  fieldClassName,
  primaryButtonClassName,
  toMessage,
} from "@/app/_components/ui";

export default function ModulesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const catalog = useModuleCatalog(userId);
  const t = useT();
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    visibility: "public" as "public" | "private",
  });

  const filtered = catalog.modules.filter((m) => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return true;
    return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
  });

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);
    try {
      const result = await createModuleApi({ ...form, ownerId: userId });
      setForm({ name: "", description: "", visibility: "public" });
      setFeedback(`${t.mod_create}: ${result.module.name}`);
      setShowCreate(false);
      await catalog.reload();
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <PageHeader title={t.mod_title} subtitle={t.mod_subtitle}>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className={primaryButtonClassName}
        >
          {showCreate ? t.mod_cancel : `+ ${t.mod_createNew}`}
        </button>
      </PageHeader>

      <Feedback message={feedback} />

      {showCreate ? (
        <Panel title={t.mod_createNew}>
          <form className="space-y-3" onSubmit={onCreate}>
            <Field label={t.mod_name}>
              <input className={fieldClassName} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label={t.mod_description}>
              <textarea className={`${fieldClassName} min-h-20 resize-y`} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </Field>
            <Field label={t.mod_visibility}>
              <select className={fieldClassName} value={form.visibility} onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value as "public" | "private" }))}>
                <option value="public">{t.mod_public}</option>
                <option value="private">{t.mod_private}</option>
              </select>
            </Field>
            <button disabled={isSubmitting} className={primaryButtonClassName} type="submit">
              {isSubmitting ? t.mod_creating : t.mod_create}
            </button>
          </form>
        </Panel>
      ) : null}

      {/* Search */}
      <input
        className={fieldClassName}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="..."
      />

      {/* Module list */}
      <div className="space-y-3">
        {catalog.isLoading ? <EmptyState label={t.common_loading} /> : null}
        {!catalog.isLoading && filtered.length === 0 ? <EmptyState label={t.mod_noModules} /> : null}
        {filtered.map((mod) => (
          <Link
            key={mod.id}
            href={`/modules/${mod.id}`}
            className="flex items-center justify-between gap-4 rounded-3xl border border-black/8 bg-white/90 p-5 backdrop-blur transition hover:border-teal-500/30 hover:shadow-lg"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-slate-950">{mod.name}</h3>
              <p className="mt-1 truncate text-sm text-slate-600">{mod.description}</p>
            </div>
            <Badge label={mod.visibility} />
          </Link>
        ))}
      </div>
    </div>
  );
}
