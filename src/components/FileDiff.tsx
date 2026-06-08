"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileCode2 } from "lucide-react";
import type { Comment, DiffFile } from "@/types";
import { CommentBox } from "./CommentBox";
import { CommentForm } from "./CommentForm";
import { DiffLine } from "./DiffLine";

type Props = {
  file: DiffFile;
  comments: Comment[];
  candidateName: string;
  readOnly: boolean;
  onAddComment: (filePath: string, lineNumber: number, body: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
};

const statusBadge = {
  added: { label: "added", className: "bg-(--color-success-emphasis) text-white" },
  modified: { label: "modified", className: "bg-(--color-accent-emphasis) text-white" },
  deleted: { label: "deleted", className: "bg-red-700 text-white" },
  renamed: { label: "renamed", className: "bg-yellow-700 text-white" },
};

export const FileDiff = ({
  file,
  comments,
  candidateName,
  readOnly,
  onAddComment,
  onDeleteComment,
}: Props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);

  const commentsByLine = comments.reduce<Map<number, Comment[]>>((map, c) => {
    if (c.filePath !== file.path) return map;
    const list = map.get(c.lineNumber) ?? [];
    list.push(c);
    map.set(c.lineNumber, list);
    return map;
  }, new Map());

  const badge = statusBadge[file.status];

  const handleAddComment = async (body: string) => {
    if (activeLine === null) return;
    await onAddComment(file.path, activeLine, body);
    setActiveLine(null);
  };

  return (
    <div className="rounded-md border border-(--color-border-default) bg-(--color-canvas)">
      <div className="flex items-center gap-2 border-b border-(--color-border-default) bg-(--color-canvas-subtle) px-4 py-2.5">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-(--color-fg-muted) hover:text-(--color-fg-default)"
          aria-label={collapsed ? "Expand file" : "Collapse file"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
        <FileCode2 size={16} className="text-(--color-fg-muted)" />
        <span className="flex-1 truncate font-medium mono text-(--color-fg-default)">
          {file.path}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs ${badge.className}`}>
          {badge.label}
        </span>
        <span className="text-xs text-(--color-success)">+{file.additions}</span>
        <span className="text-xs text-(--color-danger)">−{file.deletions}</span>
      </div>

      {!collapsed && (
        <div className="overflow-x-auto">
          {file.lines.map((line, idx) => {
            const lineNumber =
              line.type === "addition"
                ? line.newLine
                : line.type === "context"
                  ? line.newLine
                  : undefined;
            const lineComments = lineNumber ? commentsByLine.get(lineNumber) ?? [] : [];
            const isActive = activeLine !== null && activeLine === lineNumber;

            return (
              <DiffLine
                key={idx}
                line={line}
                filePath={file.path}
                hasComments={lineComments.length > 0}
                onAddComment={!readOnly && lineNumber !== undefined ? setActiveLine : undefined}
              >
                {(lineComments.length > 0 || isActive) && (
                  <div className="border-y border-(--color-border-default) bg-(--color-canvas-inset) px-12 py-3">
                    <div className="flex flex-col gap-2">
                      {lineComments.map((comment) => (
                        <CommentBox
                          key={comment.id}
                          comment={comment}
                          candidateName={candidateName}
                          readOnly={readOnly}
                          onDelete={() => onDeleteComment(comment.id)}
                        />
                      ))}
                      {isActive && !readOnly && (
                        <CommentForm
                          onSubmit={handleAddComment}
                          onCancel={() => setActiveLine(null)}
                        />
                      )}
                    </div>
                  </div>
                )}
              </DiffLine>
            );
          })}
        </div>
      )}
    </div>
  );
};
