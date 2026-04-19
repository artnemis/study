"use client";

import Link from "next/link";
import { type FormEvent, startTransition, useDeferredValue, useState } from "react";
import { createModuleApi } from "@/app/_lib/api-client";
import { useModuleCatalog } from "@/hooks/useModuleCatalog";
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
  const [requesterId] = useState("demo-owner");
  const catalog = useModuleCatalog(requesterId);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    ownerId: "demo-owner",
    visibility: "public" as "public" | "private",
  });

  const filtered = catalog.modules.filter((m) => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return true;
    return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
  });

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createModuleApi(form);
      setForm({ name: "", description: "", ownerId: form.ownerId, visibility: "public" });
      setFeedback(`Modulo creato: ${result.module.name}`);
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
      <PageHeader title="Moduli" subtitle="Esplora, cerca e crea moduli di studio.">
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className={primaryButtonClassName}
        >
          {showCreate ? "Chiudi" : "+ Nuovo modulo"}
        </button>
      </PageHeader>

      <Feedback message={feedback} />

      {showCreate ? (
        <Panel title="Crea modulo">
          <form className="space-y-3" onSubmit={onCreate}>
            <Field label="Nome">
              <input className={fieldClassName} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Analisi Orale Crash Pack" />
            </Field>
            <Field label="Descrizione">
              <textarea className={`${fieldClassName} min-h-20 resize-y`} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Argomenti, angolo d'esame e ambito" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Owner id">
                <input className={fieldClassName} value={form.ownerId} onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))} />
              </Field>
              <Field label="Visibilità">
                <select className={fieldClassName} value={form.visibility} onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value as "public" | "private" }))}>
                  <option value="public">Pubblico</option>
                  <option value="private">Privato</option>
                </select>
              </Field>
            </div>
            <button disabled={isSubmitting} className={primaryButtonClassName} type="submit">
              Crea modulo
            </button>
          </form>
        </Panel>
      ) : null}

      {/* Search */}
      <input
        className={fieldClassName}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Cerca per nome o descrizione..."
      />

      {/* Module list */}
      <div className="space-y-3">
        {catalog.isLoading ? <EmptyState label="Caricamento moduli..." /> : null}
        {!catalog.isLoading && filtered.length === 0 ? <EmptyState label="Nessun modulo trovato." /> : null}
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
