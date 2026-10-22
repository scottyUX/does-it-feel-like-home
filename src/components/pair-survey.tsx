"use client";

import { useState } from "react";
import { ArrowLeft, ArrowLeftRight, ArrowRight, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [tab, setTab] = useState("a");
  const [step, setStep] = useState(0);
  const [enjoyment, setEnjoyment] = useState<Enjoyment | "">("");
  const [leftScore, setLeftScore] = useState("");
  const [rightScore, setRightScore] = useState("");
  const [origin, setOrigin] = useState<Side | "">("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const canContinue =
    (step === 1 && leftScore !== "" && rightScore !== "") ||
    (step === 2 && origin !== "") ||
    step === 3;

  const handleVote = (value: Enjoyment) => {
    if (pending) return;
    setEnjoyment(value);
    setStep(1);
  };

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
      <header className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
        <span>{text.progress(pair.pairIndex + 1, pair.pairCount)}</span>
        <span>{typeLabel(pair.locale, pair.siteType)}</span>
      </header>
      <Tabs value={tab} onValueChange={setTab} className="min-h-0 flex-1 gap-0">
        <TabsList className="grid h-11 w-full grid-cols-2 rounded-none bg-muted/60 p-1">
          <TabsTrigger value="a" className="h-full rounded-md">
            <span className="size-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
            {text.optionA}
          </TabsTrigger>
          <TabsTrigger value="b" className="h-full rounded-md">
            <span className="size-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
            {text.optionB}
          </TabsTrigger>
        </TabsList>
        <div className="relative min-h-0 flex-1">
          <TabsContent
            value="a"
            forceMount
            className="absolute inset-0 mt-0 data-[state=inactive]:hidden"
          >
            <iframe title={text.optionA} src={`/s/${pair.leftId}/`} className="size-full bg-white" />
          </TabsContent>
          <TabsContent
            value="b"
            forceMount
            className="absolute inset-0 mt-0 data-[state=inactive]:hidden"
          >
            <iframe title={text.optionB} src={`/s/${pair.rightId}/`} className="size-full bg-white" />
          </TabsContent>
        </div>
      </Tabs>
      <section className="border-t border-border px-4 py-4">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {step === 0 ? (
            <div className="mx-auto flex w-fit max-w-full flex-wrap justify-center gap-2 rounded-2xl border border-border bg-card p-2">
              <Button type="button" variant="outline" size="lg" onClick={() => handleVote("left")}>
                <ArrowLeft />
                {text.aBetter}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => handleVote("both")}>
                <ArrowLeftRight />
                {text.bothGood}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => handleVote("neither")}>
                <Ban />
                {text.bothBad}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => handleVote("right")}>
                {text.bBetter}
                <ArrowRight />
              </Button>
            </div>
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
                ["left", text.optionA],
                ["right", text.optionB],
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
          {step > 0 ? (
            <div>
              <Button type="button" disabled={!canContinue || pending} onClick={handleContinue}>
                {pending ? text.saving : text.continue}
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
};

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
