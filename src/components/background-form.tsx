"use client";

import { useState } from "react";
import { submitBackground } from "@/lib/actions";
import {
  backgroundIsComplete,
  backgroundQuestions,
  type BackgroundAnswers,
} from "@/lib/background";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/types";

const emptyAnswers: BackgroundAnswers = {
  age: "",
  gender: "",
  born: "",
  bornSpecify: "",
  grewUp: "",
  grewUpSpecify: "",
  livesNow: "",
  livesSpecify: "",
  yearsOutside: "",
  firstLanguage: "",
  languageSpecify: "",
  chineseWebUse: "",
  designExperience: "",
};

type BackgroundFormProps = {
  locale: Locale;
};

export const BackgroundForm = ({ locale }: BackgroundFormProps) => {
  const text = copy[locale];
  const [answers, setAnswers] = useState<BackgroundAnswers>(emptyAnswers);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const ready = backgroundIsComplete(locale, answers);

  const handleChange = (key: keyof BackgroundAnswers, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!ready || pending) return;
    setPending(true);
    setError("");
    const result = await submitBackground(answers);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  };

  return (
    <div className="study">
      <div className="background-page">
        <main className="background-form">
          <header className="background-heading">
            <span className="concept-kicker">{text.backgroundKicker}</span>
            <h1>{text.backgroundTitle}</h1>
            <p>{text.backgroundHelp}</p>
          </header>
          <div className="background-questions">
            {backgroundQuestions(locale).map((question, index) => {
              const titleId = `${question.id}-title`;
              return (
                <section className="background-question" key={question.id}>
                  <div className="background-question-title" id={titleId}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{question.prompt.replace(/（可选）|\(optional\)/i, "").trim()}</strong>
                    {question.optional ? <small>{text.optional}</small> : null}
                  </div>
                  <div className="background-options" role="radiogroup" aria-labelledby={titleId}>
                    {question.options.map((option) => {
                      const selected = answers[question.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={selected ? "answer is-selected" : "answer"}
                          role="radio"
                          aria-checked={selected}
                          onClick={() => handleChange(question.id, option.value)}
                        >
                          <span className="radio" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  {question.specifyKey && answers[question.id] === "other" ? (
                    <input
                      className="other-input"
                      id={`${question.id}-specify`}
                      aria-label={text.specify}
                      placeholder={text.specify}
                      value={answers[question.specifyKey]}
                      onChange={(event) => handleChange(question.specifyKey!, event.target.value)}
                    />
                  ) : null}
                </section>
              );
            })}
          </div>
          {error ? (
            <p className="study-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="background-submit">
            <span>{ready ? text.readyStatus : text.requiredStatus}</span>
            <button type="button" className="next-button" disabled={!ready || pending} onClick={handleSubmit}>
              {pending ? text.saving : text.submit} <span aria-hidden="true">→</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
