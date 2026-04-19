"use client";

import type { ReactNode } from "react";

/* ─────────── class constants ─────────── */

export const fieldClassName =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500";

export const primaryButtonClassName =
  "inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300";

export const secondaryButtonClassName =
  "inline-flex items-center justify-center rounded-full border border-slate-900/15 bg-stone-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-slate-400";

/* ─────────── components ─────────── */

export function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
      {label}
    </span>
  );
}

export function Panel({ children, subtitle, title }: { children: ReactNode; subtitle?: string; title: string }) {
  return (
    <section className="rounded-4xl border border-black/8 bg-white/90 p-5 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mb-4 space-y-1">
        <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">{title}</h2>
        {subtitle ? <p className="text-sm leading-6 text-slate-600">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/10 bg-stone-50 px-4 py-5 text-sm text-slate-500">
      {label}
    </div>
  );
}

export function Feedback({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-2xl border border-teal-900/10 bg-teal-50 px-4 py-3 text-sm text-teal-900">
      {message}
    </div>
  );
}

export function PageHeader({ children, subtitle, title }: { children?: ReactNode; subtitle?: string; title: string }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{title}</h1>
        {children}
      </div>
      {subtitle ? <p className="max-w-2xl text-sm leading-7 text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

export function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error.";
}
