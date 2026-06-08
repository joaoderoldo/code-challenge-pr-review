"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Comment, PullRequest, Session } from "@/types";
import { PRHeader } from "./PRHeader";
import { FileDiff } from "./FileDiff";

type Props = {
  pr: PullRequest;
  session: Session;
};

export const ReviewClient = ({ pr, session }: Props) => {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(session.comments);
  const [showSubmit, setShowSubmit] = useState(false);
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddComment = async (filePath: string, lineNumber: number, body: string) => {
    setError(null);
    const res = await fetch(`/api/reviews/${session.token}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath, lineNumber, body }),
    });
    if (!res.ok) {
      setError("Failed to save the comment. Please retry.");
      return;
    }
    const { comment } = (await res.json()) as { comment: Comment };
    setComments((prev) => [...prev, comment]);
  };

  const handleDeleteComment = async (commentId: string) => {
    setError(null);
    const res = await fetch(`/api/reviews/${session.token}/comments/${commentId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Failed to delete the comment.");
      return;
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/reviews/${session.token}/submit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary }),
    });
    if (!res.ok) {
      setError("Failed to submit the review.");
      setSubmitting(false);
      return;
    }
    router.push(`/review/${session.token}/submitted`);
  };

  return (
    <div className="min-h-screen bg-(--color-canvas)">
      <div className="border-b border-(--color-border-default) bg-(--color-canvas-subtle)">
        <div className="mx-auto max-w-[1280px] px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-(--color-fg-muted)">Reviewing as </span>
              <span className="font-medium text-(--color-fg-default)">{session.candidateName}</span>
            </div>
            <div className="text-xs text-(--color-fg-muted)">
              {comments.length} comment{comments.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </div>

      <PRHeader pr={pr} />

      <div className="mx-auto max-w-[1280px] px-6 py-6">
        {error && (
          <div className="mb-4 rounded-md border border-(--color-danger) bg-red-900/20 px-4 py-2 text-sm text-(--color-danger)">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {pr.files.map((file) => (
            <FileDiff
              key={file.path}
              file={file}
              comments={comments}
              candidateName={session.candidateName}
              readOnly={false}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
            />
          ))}
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            onClick={() => setShowSubmit(true)}
            className="inline-flex items-center gap-2 rounded-md bg-(--color-success-emphasis) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-success)"
          >
            <CheckCircle2 size={16} />
            Finish review
          </button>
        </div>
      </div>

      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-lg border border-(--color-border-default) bg-(--color-canvas-subtle) p-6">
            <h2 className="text-lg font-semibold">Submit your review</h2>
            <p className="mt-2 text-sm text-(--color-fg-muted)">
              You can leave a final summary of your review. Once you submit, your comments are
              locked.
            </p>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={5}
              placeholder="Overall summary (optional). Example: bugs found, concerns, suggestions."
              className="mt-4 w-full resize-y rounded border border-(--color-border-default) bg-(--color-canvas) px-3 py-2 text-sm text-(--color-fg-default) outline-none focus:border-(--color-accent)"
            />
            <div className="mt-2 rounded border border-yellow-700/40 bg-yellow-900/15 px-3 py-2 text-xs text-yellow-200">
              ⚠️ After submitting you cannot edit your review.
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSubmit(false)}
                disabled={submitting}
                className="rounded border border-(--color-border-default) bg-transparent px-3 py-1.5 text-sm text-(--color-fg-default) hover:bg-(--color-canvas)"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded bg-(--color-success-emphasis) px-3 py-1.5 text-sm font-medium text-white hover:bg-(--color-success)"
              >
                {submitting ? "Submitting..." : "Submit review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
