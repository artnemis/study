import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "./_components/navbar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${spaceGrotesk.variable} ${plexMono.variable} h-full bg-[var(--canvas)] antialiased`}
    >
      <body className="min-h-full bg-[var(--canvas)] text-[var(--ink)] font-sans">
        <div className="relative flex min-h-full flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-90">
            <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,#ffd786_0%,rgba(255,215,134,0)_70%)]" />
            <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,#8ddbd0_0%,rgba(141,219,208,0)_70%)]" />
            <div className="absolute bottom-[-8rem] left-1/3 h-96 w-96 rounded-full bg-[radial-gradient(circle,#d2ddff_0%,rgba(210,221,255,0)_70%)]" />
          </div>
          <Navbar />
          <main className="relative flex min-h-full flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
