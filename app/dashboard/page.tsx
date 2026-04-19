"use client";

import Link from "next/link";
import { useModuleCatalog } from "@/hooks/useModuleCatalog";
import { Badge, Metric, Panel } from "@/app/_components/ui";

const quickActions = [
  { href: "/modules", label: "Crea modulo", description: "Nuovo modulo di studio collaborativo", icon: "📚" },
  { href: "/quiz", label: "Genera quiz", description: "Quiz AI su qualsiasi argomento", icon: "🧠" },
  { href: "/plans", label: "Piano di studio", description: "Calendario personalizzato per l'esame", icon: "📅" },
] as const;

export default function DashboardPage() {
  const catalog = useModuleCatalog("demo-owner");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">Dashboard</h1>
        <p className="text-sm text-slate-600">Panoramica del tuo spazio di studio.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-black/8 bg-white/90 p-5 backdrop-blur">
          <Metric label="Moduli totali" value={String(catalog.modules.length)} />
        </div>
        <div className="rounded-3xl border border-black/8 bg-white/90 p-5 backdrop-blur">
          <Metric label="Moduli pubblici" value={String(catalog.modules.filter((m) => m.visibility === "public").length)} />
        </div>
        <div className="rounded-3xl border border-black/8 bg-white/90 p-5 backdrop-blur">
          <Metric label="Storage" value={catalog.storageMode ?? "loading..."} />
        </div>
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Azioni rapide</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-3xl border border-black/8 bg-white/90 p-5 backdrop-blur transition hover:border-teal-500/30 hover:shadow-lg"
            >
              <div className="mb-3 text-2xl">{action.icon}</div>
              <h3 className="font-semibold text-slate-950 group-hover:text-teal-800">{action.label}</h3>
              <p className="mt-1 text-sm text-slate-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent modules */}
      <Panel title="Moduli recenti" subtitle="Gli ultimi moduli nel tuo catalogo.">
        {catalog.isLoading ? (
          <p className="text-sm text-slate-500">Caricamento...</p>
        ) : catalog.modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-stone-50 px-4 py-8 text-center text-sm text-slate-500">
            Nessun modulo ancora.{" "}
            <Link href="/modules" className="font-semibold text-teal-700 underline underline-offset-2">
              Creane uno
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {catalog.modules.slice(0, 5).map((mod) => (
              <Link
                key={mod.id}
                href={`/modules/${mod.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-black/8 bg-white px-4 py-3 transition hover:border-teal-500/30 hover:bg-stone-50"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-slate-950">{mod.name}</h3>
                  <p className="mt-0.5 truncate text-sm text-slate-600">{mod.description}</p>
                </div>
                <Badge label={mod.visibility} />
              </Link>
            ))}
            {catalog.modules.length > 5 ? (
              <Link href="/modules" className="block text-center text-sm font-semibold text-teal-700 hover:underline">
                Vedi tutti i moduli →
              </Link>
            ) : null}
          </div>
        )}
      </Panel>
    </div>
  );
}
