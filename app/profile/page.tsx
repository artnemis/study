"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { type FormEvent, useEffect, useState } from "react";
import { useLocale, useT } from "@/lib/i18n/context";
import { LOCALES, type Locale } from "@/lib/i18n/index";
import { Field, Feedback, PageHeader, Panel, fieldClassName, primaryButtonClassName, secondaryButtonClassName, toMessage } from "@/app/_components/ui";

const LOCALE_LABELS: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { locale, setLocale } = useLocale();
  const t = useT();

  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setHasKey(!!data.hasOpenaiKey);
        if (data.locale && LOCALES.includes(data.locale)) {
          setSelectedLocale(data.locale);
          setLocale(data.locale);
        }
      })
      .catch(() => {});
  }, [status, setLocale]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const body: Record<string, unknown> = { locale: selectedLocale };
      if (apiKey.trim()) {
        body.openaiApiKey = apiKey.trim();
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setFeedback(data.error ?? t.common_error);
        return;
      }

      const result = await res.json();
      setHasKey(!!result.hasOpenaiKey);
      setLocale(selectedLocale);
      if (apiKey.trim()) setApiKey("");
      setFeedback(t.profile_saved);
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function onRemoveKey() {
    setIsSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openaiApiKey: null }),
      });
      setHasKey(false);
      setApiKey("");
      setFeedback(t.profile_saved);
    } catch (error) {
      setFeedback(toMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center">
        <p className="text-sm text-slate-500">{t.common_loading}</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
        <PageHeader title={t.profile_title} subtitle={t.profile_subtitle} />
        <Panel title={t.auth_signIn} subtitle={t.common_signInRequired}>
          <Link href="/auth/sign-in" className={primaryButtonClassName}>
            {t.auth_signIn}
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <PageHeader title={t.profile_title} subtitle={t.profile_subtitle} />

      <Feedback message={feedback} />

      <form onSubmit={onSave} className="space-y-6">
        <Panel title={t.profile_title}>
          <div className="space-y-4">
            <Field label={t.profile_name}>
              <input className={fieldClassName} value={session.user.name ?? ""} disabled />
            </Field>
            <Field label={t.profile_email}>
              <input className={fieldClassName} value={session.user.email ?? ""} disabled />
            </Field>
            <Field label={t.profile_language}>
              <select
                className={fieldClassName}
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value as Locale)}
              >
                {LOCALES.map((loc) => (
                  <option key={loc} value={loc}>
                    {LOCALE_LABELS[loc]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Panel>

        <Panel title={t.profile_apiKey}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {hasKey ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-teal-500" />
                  {t.profile_keySet}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                  {t.profile_keyNotSet}
                </span>
              )}
            </p>
            <Field label={hasKey ? `${t.profile_apiKey} (${t.profile_removeKey.toLowerCase()})` : t.profile_apiKey}>
              <input
                className={fieldClassName}
                type="password"
                autoComplete="off"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t.profile_apiKeyPlaceholder}
              />
            </Field>
            <p className="text-xs text-slate-500">{t.profile_apiKeyHelp}</p>
            {hasKey ? (
              <button
                type="button"
                onClick={onRemoveKey}
                disabled={isSaving}
                className={secondaryButtonClassName}
              >
                {t.profile_removeKey}
              </button>
            ) : null}
          </div>
        </Panel>

        <button disabled={isSaving} className={`${primaryButtonClassName} w-full`} type="submit">
          {isSaving ? t.profile_saving : t.profile_save}
        </button>
      </form>
    </div>
  );
}
