"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSession } from "@/lib/actions";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/types";

export const LanguageChoice = () => {
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Locale | null>(null);

  const handleChoose = async (locale: Locale) => {
    setPending(locale);
    setError("");
    const result = await createSession(locale);
    if (result?.error) {
      setError(result.error);
      setPending(null);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-8">
        <h1 className="text-xl font-medium">{copy.en.chooseLanguage}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.zh.chooseLanguage}</p>
        <p className="mt-4 text-sm text-muted-foreground">{copy.en.intro}</p>
        <div className="mt-6 grid gap-3">
          <Button
            type="button"
            size="lg"
            disabled={pending !== null}
            onClick={() => handleChoose("en")}
          >
            {copy.en.english}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            disabled={pending !== null}
            onClick={() => handleChoose("zh")}
          >
            {copy.zh.chinese}
          </Button>
        </div>
        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  );
};
