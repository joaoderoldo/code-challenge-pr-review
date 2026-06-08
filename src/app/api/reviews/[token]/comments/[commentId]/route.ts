import { NextResponse } from "next/server";
import { deleteComment } from "@/lib/sessions";

type Params = { params: Promise<{ token: string; commentId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { token, commentId } = await params;
  const ok = await deleteComment(token, commentId);
  if (!ok) return NextResponse.json({ error: "not found or already submitted" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
