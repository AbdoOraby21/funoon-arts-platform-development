"use server";

import { redirect } from "next/navigation";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { otpCodes, users } from "@/db/schema";
import { ART_TYPES } from "@/lib/art";
import {
  createSession,
  destroySession,
  generateOtp,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export type AuthState = { error?: string; ok?: boolean; demoCode?: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNext(next: string | null): string {
  return next && next.startsWith("/") ? next : "/";
}

/* --------------------------------- دخول --------------------------------- */
export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !password) return { error: "أدخل البريد الإلكتروني وكلمة المرور." };

  const user = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return { error: "بيانات الدخول غير صحيحة." };
  }
  if (user.banned) return { error: "هذا الحساب محظور — تواصل مع إدارة فُنون." };

  await createSession(user.id);
  redirect(safeNext(next));
}

/* --------------------- تسجيل: الخطوة ١ — إرسال الكود --------------------- */
export async function registerStartAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const artType = String(formData.get("artType") ?? "painting");

  if (name.length < 2) return { error: "اكتب اسمًا صحيحًا (حرفان على الأقل)." };
  if (!EMAIL_RE.test(email)) return { error: "البريد الإلكتروني غير صالح." };
  if (phone.replace(/\D/g, "").length < 8) return { error: "رقم الهاتف غير صالح." };
  if (password.length < 6) return { error: "كلمة المرور ٦ أحرف على الأقل." };
  if (!ART_TYPES.some((t) => t.key === artType)) return { error: "اختر فنك الأقرب." };

  const existing = (await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1))[0];
  if (existing) return { error: "هذا البريد مسجّل بالفعل — جرّب تسجيل الدخول." };

  const code = generateOtp();
  await db.insert(otpCodes).values({
    phone,
    email,
    code,
    payload: { name, passwordHash: hashPassword(password), artType },
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // في وضع المعاينة (بدون مزوّد SMS) نعرض الكود للمستخدم مباشرة.
  return { ok: true, demoCode: code };
}

/* --------------------- تسجيل: الخطوة ٢ — تأكيد الكود --------------------- */
export async function verifyOtpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();
  const next = String(formData.get("next") ?? "/profile");

  if (!email || code.length !== 6) return { error: "أدخل كود التحقق المكوّن من ٦ أرقام.", ok: true };

  const row = (
    await db
      .select()
      .from(otpCodes)
      .where(and(eq(otpCodes.email, email), eq(otpCodes.code, code), eq(otpCodes.consumed, false), gt(otpCodes.expiresAt, new Date())))
      .orderBy(desc(otpCodes.id))
      .limit(1)
  )[0];

  if (!row?.payload) return { error: "الكود غير صحيح أو منتهي الصلاحية.", ok: true };

  await db
    .update(otpCodes)
    .set({ consumed: true })
    .where(eq(otpCodes.id, row.id));

  const created = (
    await db
      .insert(users)
      .values({
        name: row.payload.name,
        email: row.email,
        phone: row.phone,
        passwordHash: row.payload.passwordHash,
        artType: row.payload.artType,
        verified: true,
        role: "user",
      })
      .onConflictDoNothing()
      .returning()
  )[0];

  const user =
    created ??
    (await db.select().from(users).where(eq(users.email, row.email)).limit(1))[0];

  if (!user) return { error: "حدث خطأ أثناء إنشاء الحساب — حاول مجددًا.", ok: true };
  await createSession(user.id);
  redirect(safeNext(next));
}

/* ------------------------------ إعادة إرسال الكود ------------------------------ */
export async function resendOtpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const last = (
    await db.select().from(otpCodes).where(eq(otpCodes.email, email)).orderBy(desc(otpCodes.id)).limit(1)
  )[0];
  if (!last?.payload) return { error: "لا يوجد طلب تسجيل بهذا البريد.", ok: true };
  const code = generateOtp();
  await db.insert(otpCodes).values({
    phone: last.phone,
    email,
    code,
    payload: last.payload,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
  return { ok: true, demoCode: code };
}

/* ------------------------------ دخول Google (وضع تجريبي) ------------------------------ */
export async function googleSignInAction(formData: FormData): Promise<void> {
  const next = String(formData.get("next") ?? "/");
  const email = "google.guest@funoon.art";
  let user = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
  if (!user) {
    user = (
      await db
        .insert(users)
        .values({
          name: "ضيف Google",
          email,
          googleId: "demo-google-account",
          verified: true,
          artType: "painting",
        })
        .returning()
    )[0];
  }
  await createSession(user.id);
  redirect(safeNext(next));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
}
