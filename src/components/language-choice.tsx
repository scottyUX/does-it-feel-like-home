"use client";

import { useState } from "react";
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
    <div className="study">
      <div className="static-page">
        <main className="language-card">
          <span className="concept-kicker">{copy.en.studyKicker}</span>
          <h1>{copy.en.chooseLanguage}</h1>
          <p>{copy.zh.chooseLanguage}</p>
          <p>{copy.en.intro}</p>
          <div className="language-actions">
            <button
              type="button"
              className="next-button"
              disabled={pending !== null}
              onClick={() => handleChoose("en")}
            >
              {copy.en.english}
              <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className="next-button next-button--secondary"
              disabled={pending !== null}
              onClick={() => handleChoose("zh")}
            >
              {copy.zh.chinese}
              <span aria-hidden="true">→</span>
            </button>
          </div>
          {error ? (
            <p className="study-error" role="alert">
              {error}
            </p>
          ) : null}
        </main>
      </div>
    </div>
  );
};
