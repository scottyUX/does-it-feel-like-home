import { StudyShell } from "@/components/study-shell";
import Link from "next/link";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/types";

type IntroductionProps = {
  locale: Locale;
  pairCount: number;
};

export const Introduction = ({ locale, pairCount }: IntroductionProps) => {
  const text = copy[locale];

  return (
    <StudyShell locale={locale}>
      <div className="static-page">
        <main className="intro-card">
          <header className="intro-heading">
            <span className="concept-kicker">{text.studyKicker}</span>
            <h1>{text.welcomeTitle}</h1>
            <p>{text.welcomeLead}</p>
            <p>{text.welcomeTask.replace("{count}", String(pairCount))}</p>
          </header>
          <section className="how-it-works">
            <h2>{text.howTitle}</h2>
            <ol>
              {text.howSteps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>
          <p className="opinion-note">{text.opinionNote}</p>
          <div className="study-details">
            <div>
              <span
                className="detail-icon detail-icon--clock"
                aria-hidden="true"
              />
              <span>{text.detailTime}</span>
            </div>
            <div>
              <span
                className="detail-icon detail-icon--screen"
                aria-hidden="true"
              />
              <span>{text.detailDevice}</span>
            </div>
            <div>
              <span
                className="detail-icon detail-icon--lock"
                aria-hidden="true"
              />
              <span>{text.detailAnonymous}</span>
            </div>
          </div>
          <div className="intro-action">
            <div>
              <p>{text.tourNote}</p>
              <small>{text.contact}</small>
            </div>
            <Link href="/compare?tour=1" className="next-button">
              {text.continue} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </main>
      </div>
    </StudyShell>
  );
};
