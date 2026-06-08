import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { listSessions } from "@/lib/sessions";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/login");

  const sessions = await listSessions();

  return (
    <div className="min-h-screen bg-(--color-canvas)">
      <div className="border-b border-(--color-border-default) bg-(--color-canvas-subtle)">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold">PR Review Sessions</h1>
          <Link
            href="/admin/new"
            className="inline-flex items-center gap-2 rounded-md bg-(--color-success-emphasis) px-3 py-1.5 text-sm font-medium text-white hover:bg-(--color-success)"
          >
            <Plus size={16} />
            New session
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1080px] px-6 py-8">
        {sessions.length === 0 ? (
          <div className="rounded-md border border-dashed border-(--color-border-default) p-12 text-center">
            <p className="text-(--color-fg-muted)">No sessions yet.</p>
            <Link
              href="/admin/new"
              className="mt-3 inline-block text-sm text-(--color-accent) hover:underline"
            >
              Create the first one →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-(--color-border-default) overflow-hidden rounded-md border border-(--color-border-default)">
            {sessions.map((s) => {
              const submitted = Boolean(s.submittedAt);
              return (
                <li key={s.id} className="bg-(--color-canvas-subtle)">
                  <Link
                    href={`/admin/${s.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-(--color-canvas)"
                  >
                    <div className="flex items-center gap-3">
                      {submitted ? (
                        <CheckCircle2 size={16} className="text-(--color-success)" />
                      ) : (
                        <Circle size={16} className="text-(--color-fg-muted)" />
                      )}
                      <div>
                        <div className="font-medium text-(--color-fg-default)">
                          {s.candidateName}
                        </div>
                        <div className="text-xs text-(--color-fg-muted)">
                          Created {new Date(s.createdAt).toLocaleString()}
                          {submitted && (
                            <>
                              {" · "}
                              Submitted {new Date(s.submittedAt!).toLocaleString()}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-(--color-fg-muted)">
                      {s.comments.length} comment{s.comments.length === 1 ? "" : "s"}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
