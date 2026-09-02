import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { examSubmissions, exams } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import ExamClient from "./exam-client";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const exam = (await db.select().from(exams).where(eq(exams.id, id)).limit(1))[0];
  return { title: exam ? `اختبار: ${exam.title}` : "اختبار" };
}

export default async function ExamTakePage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await requireUser(`/exams/${id}`);
  const exam = (await db.select().from(exams).where(eq(exams.id, id)).limit(1))[0];
  if (!exam || !exam.questions.length) notFound();

  const past = await db
    .select()
    .from(examSubmissions)
    .where(eq(examSubmissions.examId, id))
    .orderBy(desc(examSubmissions.score))
    .limit(30);
  const mine = past.filter((p) => p.userId === user.id)[0] ?? null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <ExamClient exam={exam} userLevel={user.level} bestScore={mine?.score ?? null} />
    </div>
  );
}
