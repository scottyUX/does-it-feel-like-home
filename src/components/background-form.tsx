"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitBackground } from "@/lib/actions";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/types";

const fieldClass =
  "h-9 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type BackgroundFormProps = {
  locale: Locale;
};

export const BackgroundForm = ({ locale }: BackgroundFormProps) => {
  const text = copy[locale];
  const [livesNow, setLivesNow] = useState("");
  const [yearsAbroad, setYearsAbroad] = useState("");
  const [designExperience, setDesignExperience] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const ready = livesNow.trim() && yearsAbroad.trim() && designExperience.trim();

  const handleSubmit = async () => {
    if (!ready || pending) return;
    setPending(true);
    setError("");
    const result = await submitBackground({ livesNow, yearsAbroad, designExperience });
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <section className="grid w-full max-w-lg gap-5 rounded-3xl border border-border bg-card p-8">
        <h1 className="text-xl font-medium">{text.backgroundTitle}</h1>
        <Field id="lives-now" label={text.livesNow} value={livesNow} onChange={setLivesNow} />
        <Field id="years-abroad" label={text.yearsAbroad} value={yearsAbroad} onChange={setYearsAbroad} />
        <Field
          id="design-experience"
          label={text.designExperience}
          value={designExperience}
          onChange={setDesignExperience}
        />
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <div>
          <Button type="button" disabled={!ready || pending} onClick={handleSubmit}>
            {pending ? text.saving : text.continue}
          </Button>
        </div>
      </section>
    </main>
  );
};

const Field = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={id}>{label}</Label>
    <input
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={fieldClass}
    />
  </div>
);
