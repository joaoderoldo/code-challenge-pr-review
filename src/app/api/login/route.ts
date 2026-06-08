import { NextResponse } from "next/server";
import { checkPassword, issueAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };
  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: "invalid password" }, { status: 401 });
  }
  await issueAdminCookie();
  return NextResponse.json({ ok: true });
}
