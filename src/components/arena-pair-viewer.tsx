"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { StudyShell } from "@/components/study-shell";
import { copy } from "@/lib/copy";
import { ArenaSiteProperties } from "@/components/arena-site-properties";
import { ArenaModelMark } from "@/components/arena-model-mark";

type ArenaPairViewerProps = {
  id: string;
  index: number;
  count: number;
  previousId?: string;
  nextId?: string;
  prompt: string;
  translation?: string;
  modelA: string;
  modelB: string;
  winner: "model_a" | "model_b";
  measurements?: Record<string, Record<string, string | number | boolean | null>>;
};

export function ArenaPairViewer({ id, index, count, previousId, nextId, prompt, translation, modelA, modelB, winner, measurements }: ArenaPairViewerProps) {
  const [tab, setTab] = useState<"a" | "b">("a");
  const promptDialog = useRef<HTMLDialogElement>(null);
  const text = copy.en;
  return <StudyShell>
    <div className="survey survey--dock survey--stacked survey--arena-review">
      <header className="survey-header">
        <div className="arena-review-tools">
          <Link href="/arena" className="top-instruction">Back to analysis</Link>
          <button type="button" className="arena-prompt-button" onClick={() => promptDialog.current?.showModal()}>Prompt</button>
          <ArenaSiteProperties id={id} modelA={modelA} modelB={modelB} measurements={measurements} />
        </div>
        <div className="site-tabs" role="tablist" aria-label="Choose a website">
          {(["a", "b"] as const).map((side) => <button key={side} type="button" role="tab" title={`${side === "a" ? modelA : modelB}${winner === `model_${side}` ? " · Arena vote winner" : ""}`} aria-selected={tab === side} className={tab === side ? "site-tab is-active" : "site-tab"} onClick={() => setTab(side)}><ArenaModelMark model={side === "a" ? modelA : modelB} /><span className="arena-tab-model">{side === "a" ? modelA : modelB}</span>{winner === `model_${side}` && <span className="arena-winner-badge" aria-label="Arena vote winner">Winner</span>}</button>)}
        </div>
        <nav className="arena-review-nav" aria-label="Pair navigation">{previousId ? <Link href={`/arena/pair/${previousId}`}>Previous</Link> : <span aria-disabled="true">Previous</span>}<span>{text.progress(index + 1, count)}</span>{nextId ? <Link href={`/arena/pair/${nextId}`}>Next</Link> : <span aria-disabled="true">Next</span>}</nav>
      </header>
      <div className="preview-wrap">
        <div className="preview-frame">
          {(["a", "b"] as const).map((side) => <iframe key={side} title={side === "a" ? modelA : modelB} src={`/api/arena/preview/${encodeURIComponent(id)}/${side}`} className={tab === side ? "preview-site" : "preview-site is-hidden"} aria-hidden={tab !== side} sandbox="allow-scripts" referrerPolicy="no-referrer" />)}
        </div>
      </div>
      <dialog ref={promptDialog} className="arena-prompt-dialog" aria-labelledby="arena-prompt-title">
        <div className="arena-dialog-header"><div><span>PAIR {index + 1} OF {count}</span><h2 id="arena-prompt-title">Shared prompt</h2></div><button type="button" aria-label="Close prompt" onClick={() => promptDialog.current?.close()}>×</button></div>
        <section><h3>Original</h3><p lang="zh">{prompt}</p></section>
        <section><h3>English translation</h3><p>{translation ?? "Translation not available for this prompt yet."}</p>{translation && <small>AI-assisted translation · Not independently reviewed</small>}</section>
        <p className="arena-dialog-note">Most external resources and form submissions are blocked in previews. Links may navigate away within the preview.</p>
      </dialog>
    </div>
  </StudyShell>;
}
