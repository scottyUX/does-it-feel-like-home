"use client";
import { useEffect, useRef, useState } from "react";
import { StudyShell } from "@/components/study-shell";

type ExperimentViewerProps = {
  description: string;
  sites: { label: string; id: string; model: string }[];
};

// The sites are designed for a 1440px window, so each one renders at that width and is scaled to fit its column.
const DESKTOP_WIDTH = 1440;

const ScaledSite = ({ id, title }: { id: string; title: string }) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const scale = size.width / DESKTOP_WIDTH;
  return (
    <div className="preview-frame" ref={frameRef}>
      {scale > 0 ? (
        <iframe
          title={title}
          src={`/s/${id}/`}
          className="preview-site"
          style={{
            width: DESKTOP_WIDTH,
            height: size.height / scale,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      ) : null}
    </div>
  );
};

// Both websites side by side so researchers can compare them at a glance.
export const ExperimentViewer = ({ description, sites }: ExperimentViewerProps) => (
  <StudyShell>
    <div className="survey survey--experiment">
      <header className="survey-header">
        <span className="top-instruction">{description}</span>
      </header>
      <div className="preview-wrap experiment-columns">
        {sites.map((site, index) => {
          const name = `Website ${index === 0 ? "A" : "B"}`;
          return (
            <section key={site.id} className="experiment-column">
              <h2 className="experiment-label">
                <strong>{name}</strong>
                <span>
                  {site.label === "zh" ? "Chinese" : "English"} prompt ·{" "}
                  {site.model}
                </span>
                <a href={`/s/${site.id}/`} target="_blank" rel="noreferrer">
                  Open full size
                </a>
              </h2>
              <ScaledSite id={site.id} title={name} />
            </section>
          );
        })}
      </div>
    </div>
  </StudyShell>
);
