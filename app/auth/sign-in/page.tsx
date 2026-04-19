"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useT } from "@/lib/i18n/context";
import { Field, Feedback, fieldClassName, primaryButtonClassName, toMessage } from "@/app/_components/ui";

export default function SignInPage() {
  const router = useRouter();
  const t = useT();
  const [form, setForm] = useState({ email: "", password: "" });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setFeedback(t.auth_error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full rounded-3xl border border-black/8 bg-white/90 p-8 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">{t.auth_signIn}</h1>
        <Feedback message={feedback} />
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Field label={t.auth_email}>
            <input
              className={fieldClassName}
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Field>
          <Field label={t.auth_password}>
            <input
              className={fieldClassName}
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </Field>
          <button disabled={isSubmitting} className={`${primaryButtonClassName} w-full`} type="submit">
            {isSubmitting ? t.auth_signingIn : t.auth_signIn}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          {t.auth_noAccount}{" "}
          <Link href="/auth/sign-up" className="font-semibold text-teal-700 hover:underline">
            {t.auth_signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}
