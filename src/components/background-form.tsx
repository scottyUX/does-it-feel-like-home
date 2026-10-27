"use client";
import { StudyShell } from "@/components/study-shell";

import { useEffect, useRef, useState } from "react";
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
  sessionId: string;
};

export const BackgroundForm = ({ locale, sessionId }: BackgroundFormProps) => {
  const text = copy[locale];
  const [answers, setAnswers] = useState<BackgroundAnswers>(emptyAnswers);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [missing, setMissing] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const latest = useRef(answers);
  const storageKey = `diflh:background:${sessionId}`;
  useEffect(() => {
    latest.current = answers;
  }, [answers]);
  useEffect(() => {
    let active = true;
    void (async () => {
      let draft;
      try {
        draft = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      } catch {}
      if (!draft)
        try {
          const response = await fetch("/api/study");
          draft = (await response.json()).background;
        } catch {}
      if (active) {
        if (draft) setAnswers({ ...emptyAnswers, ...draft });
        setRestored(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [storageKey]);
  useEffect(() => {
    if (!restored) return;
    const save = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(latest.current));
      } catch {}
    };
    const timer = setInterval(() => {
      save();
      void fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ background: latest.current }),
      }).catch(() => {});
    }, 3000);
    const hide = () => {
      save();
      navigator.sendBeacon(
        "/api/study",
        new Blob(
          [JSON.stringify({ background: latest.current, leaving: true })],
          { type: "application/json" },
        ),
      );
    };
    const leave = (event: BeforeUnloadEvent) => {
      save();
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("pagehide", hide);
    window.addEventListener("beforeunload", leave);
    return () => {
      save();
      clearInterval(timer);
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("beforeunload", leave);
    };
  }, [restored, storageKey]);
  const ready = backgroundIsComplete(locale, answers);

  const handleChange = (key: keyof BackgroundAnswers, value: string) => {
    setMissing(null);
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    if (pending) return;
    if (!ready) {
      const question = backgroundQuestions(locale).find(
        (q) =>
          !q.optional &&
          (!answers[q.id] ||
            (q.specifyKey &&
              answers[q.id] === "other" &&
              !answers[q.specifyKey].trim())),
      );
      if (question) {
        setMissing(question.id);
        const node = document.getElementById(`question-${question.id}`);
        node?.scrollIntoView({ behavior: "smooth", block: "center" });
        node
          ?.querySelector<HTMLElement>("button,input")
          ?.focus({ preventScroll: true });
      }
      return;
    }
    setPending(true);
    setError("");
    const result = await submitBackground(answers);
    if (result?.error) {
      setError(text.storeUnavailable);
      setPending(false);
    }
  };

  return (
    <StudyShell locale={locale}>
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
                <section
                  className={`background-question${missing === question.id ? " is-missing" : ""}`}
                  id={`question-${question.id}`}
                  key={question.id}
                >
                  <div className="background-question-title" id={titleId}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>
                      {question.prompt
                        .replace(/（可选）|\(optional\)/i, "")
                        .trim()}
                    </strong>
                    {question.optional ? <small>{text.optional}</small> : null}
                  </div>
                  <div
                    className="background-options"
                    role="radiogroup"
                    aria-labelledby={titleId}
                  >
                    {question.options.map((option) => {
                      const selected = answers[question.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={!restored || pending}
                          className={selected ? "answer is-selected" : "answer"}
                          role="radio"
                          aria-checked={selected}
                          onClick={() =>
                            handleChange(question.id, option.value)
                          }
                        >
                          <span className="radio" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  {question.specifyKey && answers[question.id] === "other" ? (
                    <input
                      disabled={!restored || pending}
                      maxLength={500}
                      required
                      className="other-input"
                      id={`${question.id}-specify`}
                      aria-label={text.specify}
                      placeholder={text.specify}
                      value={answers[question.specifyKey]}
                      onChange={(event) =>
                        handleChange(question.specifyKey!, event.target.value)
                      }
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
            <button
              type="button"
              className="next-button"
              disabled={!restored || pending}
              aria-disabled={!ready || pending}
              onClick={handleSubmit}
            >
              {pending ? text.saving : text.submit}{" "}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </main>
      </div>
    </StudyShell>
  );
};
