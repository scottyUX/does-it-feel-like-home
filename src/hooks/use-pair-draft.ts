"use client";
import { useEffect, useRef, useState } from "react";
import { emptyPairDraft, sanitizeDraft } from "@/lib/study-state";
import type { CurrentPair, PairDraft, WebsiteSide } from "@/lib/types";

export function usePairDraft(
  pair: CurrentPair,
  tab: WebsiteSide,
  touring: boolean,
  loaded: boolean,
) {
  const [state, setState] = useState<PairDraft>(emptyPairDraft);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const current = useRef(state);
  const key = `diflh:v2:${pair.sessionId}:${pair.siteType}`;
  useEffect(() => {
    current.current = state;
  }, [state]);
  useEffect(() => {
    let active = true;
    const restore = async () => {
      let local: { state?: PairDraft; at?: number } = {};
      try {
        local = JSON.parse(localStorage.getItem(key) ?? "{}");
      } catch {
        /* Storage can be disabled. */
      }
      let remote: { state?: PairDraft; updated_at?: string } = {};
      try {
        const response = await fetch("/api/study");
        if (response.ok) remote = await response.json();
      } catch {
        /* The local copy supports offline recovery. */
      }
      const latest =
        (local.at ?? 0) > Date.parse(remote.updated_at ?? "") || !remote.state
          ? local.state
          : remote.state;
      const draft = sanitizeDraft(latest) ?? emptyPairDraft();
      if (active) {
        current.current = draft;
        setState(draft);
        setReady(true);
      }
    };
    void restore();
    return () => {
      active = false;
    };
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    const persist = () => {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ state: current.current, at: Date.now() }),
        );
      } catch {
        /* Server autosave remains available. */
      }
    };
    let inFlight = false;
    const upload = async () => {
      persist();
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await fetch("/api/study", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteType: pair.siteType,
            state: current.current,
          }),
        });
        setSaveError(!response.ok && response.status !== 409);
      } catch {
        setSaveError(true);
      } finally {
        inFlight = false;
      }
    };
    const localTimer = setInterval(persist, 750);
    const remoteTimer = setInterval(upload, 4000);
    const leave = (event: BeforeUnloadEvent) => {
      persist();
      event.preventDefault();
      event.returnValue = "";
    };
    const hide = (event: Event) => {
      persist();
      if (document.visibilityState === "hidden")
        navigator.sendBeacon(
          "/api/study",
          new Blob(
            [
              JSON.stringify({
                siteType: pair.siteType,
                state: current.current,
                leaving: event.type === "pagehide",
              }),
            ],
            { type: "application/json" },
          ),
        );
    };
    window.addEventListener("beforeunload", leave);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", hide);
    return () => {
      persist();
      clearInterval(localTimer);
      clearInterval(remoteTimer);
      window.removeEventListener("beforeunload", leave);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", hide);
    };
  }, [key, pair.siteType, ready]);
  useEffect(() => {
    if (!ready || !loaded || (touring && !state.tourDone)) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const elapsed = Math.min(1000, now - last);
      last = now;
      if (document.visibilityState !== "visible" || window.innerWidth < 1024)
        return;
      setState((previous) => ({
        ...previous,
        metrics: {
          ...previous.metrics,
          viewingMs: {
            ...previous.metrics.viewingMs,
            [tab]: previous.metrics.viewingMs[tab] + elapsed,
          },
        },
      }));
    }, 250);
    return () => clearInterval(timer);
  }, [tab, ready, touring, state.tourDone, loaded]);
  return {
    state,
    setState,
    ready,
    saveError,
    clearDraft: () => {
      try {
        localStorage.removeItem(key);
      } catch {}
    },
  };
}
