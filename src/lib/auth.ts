import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sessions, users, type SessionUser } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

export const SESSION_COOKIE = "funoon_session";
const SESSION_DAYS = 30;

/* ------------------------------ كلمات المرور ------------------------------ */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const reference = Buffer.from(hash, "hex");
  return candidate.length === reference.length && timingSafeEqual(candidate, reference);
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/* ------------------------------ الجلسات ------------------------------ */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      level: users.level,
      artType: users.artType,
      bio: users.bio,
      phone: users.phone,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return row;
}

/** يعيد المستخدم ويتحقق من عدم حظره */
export async function getActiveUser(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const row = await db.select({ banned: users.banned }).from(users).where(eq(users.id, user.id)).limit(1);
  if (row[0]?.banned) {
    await destroySession();
    return null;
  }
  return user;
}

export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getActiveUser();
  if (!user) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getActiveUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}
