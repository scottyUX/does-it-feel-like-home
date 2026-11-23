"use client";

import { useRef } from "react";
import { BookOpen, CircleHelp } from "lucide-react";
import { measurementDefinitions } from "@/lib/arena/measurement-definitions";
import { ArenaModelMark } from "@/components/arena-model-mark";

type Value = string | number | boolean | null;
type SitePropertiesProps = {
  id: string;
  modelA: string;
  modelB: string;
  measurements?: Record<string, Record<string, Value>>;
};

function displayValue(value: Value | undefined) {
  if (value === undefined || value === null) return "Not measured";
  return typeof value === "number" && !Number.isInteger(value) ? value.toFixed(3) : String(value);
}

export function ArenaSiteProperties({ id, modelA, modelB, measurements }: SitePropertiesProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const a = measurements?.a ?? {};
  const b = measurements?.b ?? {};
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  return <>
    <button type="button" className="arena-properties-button" onClick={() => dialog.current?.showModal()}>View properties</button>
    <dialog ref={dialog} className="arena-properties-dialog" aria-labelledby="arena-properties-title">
      <div className="arena-dialog-header"><div><span>PAIR PROPERTIES</span><h2 id="arena-properties-title">Compare properties</h2></div><button type="button" aria-label="Close properties" onClick={() => dialog.current?.close()}>×</button></div>
      <p className="arena-properties-intro">Exploratory measurements from the rendered sites. External resources were blocked and may be missing.</p>
      <div className="arena-properties-table" role="table" aria-label="Website properties by model">
        <div className="arena-property-row arena-property-head" role="row"><div role="columnheader">Property</div>{([modelA, modelB] as const).map((model, side) => <div role="columnheader" className="arena-property-model" key={side}><ArenaModelMark model={model} /><span>{model}</span><a href={`/api/arena/screenshot/${encodeURIComponent(id)}/${side === 0 ? "a" : "b"}`} target="_blank" rel="noreferrer">Screenshot</a></div>)}</div>
        {keys.map((key) => {
          const definition = measurementDefinitions[key];
          return <div className="arena-property-row" role="row" key={key}><div className="arena-property-label" role="rowheader"><span>{definition?.label ?? key.replaceAll("_", " ")}</span>{definition && <details className="arena-property-help"><summary aria-label={`How ${definition.label} is calculated`}><CircleHelp size={16} /></summary><div><strong>How we calculate it</strong><p>{definition.calculation}</p></div></details>}{definition?.paper && <a className="arena-property-paper" href={definition.paper.url} target="_blank" rel="noreferrer" aria-label={`Related research: ${definition.paper.title}`} title={`Related research: ${definition.paper.title}`}><BookOpen size={16} /></a>}</div><div role="cell">{displayValue(a[key])}</div><div role="cell">{displayValue(b[key])}</div></div>;
        })}
      </div>
      {!keys.length && <p className="arena-properties-empty">No computed properties are available for this pair yet.</p>}
      <p className="arena-properties-note">Paper icons link to related research, not necessarily the source of our exact calculation. Select ? for the calculation and its limitations.</p>
    </dialog>
  </>;
}
