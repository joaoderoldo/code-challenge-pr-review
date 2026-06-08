"use client";

import { Trash2 } from "lucide-react";
import type { Comment } from "@/types";

type Props = {
  comment: Comment;
  candidateName: string;
  onDelete?: () => void;
  readOnly?: boolean;
};

const timeAgo = (iso: string): string => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const CommentBox = ({ comment, candidateName, onDelete, readOnly }: Props) => {
  return (
    <div className="rounded-md border border-(--color-border-default) bg-(--color-canvas-subtle)">
      <div className="flex items-center justify-between border-b border-(--color-border-default) px-3 py-2">
        <div className="text-xs text-(--color-fg-muted)">
          <span className="font-medium text-(--color-fg-default)">{candidateName}</span>{" "}
          commented {timeAgo(comment.createdAt)}
        </div>
        {!readOnly && onDelete && (
          <button
            onClick={onDelete}
            className="text-(--color-fg-muted) transition-colors hover:text-(--color-danger)"
            aria-label="Delete comment"
            title="Delete comment"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="whitespace-pre-wrap px-3 py-2 text-sm text-(--color-fg-default)">
        {comment.body}
      </div>
    </div>
  );
};
