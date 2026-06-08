"use client";

import { Plus } from "lucide-react";
import { type ReactNode } from "react";
import type { DiffLine as DiffLineType } from "@/types";

type Props = {
  line: DiffLineType;
  filePath: string;
  onAddComment?: (lineNumber: number) => void;
  hasComments?: boolean;
  children?: ReactNode;
};

export const DiffLine = ({ line, onAddComment, hasComments, children }: Props) => {
  if (line.type === "hunk") {
    return (
      <div className="flex bg-(--color-hunk-bg) text-(--color-fg-muted)">
        <div className="w-24 shrink-0" />
        <div className="flex-1 px-3 py-1 diff-line">{line.content}</div>
      </div>
    );
  }

  const isAddition = line.type === "addition";
  const isDeletion = line.type === "deletion";
  const newLine = "newLine" in line ? line.newLine : undefined;
  const oldLine = "oldLine" in line ? line.oldLine : undefined;

  const lineBg = isAddition
    ? "bg-(--color-add-bg)"
    : isDeletion
      ? "bg-(--color-del-bg)"
      : "";
  const numberBg = isAddition
    ? "bg-(--color-add-line-bg)"
    : isDeletion
      ? "bg-(--color-del-line-bg)"
      : "";
  const sign = isAddition ? "+" : isDeletion ? "−" : " ";

  const targetLine = newLine ?? oldLine;
  const canComment = onAddComment && targetLine !== undefined && !isDeletion;

  return (
    <>
      <div className={`group flex ${lineBg}`}>
        <div className={`flex w-24 shrink-0 select-none ${numberBg}`}>
          <div className="w-10 px-2 text-right text-(--color-fg-subtle) diff-line">
            {oldLine ?? ""}
          </div>
          <div className="w-10 px-2 text-right text-(--color-fg-subtle) diff-line">
            {newLine ?? ""}
          </div>
          <div className="relative w-4 text-center">
            {canComment && (
              <button
                onClick={() => onAddComment!(targetLine!)}
                className="absolute left-0 top-0 flex h-5 w-4 items-center justify-center rounded-sm bg-(--color-accent-emphasis) text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                aria-label={`Comment on line ${targetLine}`}
                title="Add comment"
              >
                <Plus size={10} strokeWidth={3} />
              </button>
            )}
            {hasComments && !canComment && (
              <span className="text-(--color-accent) diff-line">●</span>
            )}
            {hasComments && canComment && (
              <span className="text-(--color-accent) diff-line group-hover:hidden">●</span>
            )}
          </div>
        </div>
        <div className="flex-1 px-3 py-0 whitespace-pre diff-line">
          <span className="select-none text-(--color-fg-muted)">{sign} </span>
          {line.content}
        </div>
      </div>
      {children}
    </>
  );
};
