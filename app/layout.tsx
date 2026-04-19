import type { Metadata } from "next";
import { cookies } from "next/headers";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "./_components/navbar";
import { CookieBanner } from "./_components/cookie-banner";
import { AuthProvider } from "./_components/auth-provider";
import { LocaleProvider } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/index";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/index";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  description: "Open-source AI-powered exam preparation platform with collaborative modules, study plans, quizzes and invite-based workflows.",
  title: "Artnemis | AI Exam Preparation Engine",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read locale from request cookies to prevent hydration mismatch
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get("locale")?.value as Locale | undefined;
  const initialLocale = localeFromCookie && LOCALES.includes(localeFromCookie) ? localeFromCookie : DEFAULT_LOCALE;

  return (
    <html
      lang={initialLocale}
      className={`${spaceGrotesk.variable} ${plexMono.variable} h-full bg-[var(--canvas)] antialiased`}
    >
      <body className="min-h-full bg-[var(--canvas)] text-[var(--ink)] font-sans">
        <AuthProvider>
          <LocaleProvider initialLocale={initialLocale}>
            <div className="relative flex min-h-full flex-col overflow-hidden">
              <div className="pointer-events-none absolute inset-0 opacity-90">
                <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,#ffd786_0%,rgba(255,215,134,0)_70%)]" />
                <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,#8ddbd0_0%,rgba(141,219,208,0)_70%)]" />
                <div className="absolute bottom-[-8rem] left-1/3 h-96 w-96 rounded-full bg-[radial-gradient(circle,#d2ddff_0%,rgba(210,221,255,0)_70%)]" />
              </div>
              <Navbar />
              <main className="relative flex min-h-full flex-1">{children}</main>
              <footer className="relative border-t border-black/8 bg-white/40 backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6 lg:px-10">
                  <span>© {new Date().getFullYear()} Artnemis — MIT License</span>
                  <nav className="flex gap-4">
                    <a href="/legal/privacy" className="hover:text-teal-700 transition">Privacy</a>
                    <a href="/legal/terms" className="hover:text-teal-700 transition">Terms</a>
                    <a href="/legal/cookies" className="hover:text-teal-700 transition">Cookies</a>
                    <a href="https://github.com/artnemis/study" target="_blank" rel="noopener noreferrer" className="hover:text-teal-700 transition">GitHub</a>
                  </nav>
                </div>
              </footer>
              <CookieBanner />
            </div>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
