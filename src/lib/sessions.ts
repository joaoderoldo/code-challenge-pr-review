import { nanoid } from "nanoid";
import { db } from "./db";
import type { Comment, Session } from "@/types";

const SESSIONS_INDEX = "sessions:index";

const sessionKey = (id: string) => `session:${id}`;
const tokenKey = (token: string) => `token:${token}`;

export const createSession = async (candidateName: string): Promise<Session> => {
  const id = nanoid(10);
  const token = nanoid(24);
  const session: Session = {
    id,
    token,
    candidateName,
    createdAt: new Date().toISOString(),
    comments: [],
  };
  await db.set(sessionKey(id), session);
  await db.set(tokenKey(token), id);
  await db.sadd(SESSIONS_INDEX, id);
  return session;
};

export const getSession = async (id: string): Promise<Session | null> => {
  return await db.get<Session>(sessionKey(id));
};

export const getSessionByToken = async (token: string): Promise<Session | null> => {
  const id = await db.get<string>(tokenKey(token));
  if (!id) return null;
  return await getSession(id);
};

export const listSessions = async (): Promise<Session[]> => {
  const ids = await db.smembers(SESSIONS_INDEX);
  const sessions = await Promise.all(ids.map((id) => getSession(id)));
  return sessions
    .filter((s): s is Session => Boolean(s))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const addComment = async (
  token: string,
  filePath: string,
  lineNumber: number,
  body: string
): Promise<Comment | null> => {
  const session = await getSessionByToken(token);
  if (!session || session.submittedAt) return null;
  const comment: Comment = {
    id: nanoid(10),
    filePath,
    lineNumber,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  session.comments.push(comment);
  await db.set(sessionKey(session.id), session);
  return comment;
};

export const deleteComment = async (token: string, commentId: string): Promise<boolean> => {
  const session = await getSessionByToken(token);
  if (!session || session.submittedAt) return false;
  const idx = session.comments.findIndex((c) => c.id === commentId);
  if (idx === -1) return false;
  session.comments.splice(idx, 1);
  await db.set(sessionKey(session.id), session);
  return true;
};

export const submitSession = async (
  token: string,
  summary: string
): Promise<Session | null> => {
  const session = await getSessionByToken(token);
  if (!session || session.submittedAt) return null;
  session.submittedAt = new Date().toISOString();
  session.summary = summary.trim() || undefined;
  await db.set(sessionKey(session.id), session);
  return session;
};
