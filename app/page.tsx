"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/context";

export default function Home() {
  const t = useT();
  const titleWords = t.landing_title.split(" ");
  const highlightedWord = titleWords.at(-1) ?? t.landing_title;
  const titleLead = titleWords.slice(0, -1).join(" ");

  const features = [
    {
      title: t.landing_feature1_title,
      description: t.landing_feature1_desc,
      icon: "📚",
      href: "/modules",
    },
    {
      title: t.landing_feature2_title,
      description: t.landing_feature2_desc,
      icon: "🧠",
      href: "/quiz",
    },
    {
      title: t.landing_feature3_title,
      description: t.landing_feature3_desc,
      icon: "📅",
      href: "/plans",
    },
    {
      title: t.landing_feature4_title,
      description: t.landing_feature4_desc,
      icon: "🤝",
      href: "/modules",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 py-16 sm:px-6 lg:px-10">
      {/* Hero */}
      <section className="flex flex-col items-center text-center">
        <span className="mb-6 inline-flex items-center rounded-full border border-black/10 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 backdrop-blur">
          Open Source &middot; MIT License
        </span>
        <h1 className="max-w-3xl text-5xl font-bold tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl">
          {titleLead.length > 0 ? (
            <>
              {titleLead}
              <br />
            </>
          ) : null}
          <span className="text-(--accent)">{highlightedWord}</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
          {t.landing_subtitle}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            {t.landing_cta}
          </Link>
          <Link
            href="/modules"
            className="inline-flex items-center justify-center rounded-full border border-slate-900/15 bg-white/80 px-7 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-stone-100"
          >
            {t.nav_modules}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mt-24 w-full">
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-3xl border border-black/8 bg-white/90 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur transition hover:border-teal-500/30 hover:shadow-[0_16px_50px_rgba(15,139,141,0.1)]"
            >
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-slate-950 group-hover:text-teal-800">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-24 flex flex-col items-center text-center">
        <Link
          href="/auth/sign-up"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          {t.landing_cta}
        </Link>
      </section>
    </div>
  );
}
