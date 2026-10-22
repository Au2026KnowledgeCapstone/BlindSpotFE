"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const SEED_COMMENTS = [
  "Investigating the POST /api/orders 500 on staging.",
  "Order service container restarted at 09:42 UTC.",
];

function CommentList({ comments }: { comments: string[] }) {
  return (
    <ul className="space-y-2 list-none">
      {comments.map((comment, idx) => (
        <li
          key={`${idx}-${comment.slice(0, 12)}`}
          className="p-3 rounded-lg border border-subtle bg-raised text-xs text-fg space-y-1"
        >
          <span className="block text-[11px] font-semibold text-fg-tertiary">
            Engineer
          </span>
          <span className="block">{comment}</span>
        </li>
      ))}
    </ul>
  );
}

function CommentForm({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [draft, setDraft] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSubmit(text);
    setDraft("");
  };

  return (
    <form onSubmit={submit} className="space-y-2 pt-2 border-t border-subtle">
      <label htmlFor="run-comment" className="block text-[11px] text-fg-tertiary">
        Add a comment
      </label>
      <textarea
        id="run-comment"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        className="w-full p-2.5 rounded-md border border-border bg-inset text-xs text-fg focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50 resize-none"
      />
      <Button type="submit" size="sm">
        Post comment
      </Button>
    </form>
  );
}

export function DiscussionTab() {
  const [comments, setComments] = useState<string[]>(SEED_COMMENTS);
  const handleAdd = (text: string) => setComments((prev) => [...prev, text]);

  return (
    <div className="space-y-4">
      <CommentList comments={comments} />
      <CommentForm onSubmit={handleAdd} />
    </div>
  );
}
