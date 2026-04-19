import Link from "next/link";

const features = [
  {
    title: "Moduli di studio",
    description: "Crea moduli collaborativi con contenuti, quiz e piani di studio. Condividi con il tuo team via inviti.",
    icon: "📚",
    href: "/modules",
  },
  {
    title: "Quiz AI",
    description: "Genera quiz personalizzati con l'intelligenza artificiale. Difficoltà adattiva e spiegazioni dettagliate.",
    icon: "🧠",
    href: "/quiz",
  },
  {
    title: "Piani di studio",
    description: "Pianifica lo studio giorno per giorno in base alla data d'esame, agli argomenti e al tempo disponibile.",
    icon: "📅",
    href: "/plans",
  },
  {
    title: "Collaborazione",
    description: "Invita colleghi come editor o viewer. Ogni modulo ha ruoli e permessi granulari.",
    icon: "🤝",
    href: "/modules",
  },
] as const;

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 py-16 sm:px-6 lg:px-10">
      {/* Hero */}
      <section className="flex flex-col items-center text-center">
        <span className="mb-6 inline-flex items-center rounded-full border border-black/10 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 backdrop-blur">
          Open Source &middot; MIT License
        </span>
        <h1 className="max-w-3xl text-5xl font-bold tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl">
          Preparati agli esami
          <br />
          <span className="text-[var(--accent)]">con l&apos;AI</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
          Artnemis genera quiz, piani di studio e ti aiuta a collaborare sui contenuti.
          Tutto in un&apos;unica piattaforma open-source.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Inizia ora
          </Link>
          <Link
            href="/modules"
            className="inline-flex items-center justify-center rounded-full border border-slate-900/15 bg-white/80 px-7 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-stone-100"
          >
            Esplora moduli
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mt-24 w-full">
        <h2 className="mb-10 text-center text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
          Tutto quello che serve per prepararti
        </h2>
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
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
          Pronto per studiare meglio?
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Nessun account richiesto per l&apos;MVP. Inizia subito.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          Vai alla dashboard
        </Link>
      </section>
    </div>
  );
}
