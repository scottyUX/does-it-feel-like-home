"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { submitPair } from "@/lib/actions";
import { copy, typeLabel } from "@/lib/copy";
import type { CurrentPair, Enjoyment, Side } from "@/lib/types";

type PairSurveyProps = {
  pair: CurrentPair;
};

const choiceClass = "flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5";

export const PairSurvey = ({ pair }: PairSurveyProps) => {
  const text = copy[pair.locale];
  const [step, setStep] = useState(0);
  const [enjoyment, setEnjoyment] = useState<Enjoyment | "">("");
  const [leftScore, setLeftScore] = useState("");
  const [rightScore, setRightScore] = useState("");
  const [origin, setOrigin] = useState<Side | "">("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const canContinue =
    (step === 0 && enjoyment !== "") ||
    (step === 1 && leftScore !== "" && rightScore !== "") ||
    (step === 2 && origin !== "") ||
    step === 3;

  const handleContinue = async () => {
    if (!canContinue || pending) return;
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (!enjoyment || !origin) return;
    setPending(true);
    setError("");
    const result = await submitPair({
      siteType: pair.siteType,
      enjoyment,
      familiarityLeft: Number(leftScore),
      familiarityRight: Number(rightScore),
      chineseModelSide: origin,
      reason,
    });
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  };

  return (
    <main className="flex h-dvh flex-col">
      <p className="bg-muted px-4 py-2 text-center text-xs text-muted-foreground lg:hidden">
        {text.wideScreen}
      </p>
      <header className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
        <span>{text.progress(pair.pairIndex + 1, pair.pairCount)}</span>
        <span>{typeLabel(pair.locale, pair.siteType)}</span>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-x-auto px-4 pb-3">
        <SiteFrame id={pair.leftId} label={text.left} title={text.leftSite} />
        <SiteFrame id={pair.rightId} label={text.right} title={text.rightSite} />
      </div>
      <section className="max-h-[42vh] overflow-y-auto border-t border-border px-4 py-4">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {step === 0 ? (
            <ChoiceQuestion
              name="enjoyment"
              prompt={text.enjoyment}
              value={enjoyment}
              onChange={(value) => setEnjoyment(value as Enjoyment)}
              options={[
                ["left", text.left],
                ["right", text.right],
                ["both", text.both],
                ["neither", text.neither],
                ["too_different", text.tooDifferent],
              ]}
            />
          ) : null}
          {step === 1 ? (
            <div className="grid gap-4">
              <p className="text-sm">{text.familiarity}</p>
              <ScoreQuestion
                name="left-score"
                prompt={text.familiarityLeft}
                value={leftScore}
                scale={text.scale}
                onChange={setLeftScore}
              />
              <ScoreQuestion
                name="right-score"
                prompt={text.familiarityRight}
                value={rightScore}
                scale={text.scale}
                onChange={setRightScore}
              />
            </div>
          ) : null}
          {step === 2 ? (
            <ChoiceQuestion
              name="origin"
              prompt={text.origin}
              value={origin}
              onChange={(value) => setOrigin(value as Side)}
              options={[
                ["left", text.left],
                ["right", text.right],
              ]}
            />
          ) : null}
          {step === 3 ? (
            <div className="grid gap-2">
              <Label htmlFor="reason">
                {text.reason} <span className="text-muted-foreground">({text.optional})</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div>
            <Button type="button" disabled={!canContinue || pending} onClick={handleContinue}>
              {pending ? text.saving : text.continue}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

const SiteFrame = ({ id, label, title }: { id: string; label: string; title: string }) => (
  <section className="flex min-h-0 min-w-[340px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
    <h2 className="border-b border-border px-3 py-2 text-sm text-muted-foreground">{label}</h2>
    <iframe title={title} src={`/s/${id}/`} className="min-h-0 w-full flex-1 bg-white" />
  </section>
);

const ChoiceQuestion = ({
  name,
  prompt,
  value,
  onChange,
  options,
}: {
  name: string;
  prompt: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) => (
  <fieldset className="grid gap-3">
    <legend className="text-sm">{prompt}</legend>
    <RadioGroup value={value} onValueChange={onChange} className="grid gap-2">
      {options.map(([optionValue, optionLabel]) => {
        const id = `${name}-${optionValue}`;
        return (
          <div key={optionValue} className={choiceClass}>
            <RadioGroupItem value={optionValue} id={id} />
            <Label htmlFor={id}>{optionLabel}</Label>
          </div>
        );
      })}
    </RadioGroup>
  </fieldset>
);

const ScoreQuestion = ({
  name,
  prompt,
  value,
  scale,
  onChange,
}: {
  name: string;
  prompt: string;
  value: string;
  scale: readonly string[];
  onChange: (value: string) => void;
}) => (
  <fieldset className="grid gap-2">
    <legend className="text-sm text-muted-foreground">{prompt}</legend>
    <RadioGroup value={value} onValueChange={onChange} className="grid gap-2 sm:grid-cols-5">
      {scale.map((label, index) => {
        const optionValue = String(index + 1);
        const id = `${name}-${optionValue}`;
        return (
          <div key={optionValue} className={choiceClass}>
            <RadioGroupItem value={optionValue} id={id} />
            <Label htmlFor={id}>{label}</Label>
          </div>
        );
      })}
    </RadioGroup>
  </fieldset>
);
