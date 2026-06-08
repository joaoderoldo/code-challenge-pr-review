import { GitPullRequest } from "lucide-react";
import type { PullRequest } from "@/types";

export const PRHeader = ({ pr }: { pr: PullRequest }) => {
  const totalAdditions = pr.files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = pr.files.reduce((sum, f) => sum + f.deletions, 0);

  return (
    <div className="border-b border-(--color-border-default) bg-(--color-canvas) px-6 py-5">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold text-(--color-fg-default)">
            {pr.title}{" "}
            <span className="font-light text-(--color-fg-muted)">#{pr.number}</span>
          </h1>
        </div>

        <div className="mt-3 flex items-center gap-3 text-sm text-(--color-fg-muted)">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-success-emphasis) px-3 py-1 text-xs font-medium text-white">
            <GitPullRequest size={14} />
            Open
          </span>
          <span>
            <span className="font-medium text-(--color-fg-default)">{pr.author}</span> wants to
            merge into <code className="rounded bg-(--color-canvas-subtle) px-1.5 py-0.5 text-xs">{pr.baseBranch}</code>{" "}
            from <code className="rounded bg-(--color-canvas-subtle) px-1.5 py-0.5 text-xs">{pr.branch}</code>
          </span>
        </div>

        <div className="mt-5 flex items-center gap-4 text-xs text-(--color-fg-muted)">
          <span>
            <span className="font-medium text-(--color-fg-default)">{pr.files.length}</span>{" "}
            files changed
          </span>
          <span className="text-(--color-success)">+{totalAdditions}</span>
          <span className="text-(--color-danger)">−{totalDeletions}</span>
        </div>

        <div className="mt-5 rounded-md border border-(--color-border-default) bg-(--color-canvas-subtle) p-4">
          <div className="whitespace-pre-wrap text-sm text-(--color-fg-default)">
            {pr.description}
          </div>
        </div>
      </div>
    </div>
  );
};
