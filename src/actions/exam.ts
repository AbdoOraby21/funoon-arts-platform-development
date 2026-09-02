"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { examSubmissions, exams, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { levelFromScore, levelMeta } from "@/lib/art";

export interface ExamResult {
  error?: string;
  score?: number;
  correct?: number;
  total?: number;
  status?: string;
  level?: string;
}

export async function submitExamAction(input: {
  examId: string;
  answers: number[];
  practicalDataUrl?: string | null;
  note?: string;
}): Promise<ExamResult> {
  const user = await requireUser(`/exams/${input.examId}`);

  const exam = (await db.select().from(exams).where(eq(exams.id, input.examId)).limit(1))[0];
  if (!exam) return { error: "الاختبار غير موجود." };

  const questions = exam.questions ?? [];
  if (!questions.length) return { error: "هذا الاختبار لا يحتوي أسئلة بعد." };
  if (!Array.isArray(input.answers) || input.answers.length !== questions.length) {
    return { error: "أجب على كل الأسئلة قبل التسليم." };
  }
  if (exam.practicalRequired && !input.practicalDataUrl && !(input.note ?? "").trim()) {
    return { error: "هذا الاختبار يتطلب تسليمًا عمليًا — ارفع ملفًا أو اكتب ملاحظة للمقيّم." };
  }

  let correct = 0;
  questions.forEach((q, i) => {
    if (input.answers[i] === q.correctIndex) correct += 1;
  });
  const score = Math.round((correct / questions.length) * 100);

  const status = exam.practicalRequired ? "pending" : "scored";
  const achieved = levelFromScore(score);

  await db.insert(examSubmissions).values({
    userId: user.id,
    examId: exam.id,
    answers: input.answers,
    practicalFileUrl: input.practicalDataUrl ?? null,
    practicalNote: input.note ?? null,
    score,
    status,
  });

  // ترقية المستوى فقط (لا نخفض مستوى أحد بسبب اختبار واحد)
  const current = levelMeta(user.level).rank;
  if (levelMeta(achieved).rank > current) {
    await db.update(users).set({ level: achieved }).where(eq(users.id, user.id));
  }

  revalidatePath("/exams");
  revalidatePath("/profile");
  revalidatePath("/admin/exams");

  return { score, correct, total: questions.length, status, level: achieved };
}
