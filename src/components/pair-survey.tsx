"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { submitPair } from "@/lib/actions";
import { copy, reasonPrompts } from "@/lib/copy";
import type { CurrentPair, Enjoyment, OriginChoice, ReasonTag, ReasonTags } from "@/lib/types";

type PairSurveyProps = {
  pair: CurrentPair;
  showTour: boolean;
};

type SiteTab = "a" | "b";

const emptyTags: ReasonTags = { enjoyment: [], familiarity: [], origin: [] };

export const PairSurvey = ({ pair, showTour }: PairSurveyProps) => {
  const text = copy[pair.locale];
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<SiteTab>("a");
  const [seen, setSeen] = useState<Set<SiteTab>>(() => new Set(["a"]));
  const [step, setStep] = useState(0);
  const [enjoyment, setEnjoyment] = useState<Enjoyment | "">("");
  const [leftScore, setLeftScore] = useState<number | null>(null);
  const [rightScore, setRightScore] = useState<number | null>(null);
  const [origin, setOrigin] = useState<OriginChoice | "">("");
  const [tags, setTags] = useState<ReasonTags>(emptyTags);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [hintKey, setHintKey] = useState<string | null>(null);
  const [tourStep, setTourStep] = useState<number | null>(showTour ? 0 : null);
  const [spot, setSpot] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const bothSeen = seen.has("a") && seen.has("b");
  const locked = step === 0 && !bothSeen;
  const questionNumber = step === 1 ? 2 : step === 2 ? 3 : 1;
  const nextDisabled =
    pending ||
    (step === 0 && (locked || enjoyment === "")) ||
    (step === 1 && (leftScore === null || rightScore === null)) ||
    (step === 2 && origin === "");

  const handleTab = (next: SiteTab) => {
    setTab(next);
    setSeen((current) => new Set(current).add(next));
  };

  const handleEnjoy = (value: Enjoyment) => {
    if (locked) {
      setHintKey(value);
      return;
    }
    setEnjoyment(value);
  };

  const handleToggleTag = (row: keyof ReasonTags, tag: ReasonTag) => {
    setTags((current) => {
      const list = current[row];
      const next = list.includes(tag) ? list.filter((item) => item !== tag) : [...list, tag];
      return { ...current, [row]: next };
    });
  };

  const handleNext = async () => {
    if (nextDisabled) return;
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (!enjoyment || leftScore === null || rightScore === null || !origin) return;
    setPending(true);
    setError("");
    const result = await submitPair({
      siteType: pair.siteType,
      enjoyment,
      familiarityLeft: leftScore,
      familiarityRight: rightScore,
      chineseModelSide: origin,
      reason: note,
      reasonTags: tags,
    });
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  };

  const handleFinishTour = () => {
    setTourStep(null);
    if (showTour) router.replace("/compare");
  };

  useEffect(() => {
    if (tourStep === null) return;
    const target = tourStep === 0 ? "switch" : tourStep === 1 ? "website" : "dock";
    const shell = shellRef.current;
    const node = shell?.querySelector(`[data-tour="${target}"]`);
    if (!shell || !(node instanceof HTMLElement)) return;
    const update = () => {
      const shellRect = shell.getBoundingClientRect();
      const rect = node.getBoundingClientRect();
      setSpot({
        top: rect.top - shellRect.top,
        left: rect.left - shellRect.left,
        width: rect.width,
        height: rect.height,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [tourStep, step]);

  const tourCardStyle = (): CSSProperties => {
    if (!spot || tourStep === null) return { visibility: "hidden" };
    if (tourStep === 0) {
      return {
        top: spot.top + spot.height + 16,
        left: spot.left + spot.width / 2,
        transform: "translateX(-50%)",
      };
    }
    if (tourStep === 1) {
      return {
        top: spot.top + spot.height / 2,
        left: spot.left + spot.width / 2,
        transform: "translate(-50%, -50%)",
      };
    }
    return {
      top: spot.top - 16,
      right: 34,
      left: "auto",
      transform: "translateY(-100%)",
    };
  };

  const progress = ((pair.pairIndex + 1) / pair.pairCount) * 100;

  return (
    <div className="study" ref={shellRef}>
      <div className="survey survey--dock survey--stacked">
        <header className="survey-header">
          <span className="top-instruction">{text.lookThenAnswer}</span>
          <div className="site-tabs" role="tablist" aria-label={text.lookThenAnswer} data-tour="switch">
            {(["a", "b"] as SiteTab[]).map((site) => (
              <button
                key={site}
                type="button"
                role="tab"
                aria-selected={tab === site}
                className={tab === site ? "site-tab is-active" : "site-tab"}
                onClick={() => handleTab(site)}
              >
                {site === "a" ? text.websiteA : text.websiteB}
              </button>
            ))}
          </div>
          <div className="progress">
            <span>{text.progress(pair.pairIndex + 1, pair.pairCount)}</span>
            <div className="progress-track">
              <i style={{ width: `${progress}%` }} />
            </div>
          </div>
        </header>
        <div className="preview-wrap" data-tour="website">
          <div className="preview-frame">
            <iframe
              title={text.websiteA}
              src={`/s/${pair.leftId}/`}
              className={tab === "a" ? "preview-site" : "preview-site is-hidden"}
              aria-hidden={tab !== "a"}
            />
            <iframe
              title={text.websiteB}
              src={`/s/${pair.rightId}/`}
              className={tab === "b" ? "preview-site" : "preview-site is-hidden"}
              aria-hidden={tab !== "b"}
            />
          </div>
        </div>
        {step === 3 && enjoyment && leftScore !== null && rightScore !== null && origin ? (
          <Reasons
            locale={pair.locale}
            enjoyment={enjoyment}
            leftScore={leftScore}
            rightScore={rightScore}
            origin={origin}
            tags={tags}
            note={note}
            pending={pending}
            error={error}
            onToggle={handleToggleTag}
            onNote={setNote}
            onNext={handleNext}
          />
        ) : (
          <section className="question question--dock question--stacked" data-tour="dock">
            <div className="question-heading">
              <div className="eyebrow">{text.questionOf(questionNumber)}</div>
              <div className="question-copy">
                {questionNumber === 1 ? text.enjoyQuestion : null}
                {questionNumber === 2 ? text.familiarity : null}
                {questionNumber === 3 ? text.origin : null}
              </div>
              <p className="helper">
                {questionNumber === 1 ? text.enjoyHelp : null}
                {questionNumber === 2 ? text.familiarHelp : null}
                {questionNumber === 3 ? text.originHelp : null}
              </p>
            </div>
            <div className="answer-column">
              {questionNumber === 1 ? (
                <div className="answer-zone">
                  <div className="primary-answers" role="radiogroup" aria-label={text.enjoyQuestion}>
                    {(
                      [
                        ["left", text.enjoyA],
                        ["both", text.enjoyBoth],
                        ["neither", text.enjoyNeither],
                        ["right", text.enjoyB],
                      ] as const
                    ).map(([value, label]) => (
                      <Choice
                        key={value}
                        label={label}
                        hint={text.lockedHint}
                        selected={enjoyment === value}
                        locked={locked}
                        hinted={hintKey === value}
                        onChoose={() => handleEnjoy(value)}
                        onLeave={() => setHintKey((current) => (current === value ? null : current))}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              {questionNumber === 1 ? (
                <div className="secondary-row">
                  <span className="or-label">{text.or}</span>
                  <Choice
                    label={text.tooDifferent}
                    hint={text.lockedHint}
                    selected={enjoyment === "too_different"}
                    locked={locked}
                    hinted={hintKey === "too_different"}
                    secondary
                    onChoose={() => handleEnjoy("too_different")}
                    onLeave={() => setHintKey((current) => (current === "too_different" ? null : current))}
                  />
                </div>
              ) : null}
              {questionNumber === 2 ? (
                <div className="ratings">
                  <Rating
                    label={text.websiteA}
                    value={leftScore}
                    low={text.notAtAll}
                    high={text.veryMuch}
                    onChange={setLeftScore}
                  />
                  <Rating
                    label={text.websiteB}
                    value={rightScore}
                    low={text.notAtAll}
                    high={text.veryMuch}
                    onChange={setRightScore}
                  />
                </div>
              ) : null}
              {questionNumber === 3 ? (
                <div className="origin-answers" role="radiogroup" aria-label={text.origin}>
                  <Choice label={text.websiteA} selected={origin === "left"} onChoose={() => setOrigin("left")} />
                  <Choice label={text.websiteB} selected={origin === "right"} onChoose={() => setOrigin("right")} />
                  <span className="or-label">{text.or}</span>
                  <Choice
                    label={text.cantDecide}
                    selected={origin === "unsure"}
                    secondary
                    onChoose={() => setOrigin("unsure")}
                  />
                </div>
              ) : null}
              <button type="button" className="next-button" disabled={nextDisabled} onClick={handleNext}>
                {pending ? text.saving : text.next}
                <span aria-hidden="true">→</span>
              </button>
            </div>
            {error ? (
              <p className="study-error" role="alert">
                {error}
              </p>
            ) : null}
          </section>
        )}
        {tourStep !== null ? (
          <div className="tour-layer">
            <div className="tour-scrim" />
            {spot ? (
              <div
                className="tour-ring"
                style={{
                  top: spot.top,
                  left: spot.left,
                  width: spot.width,
                  height: spot.height,
                  borderRadius: tourStep === 2 ? 0 : 12,
                }}
              />
            ) : null}
            <div className="tour-card" style={tourCardStyle()}>
              <div className="tour-count">{text.tourCount(tourStep + 1)}</div>
              <strong>{text.tourSteps[tourStep].title}</strong>
              <p>{text.tourSteps[tourStep].copy}</p>
              <div className="tour-actions">
                <button type="button" onClick={handleFinishTour}>
                  {text.tourSkip}
                </button>
                <button
                  type="button"
                  className="tour-next"
                  onClick={() => (tourStep === 2 ? handleFinishTour() : setTourStep(tourStep + 1))}
                >
                  {tourStep === 2 ? text.tourStart : text.tourNext} <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Choice = ({
  label,
  selected,
  locked = false,
  hinted = false,
  secondary = false,
  hint = "",
  onChoose,
  onLeave,
}: {
  label: string;
  selected: boolean;
  locked?: boolean;
  hinted?: boolean;
  secondary?: boolean;
  hint?: string;
  onChoose: () => void;
  onLeave?: () => void;
}) => {
  const className = [
    "answer",
    secondary ? "secondary-answer" : "",
    selected ? "is-selected" : "",
    locked ? "is-locked" : "",
    hinted ? "is-hint" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      role="radio"
      aria-checked={selected}
      aria-disabled={locked}
      onClick={onChoose}
      onMouseLeave={onLeave}
    >
      <span className="radio" />
      {label}
      {locked ? (
        <span className="locked-hint" role="tooltip">
          {hint}
        </span>
      ) : null}
    </button>
  );
};

const Rating = ({
  label,
  value,
  low,
  high,
  onChange,
}: {
  label: string;
  value: number | null;
  low: string;
  high: string;
  onChange: (value: number) => void;
}) => (
  <div className="rating-row">
    <strong>{label}</strong>
    <div className="scale-wrap">
      <span>{low}</span>
      <div className="scale" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={value === score}
            className={value === score ? "is-selected" : ""}
            onClick={() => onChange(score)}
          >
            {score}
          </button>
        ))}
      </div>
      <span>{high}</span>
    </div>
  </div>
);

const Reasons = ({
  locale,
  enjoyment,
  leftScore,
  rightScore,
  origin,
  tags,
  note,
  pending,
  error,
  onToggle,
  onNote,
  onNext,
}: {
  locale: CurrentPair["locale"];
  enjoyment: Enjoyment;
  leftScore: number;
  rightScore: number;
  origin: OriginChoice;
  tags: ReasonTags;
  note: string;
  pending: boolean;
  error: string;
  onToggle: (row: keyof ReasonTags, tag: ReasonTag) => void;
  onNote: (value: string) => void;
  onNext: () => void;
}) => {
  const text = copy[locale];
  const rows = reasonPrompts(locale, enjoyment, leftScore, rightScore, origin);

  return (
    <section className="question question--dock question--stacked reasons-dock" data-tour="dock">
      <div className="question-heading reasons-heading">
        <div className="eyebrow">{text.reasonsEyebrow}</div>
        <div className="question-copy">{text.reasonsTitle}</div>
        <p className="helper">{text.reasonsHelp}</p>
      </div>
      <div className="reason-rows">
        {rows.map((row) => (
          <div className="reason-row" key={row.id}>
            <div className="reason-context">
              <span>{row.reminder}</span>
              <strong>{row.prompt}</strong>
            </div>
            <div className="reason-tags">
              {text.reasonTags.map((tag) => {
                const selected = tags[row.id].includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={selected ? "is-selected" : ""}
                    aria-pressed={selected}
                    onClick={() => onToggle(row.id, tag.id)}
                  >
                    <span className="chip-checkbox" aria-hidden="true" />
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="reasons-footer">
        <label>
          <span>{text.reasonsNote}</span>
          <input
            value={note}
            placeholder={text.reasonsPlaceholder}
            onChange={(event) => onNote(event.target.value)}
          />
        </label>
        <button type="button" className="next-button" disabled={pending} onClick={onNext}>
          {pending ? text.saving : text.nextPair}
          <span aria-hidden="true">→</span>
        </button>
      </div>
      {error ? (
        <p className="study-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
};
