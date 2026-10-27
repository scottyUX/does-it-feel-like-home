"use client";
import type { ReactNode, Ref } from "react";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/types";
export function StudyShell({
  children,
  locale = "en",
  shellRef,
}: {
  children: ReactNode;
  locale?: Locale;
  shellRef?: Ref<HTMLDivElement>;
}) {
  const text = copy[locale];
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
    </div>
  );
}
