"use client";

import { useRef, useState } from "react";
import { Download, Link2, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Run, Result } from "./types";
import { buildReport, reportUrl } from "./report";

export function ShareReport({ run, results }: { run: Run; results: Result[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const open = () => { setUrl(reportUrl(window.location.origin, run)); setMessage(""); dialog.current?.showModal(); };
  async function copy() {
    try { await navigator.clipboard.writeText(url); setMessage("Link copied. Teammates need access to this project."); }
    catch { setMessage("Copy unavailable. Select and copy the link below."); }
  }
  function download() {
    try {
      const objectUrl = URL.createObjectURL(new Blob([buildReport(run, results)], { type: "text/html;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `blindspot-run-${run.runNumber}-report.html`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setMessage("Report downloaded. Open it in your browser to read or print to PDF.");
    } catch { setMessage("Download failed. Please try again."); }
  }
  return <>
    <Button onClick={open}><Share2 aria-hidden className="size-4" />Share Report</Button>
    <dialog ref={dialog} aria-labelledby="share-report-title" className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-panel p-6 text-fg shadow-overlay backdrop:bg-black/60">
      <div className="flex items-start justify-between gap-4"><div><h2 id="share-report-title" className="text-xl font-semibold">Share report</h2><p className="mt-2 text-sm text-fg-secondary">Bring your team up to speed on run #{run.runNumber}.</p></div><Button variant="ghost" size="icon" aria-label="Close sharing" onClick={() => dialog.current?.close()}><X className="size-4" /></Button></div>
      <div className="my-6 space-y-3"><label htmlFor="report-link" className="text-sm font-medium">Report link</label><input id="report-link" readOnly value={url} onFocus={(event) => event.target.select()} className="w-full rounded-lg border border-border bg-inset p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus-ring" /><p className="text-xs leading-relaxed text-fg-tertiary">Only signed-in members with access to this project can open the link. It always shows the latest available results.</p></div>
      <div className="flex flex-wrap gap-3"><Button variant="outline" onClick={() => void copy()}><Link2 className="size-4" aria-hidden />Copy link</Button><Button variant="outline" onClick={download}><Download className="size-4" aria-hidden />Download report</Button></div>
      <p className="mt-4 text-xs leading-relaxed text-fg-tertiary">The download is a standalone HTML snapshot. Open it and choose Print → Save as PDF for a PDF copy.</p>
      <p role="status" className="mt-3 text-sm text-accent">{message}</p>
    </dialog>
  </>;
}
