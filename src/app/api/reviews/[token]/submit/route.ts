import { NextResponse } from "next/server";
import { submitSession } from "@/lib/sessions";

type Params = { params: Promise<{ token: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { token } = await params;
  const { summary } = (await req.json()) as { summary?: string };
  const session = await submitSession(token, summary ?? "");
  if (!session) {
    return NextResponse.json({ error: "not found or already submitted" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
