import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createSession } from "@/lib/sessions";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { candidateName } = (await req.json()) as { candidateName?: string };
  if (!candidateName || !candidateName.trim()) {
    return NextResponse.json({ error: "candidateName required" }, { status: 400 });
  }
  const session = await createSession(candidateName.trim());
  return NextResponse.json({ id: session.id, token: session.token });
}
