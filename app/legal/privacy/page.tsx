import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Artnemis",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6 lg:px-10">
      <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">Privacy Policy</h1>
      <p className="text-sm text-slate-500">Last updated: July 2025</p>

      <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-950">1. Data Controller</h2>
          <p>
            Artnemis is an open-source project. When self-hosted, the data controller is the
            person or organisation operating the instance. This policy describes default behaviour.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-950">2. Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account data:</strong> email address and hashed password (bcrypt).</li>
            <li><strong>Study data:</strong> modules, quizzes, plans, and uploaded materials you create.</li>
            <li><strong>Technical data:</strong> server logs (IP, user-agent) retained for max 30 days.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-950">3. How We Use Data</h2>
          <p>
            Data is used exclusively to provide the study platform service: authentication,
            content storage, and AI-powered quiz/plan generation.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-950">4. Third-Party Services</h2>
          <p>
            When an OpenAI API key is configured, quiz and plan content is sent to OpenAI for
            generation. Refer to{" "}
            <a href="https://openai.com/policies/privacy-policy" className="text-teal-700 underline" target="_blank" rel="noopener noreferrer">
              OpenAI&apos;s Privacy Policy
            </a>{" "}
            for their data handling practices. No other third-party analytics or tracking services are used.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-950">5. Data Retention</h2>
          <p>
            Account and study data is retained as long as the account exists. Users may request
            deletion by contacting the instance administrator.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-950">6. Your Rights</h2>
          <p>
            Under GDPR (if applicable), you have the right to access, rectify, erase, restrict
            processing, and port your data. Contact the instance administrator to exercise these rights.
          </p>
        </section>
      </div>
    </div>
  );
}
