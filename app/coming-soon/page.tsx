import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <section className="relative flex min-h-full flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,139,141,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(246,176,66,0.16),transparent_24%)]" />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-4xl border border-black/8 bg-(--panel) p-8 shadow-[0_30px_80px_rgba(18,38,35,0.12)] backdrop-blur sm:p-12">
        <div className="inline-flex rounded-full border border-(--line) bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-(--muted)">
          Launch Gate Enabled
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-(--accent)">Artnemis</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-6xl">
              We are shaping the public release.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-(--muted) sm:text-lg">
              The platform is temporarily hidden while we finalize the launch experience, authentication flow,
              and onboarding path.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-black/8 bg-white/80 p-6 shadow-[0_18px_40px_rgba(18,38,35,0.08)]">
            <p className="text-sm font-medium text-(--muted)">Current status</p>
            <ul className="mt-4 space-y-3 text-sm text-foreground">
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-(--accent)" />
                Core study workflows ready
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-(--accent)" />
                Authentication and profiles live
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-(--warm)" />
                Public access reopening soon
              </li>
            </ul>
            <div className="mt-6 rounded-2xl bg-(--accent-soft) px-4 py-3 text-sm text-foreground">
              Disable <strong>COMING_SOON_ENABLED</strong> to restore the full application.
            </div>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-stone-100"
            >
              Retry homepage
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}