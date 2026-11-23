"use client";
import { useEffect, useState, type ReactNode, type Ref } from "react";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/types";
export function StudyShell({
  children,
  locale = "en",
  shellRef,
  lockHistory = false,
}: {
  children: ReactNode;
  locale?: Locale;
  shellRef?: Ref<HTMLDivElement>;
  lockHistory?: boolean;
}) {
  const text = copy[locale];
  const [notice, setNotice] = useState(false);

  // Answers are final once a participant moves on, so the browser's Back button keeps them on this page.
  useEffect(() => {
    if (!lockHistory) return;
    // A duplicate of the current entry (with the router's own state) absorbs each Back press.
    history.pushState(history.state, "", location.href);
    const stay = () => {
      history.pushState(history.state, "", location.href);
      setNotice(true);
    };
    window.addEventListener("popstate", stay);
    return () => window.removeEventListener("popstate", stay);
  }, [lockHistory]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(false), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <div
      className="study"
      lang={locale === "zh" ? "zh-CN" : "en"}
      ref={shellRef}
    >
      <aside className="device-message">
        <h1>{text.deviceTitle}</h1>
        <p>{text.deviceMessage}</p>
        {locale === "en" ? <p lang="zh-CN">{copy.zh.deviceMessage}</p> : null}
      </aside>
      {children}
      {notice ? (
        <p className="history-notice" role="status">
          {text.noGoingBack}
        </p>
      ) : null}
    </div>
  );
}
