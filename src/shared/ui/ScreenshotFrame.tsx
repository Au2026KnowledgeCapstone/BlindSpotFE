import React, { useState } from "react";
import { Monitor } from "lucide-react";

export interface ScreenshotFrameProps {
  url?: string;
  beforeSrc?: string;
  afterSrc?: string;
  clickPoint?: { x: number; y: number };
  alt?: string;
  className?: string;
}

interface ChromeHeaderProps {
  url: string;
  beforeSrc?: string;
  afterSrc?: string;
  view: "after" | "before";
  setView: (v: "after" | "before") => void;
}

const ChromeHeader: React.FC<ChromeHeaderProps> = ({ url, beforeSrc, afterSrc, view, setView }) => {
  const hasBoth = Boolean(beforeSrc && afterSrc);
  return (
    <div
      style={{ backgroundColor: "var(--bs-bg-panel)", borderColor: "var(--bs-border-subtle)" }}
      className="flex items-center justify-between gap-2 px-3 py-1.5 border-b text-[11px] text-[var(--bs-text-tertiary)] select-none"
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--bs-fail)] opacity-80" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--bs-warn)] opacity-80" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--bs-pass)] opacity-80" />
        </div>
        <div className="flex items-center gap-1 pl-2 font-mono truncate text-[11px] text-[var(--bs-text-secondary)]">
          <Monitor className="w-3 h-3 shrink-0" />
          <span className="truncate">{url}</span>
        </div>
      </div>
      {hasBoth && (
        <div className="flex items-center gap-0.5 p-0.5 rounded bg-[var(--bs-bg-raised)] border border-[var(--bs-border-subtle)] text-[10px]">
          <button
            type="button"
            onClick={() => setView("before")}
            className={`px-1.5 py-0.5 rounded ${view === "before" ? "bg-[var(--bs-bg-overlay)] text-[var(--bs-text-primary)] font-medium" : "text-[var(--bs-text-tertiary)]"}`}
          >
            Before
          </button>
          <button
            type="button"
            onClick={() => setView("after")}
            className={`px-1.5 py-0.5 rounded ${view === "after" ? "bg-[var(--bs-bg-overlay)] text-[var(--bs-text-primary)] font-medium" : "text-[var(--bs-text-tertiary)]"}`}
          >
            After
          </button>
        </div>
      )}
    </div>
  );
};

const ClickMarker: React.FC<{ point: { x: number; y: number } }> = ({ point }) => (
  <>
    <div
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
      className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-[var(--bs-fail)] bg-[var(--bs-fail-tint)] animate-ping pointer-events-none"
    />
    <div
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
      className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-[var(--bs-fail)] border border-white shadow-sm pointer-events-none"
    />
  </>
);

const ScreenshotContent: React.FC<{ src?: string; alt: string; clickPoint?: { x: number; y: number } }> = ({ src, alt, clickPoint }) => {
  if (!src) {
    return <div className="text-[12px] text-[var(--bs-text-tertiary)] font-mono py-12">No screenshot available</div>;
  }
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img src={src} alt={alt} className="max-w-full max-h-full object-contain" />
      {clickPoint && <ClickMarker point={clickPoint} />}
    </div>
  );
};

const resolveSource = (view: "after" | "before", beforeSrc?: string, afterSrc?: string): string | undefined => {
  if (view === "before") return beforeSrc || afterSrc;
  return afterSrc || beforeSrc;
};

export const ScreenshotFrame: React.FC<ScreenshotFrameProps> = ({
  url = "https://app.example.com",
  beforeSrc,
  afterSrc,
  clickPoint,
  alt = "Test step screenshot",
  className = "",
}) => {
  const [view, setView] = useState<"after" | "before">("after");
  const finalSrc = resolveSource(view, beforeSrc, afterSrc);

  const headerProps = {
    url,
    ...(beforeSrc !== undefined ? { beforeSrc } : {}),
    ...(afterSrc !== undefined ? { afterSrc } : {}),
    view,
    setView,
  };

  const contentProps = {
    ...(finalSrc !== undefined ? { src: finalSrc } : {}),
    alt,
    ...(clickPoint !== undefined ? { clickPoint } : {}),
  };

  return (
    <div
      style={{ backgroundColor: "var(--bs-bg-inset)", borderColor: "var(--bs-border-default)" }}
      className={`rounded-xl border overflow-hidden flex flex-col ${className}`}
    >
      <ChromeHeader {...headerProps} />
      <div className="relative flex-1 bg-[var(--bs-bg-canvas)] flex items-center justify-center min-h-[200px] overflow-hidden">
        <ScreenshotContent {...contentProps} />
      </div>
    </div>
  );
};
