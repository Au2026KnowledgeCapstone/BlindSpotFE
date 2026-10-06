"use client";

import React, { useState } from "react";

const SEED_COMMENTS = [
  "Investigating the POST /api/orders 500 on staging.",
  "Order service container restarted at 09:42 UTC.",
];

export function DiscussionTab() {
  const [comments, setComments] = useState<string[]>(SEED_COMMENTS);
  const [draft, setDraft] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setComments((prev) => [...prev, text]);
    setDraft("");
  };

  return (
    <div className="space-y-4">
      <ul className="space-y-2 list-none">
        {comments.map((comment, idx) => (
          <li
            key={`${idx}-${comment.slice(0, 12)}`}
            className="p-3 rounded-lg border border-[var(--bs-border-subtle)] bg-[var(--bs-bg-raised)] text-xs text-[var(--bs-text-primary)] space-y-1"
          >
            <span className="block text-[10px] font-semibold text-[var(--bs-text-tertiary)]">
              Engineer
            </span>
            <span className="block">{comment}</span>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="space-y-2 pt-2 border-t border-[var(--bs-border-subtle)]">
        <label htmlFor="run-comment" className="block text-[11px] text-[var(--bs-text-tertiary)]">
          Add a comment
        </label>
        <textarea
          id="run-comment"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="w-full p-2.5 rounded-md border border-[var(--bs-border-default)] bg-[var(--bs-bg-inset)] text-xs text-[var(--bs-text-primary)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--bs-focus-ring)] resize-none"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bs-accent-solid)] text-white hover:bg-[var(--bs-accent-solid-hover)] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--bs-focus-ring)]"
        >
          Post comment
        </button>
      </form>
    </div>
  );
}
