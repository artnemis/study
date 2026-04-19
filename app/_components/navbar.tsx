"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useT } from "@/lib/i18n/context";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useT();

  if (pathname === "/coming-soon") {
    return null;
  }

  const links = [
    { href: "/dashboard", label: t.nav_dashboard },
    { href: "/modules", label: t.nav_modules },
    { href: "/quiz", label: t.nav_quiz },
    { href: "/plans", label: t.nav_plans },
    { href: "/profile", label: t.nav_profile },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/8 bg-white/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em] text-slate-950">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-sm text-white">
            A
          </span>
          Artnemis
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-teal-50 text-teal-900"
                      : "text-slate-600 hover:bg-stone-100 hover:text-slate-900"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            {session?.user ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-stone-100 hover:text-slate-900 transition"
              >
                {t.nav_signOut}
              </button>
            ) : (
              <Link
                href="/auth/sign-in"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
              >
                {t.nav_signIn}
              </Link>
            )}
          </li>
        </ul>

        {/* mobile menu */}
        <MobileMenu pathname={pathname} session={session} links={links} />
      </nav>
    </header>
  );
}

function MobileMenu({ pathname, session, links }: { pathname: string; session: ReturnType<typeof useSession>["data"]; links: { href: string; label: string }[] }) {
  const t = useT();

  return (
    <details className="relative md:hidden">
      <summary className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-black/10 bg-white text-slate-700">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </summary>
      <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-black/8 bg-white p-2 shadow-xl">
        {links.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-teal-50 text-teal-900" : "text-slate-600 hover:bg-stone-50"
              }`}
            >
              {label}
            </Link>
          );
        })}
        {session?.user ? (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-stone-50"
          >
            {t.nav_signOut}
          </button>
        ) : (
          <Link
            href="/auth/sign-in"
            className="block rounded-xl px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50"
          >
            {t.nav_signIn}
          </Link>
        )}
      </div>
    </details>
  );
}
