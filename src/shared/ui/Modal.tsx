"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Native modal provides focus trapping, Escape handling, and focus restoration. */
export function Modal({ title, children, onClose, busy = false, wide = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog?.showModal();
    return () => { dialog?.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, []);
  return <dialog ref={ref} aria-label={title} aria-busy={busy} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} onClick={(event) => { if (!busy && event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }} className={`fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-border bg-panel p-6 text-fg shadow-overlay backdrop:bg-black/45 backdrop:backdrop-blur-sm sm:p-7 ${wide ? "max-w-2xl" : "max-w-[550px]"}`}>
    <div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-xl font-semibold tracking-tight">{title}</h2><Button variant="ghost" size="icon-sm" aria-label="Close dialog" disabled={busy} onClick={onClose}><X className="size-5" /></Button></div>
    {children}
  </dialog>;
}
