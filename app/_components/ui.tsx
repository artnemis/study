"use client";

import type { ReactNode } from "react";

/* ─────────── class constants ─────────── */

export const fieldClassName =
  "w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--subtle)] focus:border-[var(--accent)] focus:shadow-[var(--focus-ring)]";

export const primaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40";

export const secondaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40";

export const dangerButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[var(--error)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40";

export const ghostButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] transition hover:bg-[var(--surface-hover)]";

/* ─────────── components ─────────── */

export function Badge({ label, variant = "default" }: { label: string; variant?: "default" | "success" | "warning" | "error" | "info" }) {
  const colors = {
    default: "border-[var(--line)] bg-white/80 text-[var(--ink-secondary)]",
    success: "border-green-200 bg-[var(--success-soft)] text-green-800",
    warning: "border-amber-200 bg-[var(--warning-soft)] text-amber-800",
    error: "border-red-200 bg-[var(--error-soft)] text-red-800",
    info: "border-blue-200 bg-[var(--info-soft)] text-blue-800",
  };
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${colors[variant]}`}>
      {label}
    </span>
  );
}

export function Panel({ children, subtitle, title }: { children: ReactNode; subtitle?: string; title: string }) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel-solid)] p-5 shadow-[var(--shadow-md)]">
      <div className="mb-4 space-y-1">
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-[var(--ink)]">{title}</h2>
        {subtitle ? <p className="text-sm leading-6 text-[var(--muted)]">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Field({ children, hint, label }: { children: ReactNode; hint?: string; label: string }) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-[var(--ink-secondary)]">
      <span>{label}</span>
      {children}
      {hint ? <p className="text-xs text-[var(--muted)]">{hint}</p> : null}
    </label>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="mt-1.5 truncate text-lg font-semibold text-[var(--ink)]">{value}</p>
    </div>
  );
}

export function EmptyState({ action, icon, label }: { action?: ReactNode; icon?: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-hover)] px-6 py-10 text-center">
      {icon ? <div className="mb-3 text-[var(--subtle)]">{icon}</div> : null}
      <p className="text-sm text-[var(--muted)]">{label}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Feedback({ message, variant = "info" }: { message: string | null; variant?: "success" | "error" | "warning" | "info" }) {
  if (!message) return null;
  const colors = {
    success: "border-green-200 bg-[var(--success-soft)] text-green-800",
    error: "border-red-200 bg-[var(--error-soft)] text-red-800",
    warning: "border-amber-200 bg-[var(--warning-soft)] text-amber-800",
    info: "border-teal-200 bg-[var(--accent-soft)] text-teal-900",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${colors[variant]}`}>
      {message}
    </div>
  );
}

export function PageHeader({ children, subtitle, title }: { children?: ReactNode; subtitle?: string; title: string }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)] sm:text-4xl">{title}</h1>
        {children}
      </div>
      {subtitle ? <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">{subtitle}</p> : null}
    </div>
  );
}

/* ─────────── Accordion ─────────── */

export function Accordion({ children, defaultOpen, subtitle, title }: { children: ReactNode; defaultOpen?: boolean; subtitle?: string; title: string }) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-[var(--line)] bg-white">
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-[var(--ink)]">
        <div>
          <span>{title}</span>
          {subtitle ? <span className="ml-3 text-xs font-normal text-[var(--muted)]">{subtitle}</span> : null}
        </div>
        <svg className="accordion-chevron h-4 w-4 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
      </summary>
      <div className="border-t border-[var(--line)] px-5 py-4">
        {children}
      </div>
    </details>
  );
}

/* ─────────── ProgressBar ─────────── */

export function ProgressBar({ label, max, value }: { label?: string; max: number; value: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      {label ? (
        <div className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-active)]">
        <div className="progress-bar h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ─────────── Tabs ─────────── */

export function Tabs({ activeTab, onTabChange, tabs }: { activeTab: string; onTabChange: (tab: string) => void; tabs: { id: string; label: string }[] }) {
  return (
    <div className="flex gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface-hover)] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === tab.id
              ? "bg-white text-[var(--ink)] shadow-[var(--shadow-sm)]"
              : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────── StatusDot ─────────── */

export function StatusDot({ status }: { status: "success" | "warning" | "error" | "neutral" }) {
  const colors = {
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    error: "bg-[var(--error)]",
    neutral: "bg-[var(--subtle)]",
  };
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors[status]}`} />;
}

/* ─────────── Footer ─────────── */

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-white/50 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-[var(--muted)] sm:px-6 lg:px-10">
        <p>© {new Date().getFullYear()} Artnemis — MIT License</p>
        <nav className="flex gap-5">
          <a href="/legal/privacy" className="hover:text-[var(--ink)] transition">Privacy</a>
          <a href="/legal/terms" className="hover:text-[var(--ink)] transition">Terms</a>
          <a href="/legal/cookies" className="hover:text-[var(--ink)] transition">Cookies</a>
        </nav>
      </div>
    </footer>
  );
}

/* ─────────── CostEstimate ─────────── */

export function CostEstimate({ estimatedTokens }: { estimatedTokens: number }) {
  const costPer1k = 0.00015; // gpt-4.1-mini input
  const estimated = (estimatedTokens / 1000) * costPer1k;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--info-soft)] px-3 py-2 text-xs text-blue-800">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
      <span>~{estimatedTokens.toLocaleString()} tokens · ~${estimated.toFixed(4)} estimated cost</span>
    </div>
  );
}

export function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error.";
}
