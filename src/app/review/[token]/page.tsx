import { notFound, redirect } from "next/navigation";
import { ReviewClient } from "@/components/ReviewClient";
import { pullRequest } from "@/lib/pr-data";
import { getSessionByToken } from "@/lib/sessions";

type Props = { params: Promise<{ token: string }> };

export default async function ReviewPage({ params }: Props) {
  const { token } = await params;
  const session = await getSessionByToken(token);
  if (!session) notFound();
  if (session.submittedAt) {
    redirect(`/review/${token}/submitted`);
  }
  return <ReviewClient pr={pullRequest} session={session} />;
}
