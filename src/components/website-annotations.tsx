"use client";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react";
import { copy } from "@/lib/copy";
import type { Locale, MarkShape, WebsiteMark, WebsiteSide } from "@/lib/types";

type Props = {
  locale: Locale;
  side: WebsiteSide;
  frames: RefObject<Record<WebsiteSide, HTMLIFrameElement | null>>;
  existing: WebsiteMark[];
  onDone: (marks: WebsiteMark[]) => void;
  onCancel: () => void;
};
export function WebsiteAnnotations({
  locale,
  side,
  frames,
  existing,
  onDone,
  onCancel,
}: Props) {
  const text = copy[locale];
  const [shape, setShape] = useState<MarkShape>("box");
  const [marks, setMarks] = useState<WebsiteMark[]>([]);
  const [drawing, setDrawing] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [bounds, setBounds] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  useEffect(() => {
    const frame = frames.current[side];
    const shell = frame?.closest(".survey");
    if (!frame || !shell) return;
    const update = () => {
      const a = frame.getBoundingClientRect(),
        b = shell.getBoundingClientRect();
      setBounds({
        top: a.top - b.top,
        left: a.left - b.left,
        width: a.width,
        height: a.height,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [frames, side]);
  const position = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
    };
  };
  const begin = (event: PointerEvent<HTMLDivElement>) => {
    if (busy || event.target !== event.currentTarget) return;
    if (existing.length + marks.length >= 20) {
      setError(text.markLimit);
      return;
    }
    start.current = position(event);
    setDrawing({ ...start.current, width: 0, height: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const end = position(event);
    setDrawing({
      x: Math.min(start.current.x, end.x),
      y: Math.min(start.current.y, end.y),
      width: Math.abs(start.current.x - end.x),
      height: Math.abs(start.current.y - end.y),
    });
  };
  const finish = async () => {
    start.current = null;
    if (!drawing || drawing.width < 5 || drawing.height < 5) {
      setDrawing(null);
      return;
    }
    const frame = frames.current[side];
    const doc = frame?.contentDocument;
    const win = frame?.contentWindow;
    if (!doc || !win) return;
    setBusy(true);
    setError("");
    try {
      const { toCanvas } = await import("html-to-image");
      const full = await toCanvas(doc.documentElement, {
        pixelRatio: 1,
        width: Math.max(doc.documentElement.scrollWidth, win.innerWidth),
        height: Math.max(doc.documentElement.scrollHeight, win.innerHeight),
        cacheBust: false,
        imagePlaceholder:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=",
      });
      const canvas = document.createElement("canvas");
      canvas.width = win.innerWidth;
      canvas.height = win.innerHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        full,
        win.scrollX,
        win.scrollY,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      ctx.strokeStyle = shape === "highlight" ? "#806600" : "#c43b24";
      ctx.lineWidth = 3;
      if (shape === "circle") {
        ctx.beginPath();
        ctx.ellipse(
          drawing.x + drawing.width / 2,
          drawing.y + drawing.height / 2,
          drawing.width / 2,
          drawing.height / 2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      } else {
        if (shape === "highlight") {
          ctx.fillStyle = "rgba(255,213,0,.35)";
          ctx.fillRect(drawing.x, drawing.y, drawing.width, drawing.height);
        }
        ctx.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height);
      }
      setMarks((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          side,
          shape,
          ...drawing,
          page: win.location.pathname + win.location.search + win.location.hash,
          scrollX: win.scrollX,
          scrollY: win.scrollY,
          viewportWidth: win.innerWidth,
          viewportHeight: win.innerHeight,
          note: "",
          screenshot: canvas.toDataURL("image/jpeg", 0.7),
        },
      ]);
      setDrawing(null);
    } catch {
      setError(text.captureError);
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      for (const mark of marks) {
        const response = await fetch("/api/study/marks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mark),
        });
        if (!response.ok) throw new Error("save");
      }
      onDone(marks.map((mark) => ({ ...mark, screenshot: undefined })));
    } catch {
      setError(text.captureError);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="annotation-tools" role="toolbar" aria-label={text.mark}>
        {(["box", "circle", "highlight"] as const).map((tool) => (
          <button
            key={tool}
            type="button"
            className="quiet-button"
            aria-pressed={shape === tool}
            onClick={() => setShape(tool)}
          >
            {text[tool]}
          </button>
        ))}
        <span className="helper" role="status">
          {error || (busy ? text.saving : text.markHelp)}
        </span>
        <button
          type="button"
          className="next-button"
          disabled={busy}
          onClick={save}
        >
          {text.done}
        </button>
        <button
          type="button"
          className="quiet-button"
          disabled={busy}
          onClick={onCancel}
        >
          {text.cancel}
        </button>
      </div>
      <div
        className="annotation-overlay"
        style={{ ...bounds, right: "auto", bottom: "auto" }}
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={() => {
          start.current = null;
          setDrawing(null);
        }}
      >
        {[
          ...marks.filter((mark) => mark.side === side),
          ...(drawing ? [{ ...drawing, id: "drawing", shape }] : []),
        ].map((mark) => (
          <div
            key={mark.id}
            className={`annotation-mark is-${mark.shape}`}
            style={{
              left: mark.x,
              top: mark.y,
              width: mark.width,
              height: mark.height,
            }}
          />
        ))}
        {marks
          .filter((mark) => mark.side === side)
          .map((mark) => (
            <div
              className="annotation-note"
              key={mark.id}
              style={{
                left: Math.max(0, Math.min(mark.x, bounds.width - 250)),
                top: Math.max(
                  0,
                  Math.min(mark.y + mark.height + 8, bounds.height - 100),
                ),
              }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <input
                aria-label={text.note}
                placeholder={text.note}
                value={mark.note}
                maxLength={200}
                onChange={(event) =>
                  setMarks((previous) =>
                    previous.map((item) =>
                      item.id === mark.id
                        ? { ...item, note: event.target.value }
                        : item,
                    ),
                  )
                }
              />
              <button
                type="button"
                className="quiet-button"
                disabled={busy}
                onClick={() =>
                  setMarks((previous) =>
                    previous.filter((item) => item.id !== mark.id),
                  )
                }
              >
                {text.remove}
              </button>
            </div>
          ))}
      </div>
    </>
  );
}
