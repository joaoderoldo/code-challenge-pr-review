import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getSessionByToken } from "@/lib/sessions";

type Props = { params: Promise<{ token: string }> };

export default async function SubmittedPage({ params }: Props) {
  const { token } = await params;
  const session = await getSessionByToken(token);
  if (!session) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-canvas) px-4">
      <div className="w-full max-w-md rounded-lg border border-(--color-border-default) bg-(--color-canvas-subtle) p-8 text-center">
        <CheckCircle2 size={48} className="mx-auto text-(--color-success)" />
        <h1 className="mt-4 text-xl font-semibold">Review submitted</h1>
        <p className="mt-2 text-sm text-(--color-fg-muted)">
          Thank you, <span className="font-medium text-(--color-fg-default)">{session.candidateName}</span>.
          Your review has been received. You can safely close this tab.
        </p>
        <p className="mt-4 text-xs text-(--color-fg-subtle)">
          {session.comments.length} comment{session.comments.length === 1 ? "" : "s"} submitted
          {session.submittedAt && (
            <> on {new Date(session.submittedAt).toLocaleString()}</>
          )}
        </p>
      </div>
    </div>
  );
}
