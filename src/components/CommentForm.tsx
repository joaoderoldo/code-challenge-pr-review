"use client";

import { useState } from "react";

type Props = {
  onSubmit: (body: string) => Promise<void> | void;
  onCancel: () => void;
  autoFocus?: boolean;
};

export const CommentForm = ({ onSubmit, onCancel, autoFocus = true }: Props) => {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(body.trim());
      setBody("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-(--color-border-default) bg-(--color-canvas-subtle) p-3"
    >
      <textarea
        autoFocus={autoFocus}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Leave a comment..."
        rows={3}
        className="w-full resize-y rounded border border-(--color-border-default) bg-(--color-canvas) px-3 py-2 text-sm text-(--color-fg-default) outline-none focus:border-(--color-accent)"
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-(--color-border-default) bg-transparent px-3 py-1 text-xs text-(--color-fg-default) hover:bg-(--color-canvas-subtle)"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!body.trim() || submitting}
          className="rounded bg-(--color-success-emphasis) px-3 py-1 text-xs font-medium text-white hover:bg-(--color-success)"
        >
          {submitting ? "Adding..." : "Add comment"}
        </button>
      </div>
    </form>
  );
};
