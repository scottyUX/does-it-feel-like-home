"use client";

import { useRef } from "react";
import { modelName, type SignalPage } from "@/components/country-signal-plots";

// A data card that opens a dialog listing every model, grouped by country and then by lab.
export function ModelsCard({ pages, note }: { pages: SignalPage[]; note: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const voted = pages.some((page) => page.won !== undefined);
  const countries = (["China", "US"] as const).map((origin) => {
    const here = pages.filter((page) => page.origin === origin);
    const labs = [...new Set(here.map((page) => page.lab))].sort().map((lab) => ({
      lab,
      models: [...new Set(here.filter((page) => page.lab === lab).map((page) => page.model))].sort((a, b) => modelName(a).localeCompare(modelName(b))).map((model) => {
        const sites = here.filter((page) => page.model === model);
        return { model, sites: sites.length, wins: sites.filter((page) => page.won).length };
      }),
    }));
    return { origin, title: origin === "China" ? "Chinese models" : "US models", labs, count: labs.reduce((n, lab) => n + lab.models.length, 0) };
  });
  const total = countries.reduce((n, country) => n + country.count, 0);
  return <>
    <button type="button" className="arena-card data-card-button" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">
      <span>Models</span><strong>{total}</strong><small>{note}</small><em>See all models →</em>
    </button>
    <dialog ref={dialog} className="models-dialog" aria-labelledby="models-dialog-title" onClick={(event) => { if (event.target === dialog.current) dialog.current?.close(); }}>
      <header><h2 id="models-dialog-title">{total} models by country and lab</h2><button type="button" onClick={() => dialog.current?.close()} aria-label="Close">×</button></header>
      <div className="models-dialog-body">{countries.map((country) => <section key={country.origin} className={country.origin === "China" ? "models-china" : "models-us"}>
        <h3>{country.title} <span>{country.count} models · {country.labs.length} labs</span></h3>
        {country.labs.map((lab) => <div className="models-lab" key={lab.lab}>
          <h4>{lab.lab}</h4>
          <ul>{lab.models.map((item) => <li key={item.model}><span>{modelName(item.model)}</span><small>{item.sites} {item.sites === 1 ? "site" : "sites"}{voted && ` · won ${item.wins}`}</small></li>)}</ul>
        </div>)}
      </section>)}</div>
    </dialog>
  </>;
}
