import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Lightbulb,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getSession } from "@/lib/sessions";
import { pullRequest } from "@/lib/pr-data";
import { BUGS, findBugForLine, severityColor } from "@/lib/bugs";

type Props = { params: Promise<{ id: string }> };

export default async function AdminSessionPage({ params }: Props) {
  if (!(await isAdmin())) redirect("/login");

  const { id } = await params;
  const session = await getSession(id);
  if (!session) notFound();

  const submitted = Boolean(session.submittedAt);

  const commentsByFile = session.comments.reduce<Map<string, typeof session.comments>>(
    (map, c) => {
      const list = map.get(c.filePath) ?? [];
      list.push(c);
      map.set(c.filePath, list);
      return map;
    },
    new Map()
  );

  const matchedBugIds = new Set<string>();
  for (const c of session.comments) {
    const bug = findBugForLine(c.filePath, c.lineNumber);
    if (bug) matchedBugIds.add(bug.id);
  }

  const getLineContent = (filePath: string, lineNumber: number): string | undefined => {
    const file = pullRequest.files.find((f) => f.path === filePath);
    if (!file) return undefined;
    for (const line of file.lines) {
      if (line.type === "addition" && line.newLine === lineNumber) return line.content;
      if (line.type === "context" && line.newLine === lineNumber) return line.content;
    }
    return undefined;
  };

  return (
    <div className="min-h-screen bg-(--color-canvas)">
      <div className="mx-auto max-w-[1080px] px-6 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-(--color-fg-muted) hover:text-(--color-fg-default)"
        >
          <ArrowLeft size={14} />
          Back to sessions
        </Link>

        <div className="mt-4 flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold">{session.candidateName}</h1>
          {submitted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-success-emphasis) px-3 py-1 text-xs text-white">
              <CheckCircle2 size={14} />
              Submitted
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border-default) px-3 py-1 text-xs text-(--color-fg-muted)">
              <Clock size={14} />
              In progress
            </span>
          )}
        </div>

        <div className="mt-2 text-sm text-(--color-fg-muted)">
          Created {new Date(session.createdAt).toLocaleString()}
          {submitted && <> · Submitted {new Date(session.submittedAt!).toLocaleString()}</>}
        </div>

        <section className="mt-6 rounded-md border border-(--color-border-default) bg-(--color-canvas-subtle) p-4">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-(--color-fg-muted)">
              <Sparkles size={14} />
              Bug detection
            </h2>
            <span className="text-sm text-(--color-fg-muted)">
              <span className="font-semibold text-(--color-fg-default)">
                {matchedBugIds.size}
              </span>{" "}
              of {BUGS.length} bug lines flagged
            </span>
          </header>
          <ul className="grid gap-2 sm:grid-cols-2">
            {BUGS.map((bug) => {
              const found = matchedBugIds.has(bug.id);
              return (
                <li
                  key={bug.id}
                  className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                    found
                      ? "border-(--color-success-emphasis)/60 bg-(--color-success-emphasis)/10"
                      : "border-(--color-border-default) bg-(--color-canvas)"
                  }`}
                >
                  {found ? (
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-(--color-success)"
                    />
                  ) : (
                    <Circle size={16} className="mt-0.5 shrink-0 text-(--color-fg-subtle)" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          found
                            ? "font-medium text-(--color-fg-default)"
                            : "text-(--color-fg-muted)"
                        }
                      >
                        {bug.label}
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-xs ${severityColor(bug.severity)}`}
                      >
                        {bug.severity}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-(--color-fg-subtle) mono">
                      {bug.filePath}:{bug.primaryLine}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-(--color-fg-subtle)">
            Line matching is automatic — the comment&apos;s wording still needs your
            review to confirm the candidate explained the root cause correctly.
          </p>
        </section>

        {session.summary && (
          <div className="mt-6 rounded-md border border-(--color-border-default) bg-(--color-canvas-subtle) p-4">
            <h2 className="mb-2 text-sm font-semibold text-(--color-fg-muted)">Final summary</h2>
            <p className="whitespace-pre-wrap text-sm text-(--color-fg-default)">
              {session.summary}
            </p>
          </div>
        )}

        <h2 className="mt-8 flex items-center gap-2 text-sm font-semibold text-(--color-fg-muted)">
          <MessageSquare size={14} />
          {session.comments.length} comment{session.comments.length === 1 ? "" : "s"}
        </h2>

        {session.comments.length === 0 ? (
          <p className="mt-4 text-sm text-(--color-fg-muted)">
            No comments yet. The candidate may not have started, or may not have found any
            issue.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-6">
            {Array.from(commentsByFile.entries()).map(([filePath, comments]) => (
              <section
                key={filePath}
                className="rounded-md border border-(--color-border-default) bg-(--color-canvas-subtle)"
              >
                <div className="border-b border-(--color-border-default) px-4 py-2 mono text-sm font-medium">
                  {filePath}
                </div>
                <div className="flex flex-col divide-y divide-(--color-border-default)">
                  {comments
                    .sort((a, b) => a.lineNumber - b.lineNumber)
                    .map((c) => {
                      const lineContent = getLineContent(filePath, c.lineNumber);
                      const bug = findBugForLine(filePath, c.lineNumber);
                      return (
                        <div
                          key={c.id}
                          className={
                            bug
                              ? "border-l-2 border-(--color-success) bg-(--color-success-emphasis)/5 px-4 py-3"
                              : "px-4 py-3"
                          }
                        >
                          <div className="mb-2 flex items-center gap-2 text-xs text-(--color-fg-muted)">
                            <span>Line {c.lineNumber}</span>
                            <span>·</span>
                            <span>{new Date(c.createdAt).toLocaleString()}</span>
                            {bug && (
                              <span
                                className={`ml-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${severityColor(bug.severity)}`}
                              >
                                <CheckCircle2 size={12} />
                                {bug.label}
                              </span>
                            )}
                          </div>
                          {lineContent && (
                            <pre
                              className={`mb-2 overflow-x-auto rounded border-l-2 px-3 py-1.5 diff-line text-(--color-fg-muted) ${
                                bug
                                  ? "border-(--color-success) bg-(--color-canvas)"
                                  : "border-(--color-accent) bg-(--color-canvas)"
                              }`}
                            >
                              {lineContent}
                            </pre>
                          )}
                          <div>
                            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--color-fg-subtle)">
                              Candidate answer
                            </div>
                            <p className="whitespace-pre-wrap text-sm text-(--color-fg-default)">
                              {c.body}
                            </p>
                          </div>
                          {bug && (
                            <div className="mt-3 rounded-md border border-(--color-success-emphasis)/40 bg-(--color-success-emphasis)/10 p-3">
                              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-(--color-success)">
                                <Lightbulb size={12} />
                                Expected answer
                              </div>
                              <p className="whitespace-pre-wrap text-sm text-(--color-fg-default)">
                                {bug.expectedAnswer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </section>
            ))}
          </div>
        )}

        {!submitted && (
          <div className="mt-8 rounded-md border border-yellow-700/40 bg-yellow-900/15 p-4 text-sm">
            <p className="text-yellow-200">
              This session has not been submitted yet. Share the link with the candidate:
            </p>
            <code className="mt-2 inline-block break-all rounded border border-(--color-border-default) bg-(--color-canvas) px-2 py-1 text-xs">
              /review/{session.token}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
