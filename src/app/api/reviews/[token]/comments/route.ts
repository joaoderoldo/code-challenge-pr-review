import { NextResponse } from "next/server";
import { addComment, getSessionByToken } from "@/lib/sessions";

type Params = { params: Promise<{ token: string }> };

export async function POST(req: Request, { params }: Params) {
  const { token } = await params;
  const session = await getSessionByToken(token);
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (session.submittedAt) {
    return NextResponse.json({ error: "already submitted" }, { status: 409 });
  }
  const body = (await req.json()) as {
    filePath?: string;
    lineNumber?: number;
    body?: string;
  };
  if (!body.filePath || typeof body.lineNumber !== "number" || !body.body?.trim()) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  const comment = await addComment(token, body.filePath, body.lineNumber, body.body);
  if (!comment) return NextResponse.json({ error: "failed" }, { status: 500 });
  return NextResponse.json({ comment });
}
