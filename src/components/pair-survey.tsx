"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { StudyShell } from "@/components/study-shell";
import { WebsiteAnnotations } from "@/components/website-annotations";
import { usePairDraft } from "@/hooks/use-pair-draft";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { submitPair } from "@/lib/actions";
import { copy, reasonPrompts } from "@/lib/copy";
import type {
  CurrentPair,
  Enjoyment,
  OriginChoice,
  ReasonTag,
  ReasonTags,
  ReasonOther,
  WebsiteSide,
  WebsiteMark,
  PairDraft,
} from "@/lib/types";

type PairSurveyProps = {
  pair: CurrentPair;
  showTour: boolean;
};

type SiteTab = "a" | "b";

export const PairSurvey = ({ pair, showTour }: PairSurveyProps) => {
  const text = copy[pair.locale];
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<SiteTab>("a");
  const [tourStep, setTourStep] = useState<number | null>(showTour ? 0 : null);
  const [loaded, setLoaded] = useState({ a: false, b: false });
  const { state, setState, ready, saveError, clearDraft } = usePairDraft(
    pair,
    tab,
    tourStep !== null && !pair.tourDone,
    loaded[tab],
  );
  const {
    step,
    enjoyment,
    leftScore,
    rightScore,
    origin,
    tags,
    other,
    note,
    metrics,
    marks,
  } = state;
  const setStep = (step: number) =>
    setState((previous) => ({ ...previous, step }));
  const recordAnswer = (values: Partial<PairDraft>, index: number) => {
    setState((previous) => {
      const answerTimes = [...previous.metrics.answerTimes];
      answerTimes[index] =
        previous.metrics.viewingMs.a + previous.metrics.viewingMs.b;
      return {
        ...previous,
        ...values,
        metrics: { ...previous.metrics, answerTimes },
      };
    });
  };
  const setEnjoyment = (enjoyment: Enjoyment) => recordAnswer({ enjoyment }, 0);
  const setLeftScore = (leftScore: number) => recordAnswer({ leftScore }, 1);
  const setRightScore = (rightScore: number) => recordAnswer({ rightScore }, 1);
  const setOrigin = (origin: OriginChoice) => recordAnswer({ origin }, 2);
  const setNote = (note: string) =>
    setState((previous) => ({ ...previous, note }));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [hintKey, setHintKey] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const frames = useRef<Record<WebsiteSide, HTMLIFrameElement | null>>({
    a: null,
    b: null,
  });
  const [failed, setFailed] = useState({ a: false, b: false });
  const [spot, setSpot] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const bothSeen = state.seen.includes("a") && state.seen.includes("b");
  const locked =
    step === 0 &&
    (!bothSeen || metrics.viewingMs.a < 5000 || metrics.viewingMs.b < 5000);
  const lockedHint = bothSeen ? text.timedHint : text.lockedHint;
  const questionNumber = step === 1 ? 2 : step === 2 ? 3 : 1;
  const nextDisabled =
    pending ||
    (step === 0 && (locked || enjoyment === "")) ||
    (step === 1 && (leftScore === null || rightScore === null)) ||
    (step === 2 && origin === "");

  const handleTab = (next: SiteTab) => {
    setTab(next);
    if (next !== tab)
      setState((previous) => ({
        ...previous,
        seen: [...new Set([...previous.seen, next])],
        metrics: {
          ...previous.metrics,
          tabSwitches: previous.metrics.tabSwitches + 1,
        },
      }));
  };

  const handleEnjoy = (value: Enjoyment) => {
    if (locked) {
      setHintKey(value);
      return;
    }
    setEnjoyment(value);
  };

  const handleToggleTag = (row: keyof ReasonTags, tag: ReasonTag) => {
    setState((previous) => {
      const current = previous.tags;
      const list = current[row];
      const next = list.includes(tag)
        ? list.filter((item) => item !== tag)
        : [...list, tag];
      return { ...previous, tags: { ...current, [row]: next } };
    });
  };

  const handleNext = async () => {
    if (nextDisabled) return;
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (!enjoyment || leftScore === null || rightScore === null || !origin)
      return;
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
      reasonOther: other,
      metrics,
      marks,
    });
    if (result?.error) {
      setError(result.error === copy.en.timedHint ? text.timedHint : text.storeUnavailable);
      setPending(false);
    } else {
      clearDraft();
    }
  };

  const handleFinishTour = (skipped = true) => {
    setState((previous) => ({ ...previous, tourDone: true }));
    void fetch("/api/study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metadata: {
          tourDone: true,
          tourSkipped: skipped,
          screen: { width: innerWidth, height: innerHeight },
          browser: navigator.userAgent,
        },
      }),
    });
    setTourStep(null);
    if (showTour) router.replace("/compare");
  };

  useEffect(() => {
    if (tourStep === null) return;
    const target =
      tourStep === 0 ? "switch" : tourStep === 1 ? "website" : "dock";
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

  useEffect(() => {
    if (!ready) return;
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.data?.kind !== "study:page")
        return;
      const side =
        event.source === frames.current.a?.contentWindow
          ? "a"
          : event.source === frames.current.b?.contentWindow
            ? "b"
            : null;
      if (
        !side ||
        typeof event.data.page !== "string" ||
        !event.data.page.startsWith(
          `/s/${side === "a" ? pair.leftId : pair.rightId}`,
        )
      )
        return;
      setLoaded((previous) => ({ ...previous, [side]: true }));
      setFailed((previous) => ({ ...previous, [side]: false }));
      setState((previous) => ({
        ...previous,
        metrics: {
          ...previous.metrics,
          currentPage: {
            ...previous.metrics.currentPage,
            [side]: event.data.page,
          },
          pages: {
            ...previous.metrics.pages,
            [side]: [
              ...new Set([...previous.metrics.pages[side], event.data.page]),
            ].slice(0, 200),
          },
          scroll: {
            ...previous.metrics.scroll,
            [side]: {
              x: Number(event.data.x) || 0,
              y: Number(event.data.y) || 0,
            },
          },
          brokenImages: {
            ...previous.metrics.brokenImages,
            [event.data.page]: Math.max(
              0,
              Number(event.data.brokenImages) || 0,
            ),
          },
        },
      }));
    };
    window.addEventListener("message", receive);
    const beforeBack = () => {
      if (!window.confirm(text.leave)) history.forward();
    };
    window.addEventListener("popstate", beforeBack);
    return () => {
      window.removeEventListener("message", receive);
      window.removeEventListener("popstate", beforeBack);
    };
  }, [ready, pair.leftId, pair.rightId, setState, text.leave]);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      (["a", "b"] as const).forEach((side) => {
        if (loaded[side]) return;
        setFailed((previous) => ({ ...previous, [side]: true }));
        setState((previous) => ({
          ...previous,
          metrics: {
            ...previous.metrics,
            loadFailures: [
              ...previous.metrics.loadFailures,
              {
                side,
                page: `/s/${side === "a" ? pair.leftId : pair.rightId}/`,
                at: new Date().toISOString(),
              },
            ].slice(-100),
          },
        }));
      });
    }, 15000);
    return () => clearTimeout(timer);
  }, [ready, loaded, pair.leftId, pair.rightId, setState]);
  const progress = ((pair.pairIndex + 1) / pair.pairCount) * 100;

  return (
    <StudyShell locale={pair.locale} shellRef={shellRef}>
      <div
        className={`survey survey--dock survey--stacked${marking ? " is-marking" : ""}`}
      >
        <header className="survey-header">
          <span className="top-instruction">{text.lookThenAnswer}</span>
          <div
            className="site-tabs"
            role="tablist"
            aria-label={text.lookThenAnswer}
            data-tour="switch"
          >
            {(["a", "b"] as SiteTab[]).map((site) => (
              <button
                key={site}
                type="button"
                role="tab"
                disabled={!ready}
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
        {marking ? (
          <WebsiteAnnotations
            locale={pair.locale}
            side={tab}
            frames={frames}
            existing={marks}
            onCancel={() => setMarking(false)}
            onDone={(newMarks) => {
              setState((previous) => ({
                ...previous,
                marks: [...previous.marks, ...newMarks],
              }));
              setMarking(false);
            }}
          />
        ) : null}
        <div className="preview-wrap" data-tour="website">
          <div className="preview-frame">
            {ready
              ? (["a", "b"] as const).map((side) => (
                  <WebsiteFrame
                    key={side}
                    frameRef={(node) => {
                      frames.current[side] = node;
                    }}
                    title={side === "a" ? text.websiteA : text.websiteB}
                    src={
                      state.metrics.currentPage?.[side] ||
                      `/s/${side === "a" ? pair.leftId : pair.rightId}/`
                    }
                    className={
                      tab === side ? "preview-site" : "preview-site is-hidden"
                    }
                    hidden={tab !== side}
                    onLoad={(event) => {
                      event.currentTarget.contentWindow?.postMessage(
                        { kind: "study:scroll", ...state.metrics.scroll[side] },
                        location.origin,
                      );
                    }}
                  />
                ))
              : null}
            {!ready || !loaded[tab] || failed[tab] ? (
              <div className="website-loading" role="status">
                <p>{failed[tab] ? text.loadFailed : text.loading}</p>
                {failed[tab] ? (
                  <button
                    type="button"
                    className="quiet-button"
                    onClick={() => {
                      setFailed((previous) => ({ ...previous, [tab]: false }));
                      const frame = frames.current[tab];
                      if (frame) frame.src = frame.src;
                      setLoaded((previous) => ({ ...previous, [tab]: false }));
                    }}
                  >
                    {text.reload}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        {step === 3 &&
        enjoyment &&
        leftScore !== null &&
        rightScore !== null &&
        origin ? (
          <Reasons
            locale={pair.locale}
            enjoyment={enjoyment}
            leftScore={leftScore}
            rightScore={rightScore}
            origin={origin}
            tags={tags}
            other={other}
            marks={marks}
            lastPair={pair.pairIndex === pair.pairCount - 1}
            onOther={(row, value) =>
              setState((previous) => ({
                ...previous,
                other: { ...previous.other, [row]: value },
              }))
            }
            onMark={() => setMarking(true)}
            note={note}
            pending={pending}
            error={error}
            onToggle={handleToggleTag}
            onNote={setNote}
            onNext={handleNext}
          />
        ) : (
          <section
            className="question question--dock question--stacked"
            data-tour="dock"
          >
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
                  <div
                    className="primary-answers"
                    role="radiogroup"
                    aria-label={text.enjoyQuestion}
                  >
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
                        hint={lockedHint}
                        selected={enjoyment === value}
                        locked={locked}
                        hinted={hintKey === value}
                        onChoose={() => handleEnjoy(value)}
                        onLeave={() =>
                          setHintKey((current) =>
                            current === value ? null : current,
                          )
                        }
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
                    hint={lockedHint}
                    selected={enjoyment === "too_different"}
                    locked={locked}
                    hinted={hintKey === "too_different"}
                    secondary
                    onChoose={() => handleEnjoy("too_different")}
                    onLeave={() =>
                      setHintKey((current) =>
                        current === "too_different" ? null : current,
                      )
                    }
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
                <div
                  className="origin-answers"
                  role="radiogroup"
                  aria-label={text.origin}
                >
                  <Choice
                    label={text.websiteA}
                    selected={origin === "left"}
                    onChoose={() => setOrigin("left")}
                  />
                  <Choice
                    label={text.websiteB}
                    selected={origin === "right"}
                    onChoose={() => setOrigin("right")}
                  />
                  <span className="or-label">{text.or}</span>
                  <Choice
                    label={text.cantDecide}
                    selected={origin === "unsure"}
                    secondary
                    onChoose={() => setOrigin("unsure")}
                  />
                </div>
              ) : null}
              <button
                type="button"
                className="next-button"
                disabled={nextDisabled}
                onClick={handleNext}
              >
                {pending ? text.saving : text.next}
                <span aria-hidden="true">→</span>
              </button>
            </div>
            {error || saveError ? (
              <p className="study-error" role="alert">
                {error || text.storeUnavailable}
              </p>
            ) : null}
          </section>
        )}
        {ready && tourStep !== null && !state.tourDone ? (
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
                <button type="button" onClick={() => handleFinishTour()}>
                  {text.tourSkip}
                </button>
                <button
                  type="button"
                  className="tour-next"
                  onClick={() =>
                    tourStep === 2
                      ? handleFinishTour(false)
                      : setTourStep(tourStep + 1)
                  }
                >
                  {tourStep === 2 ? text.tourStart : text.tourNext}{" "}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </StudyShell>
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
  other,
  marks,
  lastPair,
  onOther,
  onMark,
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
  other: ReasonOther;
  marks: WebsiteMark[];
  lastPair: boolean;
  onOther: (row: keyof ReasonOther, value: string) => void;
  onMark: () => void;
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
    <section
      className="question question--dock question--stacked reasons-dock"
      data-tour="dock"
    >
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
            {tags[row.id].includes("other") ? (
              <input
                className="reason-other"
                aria-label={`${row.prompt} ${text.describe}`}
                placeholder={text.describe}
                maxLength={200}
                value={other[row.id]}
                onChange={(event) => onOther(row.id, event.target.value)}
              />
            ) : null}
          </div>
        ))}
      </div>
      <div className="annotation-list">
        <button type="button" className="quiet-button" onClick={onMark}>
          {text.mark}
        </button>
        {marks.map((mark) => (
          <span
            key={mark.id}
            title={`${text.savedMarks} ${mark.side.toUpperCase()} ${mark.note}`}
          >
            <Image
              unoptimized
              width={92}
              height={54}
              src={`/api/study/marks/${mark.id}`}
              alt={`${mark.side.toUpperCase()} ${mark.note}`}
            />
          </span>
        ))}
      </div>
      <div className="reasons-footer">
        <label>
          <span>{text.reasonsNote}</span>
          <input
            maxLength={1000}
            value={note}
            placeholder={text.reasonsPlaceholder}
            onChange={(event) => onNote(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="next-button"
          disabled={pending}
          onClick={onNext}
        >
          {pending ? text.saving : lastPair ? text.lastStep : text.nextPair}
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

function WebsiteFrame({
  src,
  title,
  className,
  hidden,
  frameRef,
  onLoad,
}: {
  src: string;
  title: string;
  className: string;
  hidden: boolean;
  frameRef: (node: HTMLIFrameElement | null) => void;
  onLoad: (event: React.SyntheticEvent<HTMLIFrameElement>) => void;
}) {
  const [initialSrc] = useState(src);
  const restored = useRef(false);
  return (
    <iframe
      ref={frameRef}
      src={initialSrc}
      title={title}
      className={className}
      aria-hidden={hidden}
      sandbox="allow-scripts allow-same-origin"
      onLoad={(event) => {
        if (!restored.current) {
          restored.current = true;
          onLoad(event);
        }
      }}
    />
  );
}
