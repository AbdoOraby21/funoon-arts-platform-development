"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  courses,
  examSubmissions,
  exams,
  offers,
  pages,
  users,
  workshops,
  type CourseModule,
  type ExamQuestion,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { ART_TYPES, LEVELS } from "@/lib/art";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const n = (fd: FormData, k: string, d = 0) => {
  const v = parseInt(s(fd, k), 10);
  return Number.isFinite(v) ? v : d;
};
const d = (fd: FormData, k: string) => {
  const v = s(fd, k);
  if (!v) return null;
  const date = new Date(v);
  return Number.isNaN(date.getTime()) ? null : date;
};
const validArt = (t: string) => ART_TYPES.some((x) => x.key === t);

function revalidate(path: string) {
  revalidatePath(path);
  revalidatePath("/admin");
}

/* --------------------------------- العروض --------------------------------- */
export async function saveOfferAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = s(formData, "id");
  const values = {
    title: s(formData, "title"),
    description: s(formData, "description"),
    discount: s(formData, "discount"),
    code: s(formData, "code").toUpperCase(),
    active: formData.get("active") === "on",
    expiresAt: d(formData, "expiresAt"),
  };
  if (!values.title) return;
  if (id) await db.update(offers).set(values).where(eq(offers.id, id));
  else await db.insert(offers).values(values);
  revalidate("/admin/offers");
  revalidatePath("/offers");
}
export async function deleteOfferAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await db.delete(offers).where(eq(offers.id, s(formData, "id")));
  revalidate("/admin/offers");
  revalidatePath("/offers");
}
export async function toggleOfferAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = s(formData, "id");
  const row = (await db.select({ active: offers.active }).from(offers).where(eq(offers.id, id)).limit(1))[0];
  if (row) await db.update(offers).set({ active: !row.active }).where(eq(offers.id, id));
  revalidate("/admin/offers");
  revalidatePath("/offers");
}

/* --------------------------------- الصفحات --------------------------------- */
export async function savePageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = s(formData, "id");
  const slug = s(formData, "slug")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug || !s(formData, "title")) return;
  const values = {
    slug,
    title: s(formData, "title"),
    content: s(formData, "content"),
    published: formData.get("published") === "on",
    updatedAt: new Date(),
  };
  if (id) await db.update(pages).set(values).where(eq(pages.id, id));
  else await db.insert(pages).values(values).onConflictDoUpdate({ target: pages.slug, set: values });
  revalidate("/admin/pages");
  revalidatePath(`/p/${slug}`);
}
export async function deletePageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await db.delete(pages).where(eq(pages.id, s(formData, "id")));
  revalidate("/admin/pages");
}
export async function togglePageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = s(formData, "id");
  const row = (await db.select({ published: pages.published }).from(pages).where(eq(pages.id, id)).limit(1))[0];
  if (row) await db.update(pages).set({ published: !row.published }).where(eq(pages.id, id));
  revalidate("/admin/pages");
}

/* -------------------------------- الاختبارات -------------------------------- */
export async function saveExamAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = s(formData, "id");
  let questions: ExamQuestion[] = [];
  try {
    const parsed = JSON.parse(s(formData, "questionsJson") || "[]") as ExamQuestion[];
    questions = parsed.filter(
      (q) =>
        q &&
        typeof q.question === "string" &&
        q.question.trim() &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        typeof q.correctIndex === "number" &&
        q.correctIndex >= 0 &&
        q.correctIndex < q.options.length,
    );
  } catch {
    questions = [];
  }
  if (!questions.length || !s(formData, "title") || !validArt(s(formData, "artType"))) return;
  const values = {
    title: s(formData, "title"),
    artType: s(formData, "artType"),
    description: s(formData, "description"),
    durationMin: Math.max(3, n(formData, "durationMin", 15)),
    practicalRequired: formData.get("practicalRequired") === "on",
    practicalPrompt: s(formData, "practicalPrompt") || null,
    questions,
  };
  if (id) await db.update(exams).set(values).where(eq(exams.id, id));
  else await db.insert(exams).values(values);
  revalidate("/admin/exams");
  revalidatePath("/exams");
}
export async function deleteExamAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await db.delete(exams).where(eq(exams.id, s(formData, "id")));
  revalidate("/admin/exams");
  revalidatePath("/exams");
}
export async function reviewSubmissionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await db
    .update(examSubmissions)
    .set({ status: "reviewed" })
    .where(eq(examSubmissions.id, s(formData, "id")));
  revalidate("/admin/exams");
}

/* ---------------------------------- الورش ---------------------------------- */
export async function saveWorkshopAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = s(formData, "id");
  if (!s(formData, "title") || !validArt(s(formData, "artType"))) return;
  const values = {
    title: s(formData, "title"),
    artType: s(formData, "artType"),
    description: s(formData, "description"),
    mode: s(formData, "mode") === "recorded" ? "recorded" : "live",
    instructor: s(formData, "instructor"),
    location: s(formData, "location") || "أونلاين",
    videoUrl: s(formData, "videoUrl"),
    startsAt: d(formData, "startsAt"),
    capacity: Math.max(1, n(formData, "capacity", 30)),
  };
  if (id) await db.update(workshops).set(values).where(eq(workshops.id, id));
  else await db.insert(workshops).values(values);
  revalidate("/admin/content");
  revalidatePath("/workshops");
}
export async function deleteWorkshopAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await db.delete(workshops).where(eq(workshops.id, s(formData, "id")));
  revalidate("/admin/content");
  revalidatePath("/workshops");
}

/* --------------------------------- الكورسات --------------------------------- */
export async function saveCourseAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = s(formData, "id");
  let modules: CourseModule[] = [];
  try {
    const parsed = JSON.parse(s(formData, "modulesJson") || "[]") as CourseModule[];
    modules = parsed.filter((m) => m && typeof m.title === "string" && m.title.trim());
  } catch {
    modules = [];
  }
  if (!s(formData, "title") || !validArt(s(formData, "artType"))) return;
  const level = s(formData, "level");
  const values = {
    title: s(formData, "title"),
    artType: s(formData, "artType"),
    level: LEVELS.some((l) => l.key === level) ? level : "beginner",
    description: s(formData, "description"),
    price: Math.max(0, n(formData, "price", 0)),
    instructor: s(formData, "instructor"),
    published: formData.get("published") === "on",
    modules,
  };
  if (id) await db.update(courses).set(values).where(eq(courses.id, id));
  else await db.insert(courses).values(values);
  revalidate("/admin/content");
  revalidatePath("/courses");
}
export async function deleteCourseAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await db.delete(courses).where(eq(courses.id, s(formData, "id")));
  revalidate("/admin/content");
  revalidatePath("/courses");
}

/* -------------------------------- المستخدمون -------------------------------- */
export async function moderateUserAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = s(formData, "userId");
  const op = s(formData, "op");
  if (!userId || userId === admin.id) return;

  if (op === "ban") await db.update(users).set({ banned: true }).where(eq(users.id, userId));
  else if (op === "unban") await db.update(users).set({ banned: false }).where(eq(users.id, userId));
  else if (op === "make-admin") await db.update(users).set({ role: "admin" }).where(eq(users.id, userId));
  else if (op === "make-user") await db.update(users).set({ role: "user" }).where(eq(users.id, userId));
  else if (op.startsWith("level:")) {
    const level = op.slice(6);
    if (LEVELS.some((l) => l.key === level)) {
      await db.update(users).set({ level }).where(eq(users.id, userId));
    }
  }
  revalidate("/admin/users");
}
