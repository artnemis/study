"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/context";

export function CookieBanner() {
  const t = useT();
  // Always show banner initially (SSR + client hydration)
  // useEffect will hide it if consent cookie exists
  const [visible, setVisible] = useState(true);

  // Check consent after hydration (deferred to avoid setState in effect warning)
  useEffect(() => {
    const hasConsent = document.cookie.split("; ").some((c) => c.startsWith("artnemis-cookies="));
    if (hasConsent) {
      // Defer setState to next event loop iteration
      setTimeout(() => setVisible(false), 0);
    }
  }, []);

  if (!visible) return null;

  function accept() {
    document.cookie = "artnemis-cookies=accepted; path=/; max-age=31536000; SameSite=Lax";
    setVisible(false);
  }

  function decline() {
    document.cookie = "artnemis-cookies=declined; path=/; max-age=31536000; SameSite=Lax";
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/8 bg-white/95 p-4 shadow-lg backdrop-blur-xl sm:flex sm:items-center sm:justify-between sm:px-8">
      <p className="text-sm text-slate-600">
        {t.legal_cookieBanner}{" "}
        <Link href="/legal/cookies" className="font-medium text-teal-700 underline">
          {t.legal_cookies}
        </Link>
      </p>
      <div className="mt-3 flex gap-2 sm:mt-0">
        <button
          type="button"
          onClick={decline}
          className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-stone-100"
        >
          {t.legal_cookieDecline}
        </button>
        <button
          type="button"
          onClick={accept}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
        >
          {t.legal_cookieAccept}
        </button>
      </div>
    </div>
  );
}
