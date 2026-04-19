import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Artnemis",
};

export default function CookiesPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6 lg:px-10">
      <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">Cookie Policy</h1>
      <p className="text-sm text-slate-500">Last updated: July 2025</p>

      <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-950">1. What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website.
            They are widely used to make websites work more efficiently.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-950">2. Cookies We Use</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left">
                <th className="pb-2 pr-4 font-semibold text-slate-950">Name</th>
                <th className="pb-2 pr-4 font-semibold text-slate-950">Purpose</th>
                <th className="pb-2 font-semibold text-slate-950">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black/5">
                <td className="py-2 pr-4 font-mono text-xs">authjs.session-token</td>
                <td className="py-2 pr-4">Authentication session (JWT)</td>
                <td className="py-2">Session / 30 days</td>
              </tr>
              <tr className="border-b border-black/5">
                <td className="py-2 pr-4 font-mono text-xs">authjs.csrf-token</td>
                <td className="py-2 pr-4">CSRF protection</td>
                <td className="py-2">Session</td>
              </tr>
              <tr className="border-b border-black/5">
                <td className="py-2 pr-4 font-mono text-xs">artnemis-locale</td>
                <td className="py-2 pr-4">Language preference</td>
                <td className="py-2">1 year</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">artnemis-cookies</td>
                <td className="py-2 pr-4">Cookie consent status</td>
                <td className="py-2">1 year</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-950">3. Third-Party Cookies</h2>
          <p>
            Artnemis does <strong>not</strong> use any third-party analytics, advertising, or
            tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-950">4. Managing Cookies</h2>
          <p>
            You can control cookies through your browser settings. Note that disabling session
            cookies will prevent you from signing in.
          </p>
        </section>
      </div>
    </div>
  );
}
