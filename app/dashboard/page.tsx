"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useModuleCatalog } from "@/hooks/useModuleCatalog";
import { useT } from "@/lib/i18n/context";
import { Badge, Metric, Panel } from "@/app/_components/ui";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const catalog = useModuleCatalog(userId);
  const t = useT();

  const quickActions = [
    { href: "/modules", label: t.dash_newModule, description: t.landing_feature1_desc, icon: "📚" },
    { href: "/quiz", label: t.dash_goQuiz, description: t.landing_feature2_desc, icon: "🧠" },
    { href: "/plans", label: t.dash_goPlan, description: t.landing_feature3_desc, icon: "📅" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{t.dash_title}</h1>
        <p className="text-sm text-slate-600">{t.dash_subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-black/8 bg-white/90 p-5 backdrop-blur">
          <Metric label={t.dash_totalModules} value={String(catalog.modules.length)} />
        </div>
        <div className="rounded-3xl border border-black/8 bg-white/90 p-5 backdrop-blur">
          <Metric label={t.dash_publicModules} value={String(catalog.modules.filter((m) => m.visibility === "public").length)} />
        </div>
        <div className="rounded-3xl border border-black/8 bg-white/90 p-5 backdrop-blur">
          <Metric label={t.dash_storage} value={catalog.storageMode ?? t.common_loading} />
        </div>
      </div>

      {/* Quick actions */}
      <section>
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
      <Panel title={t.nav_modules}>
        {catalog.isLoading ? (
          <p className="text-sm text-slate-500">{t.common_loading}</p>
        ) : catalog.modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-stone-50 px-4 py-8 text-center text-sm text-slate-500">
            {t.dash_noModules}{" "}
            <Link href="/modules" className="font-semibold text-teal-700 underline underline-offset-2">
              {t.dash_newModule}
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
                {t.dash_goModules} →
              </Link>
            ) : null}
          </div>
        )}
      </Panel>
    </div>
  );
}
