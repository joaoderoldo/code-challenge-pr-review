import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "pr_review_admin";

const sign = (value: string): string => {
  const secret = process.env.ADMIN_PASSWORD ?? "";
  return createHmac("sha256", secret).update(value).digest("hex");
};

const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
};

export const checkPassword = (password: string): boolean => {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(password, expected);
};

export const issueAdminCookie = async (): Promise<void> => {
  const jar = await cookies();
  jar.set(COOKIE_NAME, sign("admin"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const clearAdminCookie = async (): Promise<void> => {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
};

export const isAdmin = async (): Promise<boolean> => {
  const jar = await cookies();
  const cookie = jar.get(COOKIE_NAME);
  if (!cookie) return false;
  return safeEqual(cookie.value, sign("admin"));
};
