import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "autobrand_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  sub: string;
  exp: number;
};

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? "local-development-secret";
}

export function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function signPayload(payload: string) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(payload: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

    if (
      typeof parsed?.sub !== "string" ||
      typeof parsed?.exp !== "number" ||
      parsed.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function verifySessionCookie(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");

  if (!payload || !signature || !safeEqual(signPayload(payload), signature)) {
    return null;
  }

  return decodePayload(payload);
}

export function verifyCredentials(username: string, password: string) {
  const expectedUsername = process.env.APP_USERNAME ?? "admin";
  const expectedPassword = process.env.APP_PASSWORD ?? "autobrand";

  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export async function createSession(username: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = encodePayload({ sub: username, exp: expiresAt });
  const signature = signPayload(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const payload = verifySessionCookie(cookieStore.get(SESSION_COOKIE)?.value);

  if (!payload) {
    return null;
  }

  return {
    username: payload.sub,
  };
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function assertSession() {
  const session = await getSession();

  if (!session) {
    throw new UnauthorizedError();
  }

  return session;
}
