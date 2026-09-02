"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { courseEnrollments, courses, workshopBookings, workshops } from "@/db/schema";
import { requireUser } from "@/lib/auth";

/* ------------------------------ حجز ورشة ------------------------------ */
export async function bookWorkshopAction(formData: FormData): Promise<void> {
  const user = await requireUser("/workshops");
  const workshopId = String(formData.get("workshopId") ?? "");

  const ws = (await db.select().from(workshops).where(eq(workshops.id, workshopId)).limit(1))[0];
  if (!ws) return;

  const existing = (
    await db
      .select({ id: workshopBookings.id })
      .from(workshopBookings)
      .where(and(eq(workshopBookings.workshopId, workshopId), eq(workshopBookings.userId, user.id)))
      .limit(1)
  )[0];
  if (existing) return;

  const taken = (
    await db
      .select({ n: sql<number>`count(*)::int` })
      .from(workshopBookings)
      .where(eq(workshopBookings.workshopId, workshopId))
  )[0]?.n ?? 0;
  if (taken >= ws.capacity) return;

  await db.insert(workshopBookings).values({ workshopId, userId: user.id });
  revalidatePath("/workshops");
  revalidatePath("/profile");
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  const user = await requireUser("/workshops");
  const workshopId = String(formData.get("workshopId") ?? "");
  await db
    .delete(workshopBookings)
    .where(and(eq(workshopBookings.workshopId, workshopId), eq(workshopBookings.userId, user.id)));
  revalidatePath("/workshops");
  revalidatePath("/profile");
}

/* ------------------------------ اشتراك كورس ------------------------------ */
export async function enrollCourseAction(formData: FormData): Promise<void> {
  const user = await requireUser("/courses");
  const courseId = String(formData.get("courseId") ?? "");

  const course = (await db.select({ id: courses.id }).from(courses).where(eq(courses.id, courseId)).limit(1))[0];
  if (!course) return;

  const existing = (
    await db
      .select({ id: courseEnrollments.id })
      .from(courseEnrollments)
      .where(and(eq(courseEnrollments.courseId, courseId), eq(courseEnrollments.userId, user.id)))
      .limit(1)
  )[0];
  if (!existing) {
    await db.insert(courseEnrollments).values({ courseId, userId: user.id });
  }
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/profile");
}

export async function completeCourseAction(formData: FormData): Promise<void> {
  const user = await requireUser("/courses");
  const courseId = String(formData.get("courseId") ?? "");
  await db
    .update(courseEnrollments)
    .set({ completedAt: new Date() })
    .where(and(eq(courseEnrollments.courseId, courseId), eq(courseEnrollments.userId, user.id)));
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/profile");
}
