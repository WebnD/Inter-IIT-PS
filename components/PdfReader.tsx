"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

// pdf.js is copied into public/pdfjs by scripts/copy-pdfjs.mjs and loaded as a native
// ES module, so webpack never touches it.
const PDFJS_URL = "/pdfjs/pdf.min.mjs";
const WORKER_URL = "/pdfjs/pdf.worker.min.mjs";

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const MAX_FIT_WIDTH = 960; // px: on wide screens "fit" means a readable column, not edge to edge
const MAX_CANVAS_PIXELS = 12_000_000; // stay under iOS Safari's canvas memory limit

type Size = { w: number; h: number };
type Props = { src: string; title: string; downloadName?: string };

export function PdfReader({ src, title, downloadName }: Props) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [progress, setProgress] = useState<number | null>(null);
  const [zoomIdx, setZoomIdx] = useState(ZOOM_STEPS.indexOf(1));
  const [current, setCurrent] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [boxWidth, setBoxWidth] = useState(0);

  const boxRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const anchor = useRef<{ page: number; frac: number } | null>(null);
  const pageEls = useRef<(HTMLDivElement | null)[]>([]);

  // Load the document
  useEffect(() => {
    let cancelled = false;
    let destroy: (() => void) | undefined;
    (async () => {
      try {
        const pdfjs = await import(/* webpackIgnore: true */ PDFJS_URL as string);
        pdfjs.GlobalWorkerOptions.workerSrc = WORKER_URL;
        const task = pdfjs.getDocument({ url: src, isEvalSupported: false });
        destroy = () => task.destroy();
        task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          if (!cancelled && total) setProgress(Math.min(loaded / total, 1));
        };
        const pdf: PDFDocumentProxy = await task.promise;
        const pageSizes: Size[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const vp = (await pdf.getPage(i)).getViewport({ scale: 1 });
          pageSizes.push({ w: vp.width, h: vp.height });
        }
        if (cancelled) return;
        setSizes(pageSizes);
        setDoc(pdf);
        setStatus("ready");
      } catch (err) {
        console.error("PDF failed to load", err);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [src]);

  // Track the available width so "fit" re-renders on rotate/resize
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    let frame = 0;
    const ro = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setBoxWidth(Math.floor(entry.contentRect.width)));
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);

  // Which page is in the middle of the screen
  useEffect(() => {
    if (status !== "ready") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.page));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    pageEls.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [status, sizes.length]);

  useEffect(() => setPageInput(String(current)), [current]);

  const zoom = ZOOM_STEPS[zoomIdx];
  const fitWidth = Math.min(boxWidth, MAX_FIT_WIDTH);
  const pageWidth = Math.max(Math.round(fitWidth * zoom), 1);

  // Keep the same spot in the same page on screen when zooming
  const changeZoom = (nextIdx: number) => {
    const el = pageEls.current[current - 1];
    const bar = toolbarRef.current?.offsetHeight ?? 0;
    if (el) {
      const r = el.getBoundingClientRect();
      anchor.current = { page: current, frac: Math.min(Math.max((bar - r.top) / r.height, 0), 1) };
    }
    setZoomIdx(nextIdx);
  };

  useLayoutEffect(() => {
    const a = anchor.current;
    if (!a) return;
    anchor.current = null;
    const el = pageEls.current[a.page - 1];
    if (!el) return;
    const bar = toolbarRef.current?.offsetHeight ?? 0;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + a.frac * el.offsetHeight - bar });
  }, [pageWidth]);

  const goTo = useCallback(
    (n: number) => {
      const page = Math.min(Math.max(1, n), sizes.length);
      const el = pageEls.current[page - 1];
      if (!el) return;
      const bar = toolbarRef.current?.offsetHeight ?? 0;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - bar - 8 });
      setCurrent(page);
    },
    [sizes.length],
  );

  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-rule bg-surface px-2.5 text-sm font-medium hover:border-ink disabled:opacity-40 disabled:hover:border-rule";

  if (status === "error") {
    return (
      <div className="rounded-lg border border-dashed border-rule bg-surface p-8">
        <p className="font-medium">The PDF couldn&apos;t be displayed here.</p>
        <p className="mt-1 text-muted">The file may be missing or damaged, or the connection dropped. Open or download it directly instead.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={src} target="_blank" rel="noreferrer" className="rounded-md bg-ink px-4 py-2 font-medium text-paper">
            Open the PDF
          </a>
          <a href={src} download={downloadName} className="rounded-md border border-rule bg-surface px-4 py-2 font-medium">
            Download
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-4 sm:mx-0">
      <div
        ref={toolbarRef}
        role="toolbar"
        aria-label="PDF controls"
        className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-rule bg-paper/95 px-4 py-2 backdrop-blur sm:rounded-t-lg sm:border sm:px-3"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      >
        <form
          className="flex items-center gap-1.5 text-sm"
          onSubmit={(e) => {
            e.preventDefault();
            goTo(Number(pageInput) || 1);
          }}
        >
          <label htmlFor="pdf-page" className="sr-only">Go to page</label>
          <input
            id="pdf-page"
            inputMode="numeric"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
            onBlur={() => setPageInput(String(current))}
            disabled={status !== "ready"}
            className="h-9 w-12 rounded-md border border-rule bg-surface text-center tabular-nums"
          />
          <span className="text-muted tabular-nums">of {sizes.length || "–"}</span>
        </form>

        <div className="flex items-center gap-1.5">
          <button type="button" className={btn} aria-label="Zoom out" disabled={zoomIdx === 0 || status !== "ready"} onClick={() => changeZoom(zoomIdx - 1)}>
            −
          </button>
          <button
            type="button"
            className={`${btn} w-16 tabular-nums`}
            aria-label="Reset zoom to fit width"
            disabled={status !== "ready"}
            onClick={() => changeZoom(ZOOM_STEPS.indexOf(1))}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            className={btn}
            aria-label="Zoom in"
            disabled={zoomIdx === ZOOM_STEPS.length - 1 || status !== "ready"}
            onClick={() => changeZoom(zoomIdx + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div ref={boxRef} className="overflow-x-auto bg-[#E4E8EC] py-3 sm:rounded-b-lg sm:border sm:border-t-0 sm:border-rule">
        {status === "loading" ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center" role="status">
            <p className="font-medium">Loading {title}…</p>
            <div className="h-1.5 w-56 overflow-hidden rounded-full bg-rule">
              <div
                className={`h-full bg-ink transition-[width] ${progress === null ? "w-1/3 animate-pulse" : ""}`}
                style={progress === null ? undefined : { width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            {progress !== null && <p className="text-sm text-muted tabular-nums">{Math.round(progress * 100)}%</p>}
          </div>
        ) : (
          doc &&
          boxWidth > 0 && (
            <div className="mx-auto flex flex-col gap-3" style={{ width: pageWidth }}>
              {sizes.map((s, i) => (
                <div key={i} ref={(el) => { pageEls.current[i] = el; }} data-page={i + 1}>
                  <PdfPage doc={doc} pageNumber={i + 1} width={pageWidth} height={Math.round((pageWidth * s.h) / s.w)} />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/** One page: renders to canvas when near the viewport, frees the canvas when far away. */
function PdfPage({ doc, pageNumber, width, height }: { doc: PDFDocumentProxy; pageNumber: number; width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "150% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!near) {
      // Release memory for pages far off screen; phones run out fast otherwise.
      canvas.width = 0;
      canvas.height = 0;
      setRendered(false);
      return;
    }
    let task: RenderTask | null = null;
    let cancelled = false;
    (async () => {
      const page = await doc.getPage(pageNumber);
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      let scale = (width / base.width) * Math.min(window.devicePixelRatio || 1, 2);
      const pixels = base.width * base.height * scale * scale;
      if (pixels > MAX_CANVAS_PIXELS) scale *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);
      const viewport = page.getViewport({ scale });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      task = page.render({ canvasContext: ctx, viewport });
      try {
        await task.promise;
        if (!cancelled) setRendered(true);
      } catch {
        // cancelled by a newer render; nothing to do
      }
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, pageNumber, width, near]);

  return (
    <div ref={wrapRef} className="relative bg-white shadow-sm" style={{ width, height }}>
      <canvas ref={canvasRef} style={{ width, height, display: "block" }} aria-label={`Page ${pageNumber}`} role="img" />
      {!rendered && <span className="absolute inset-0 flex items-center justify-center text-sm text-muted">Page {pageNumber}</span>}
    </div>
  );
}
