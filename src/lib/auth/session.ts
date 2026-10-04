import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { ObjectId } from "mongodb";
import { cookies, headers } from "next/headers";
import { collection } from "@/db";
import {
  SESSION_COOKIE,
  SESSION_TOKEN_PATTERN,
  SESSION_TTL_SECONDS,
} from "./constants";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Starts a new session for the user and sets the session cookie. */
export async function createSession(userId: ObjectId) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
  const userAgent = (await headers()).get("user-agent")?.slice(0, 300) ?? null;

  const sessions = await collection("sessions");
  await sessions.insertOne({
    _id: hashToken(token),
    userId,
    expiresAt,
    createdAt: now,
    userAgent,
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** The current, unexpired session record, or null. */
export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !SESSION_TOKEN_PATTERN.test(token)) return null;

  const sessions = await collection("sessions");
  return sessions.findOne({
    _id: hashToken(token),
    expiresAt: { $gt: new Date() },
  });
}

/** Signs out the current browser. */
export async function deleteCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && SESSION_TOKEN_PATTERN.test(token)) {
    const sessions = await collection("sessions");
    await sessions.deleteOne({ _id: hashToken(token) });
  }
  store.delete(SESSION_COOKIE);
}

/** Signs a user out everywhere (e.g. after deactivation). */
export async function revokeUserSessions(userId: ObjectId) {
  const sessions = await collection("sessions");
  await sessions.deleteMany({ userId });
}
