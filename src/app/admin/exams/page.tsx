import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { BadgeCheck, ClipboardList, FileUp, PencilLine, Trash2, X } from "lucide-react";
import { db } from "@/db";
import { examSubmissions, exams, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { ConfirmSubmit } from "@/components/client-actions";
import { TypeChip } from "@/components/ui";
import { deleteExamAction, reviewSubmissionAction } from "@/actions/admin";
import ExamBuilder from "./exam-builder";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "إدارة الاختبارات" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminExamsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const editId = typeof sp.edit === "string" ? sp.edit : "";

  const list = await db.select().from(exams).orderBy(desc(exams.createdAt));
  const editing = list.find((e) => e.id === editId) ?? null;

  const subs = await db
    .select({
      sub: examSubmissions,
      userName: users.name,
      examTitle: exams.title,
    })
    .from(examSubmissions)
    .innerJoin(users, eq(examSubmissions.userId, users.id))
    .innerJoin(exams, eq(examSubmissions.examId, exams.id))
    .orderBy(desc(examSubmissions.createdAt))
    .limit(15);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="title-display text-2xl sm:text-3xl">الاختبارات</h1>
        <p className="mt-1 text-sm text-sand">
          ابنِ اختبارات نظرية (اختيار من متعدد) مع تسليم عملي اختياري تُراجعه يدويًا.
        </p>
      </div>

      {/* بنّاء الاختبار */}
      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="title-display flex items-center gap-2 text-lg">
            <ClipboardList className="text-gold" size={18} />
            {editing ? `تعديل: ${editing.title}` : "اختبار جديد"}
          </h2>
          {editing && (
            <Link href="/admin/exams" className="btn btn-ghost btn-sm">
              <X size={13} /> إلغاء التعديل
            </Link>
          )}
        </div>
        <ExamBuilder exam={editing} />
      </div>

      {/* قائمة الاختبارات */}
      <div className="card overflow-x-auto">
        <table className="table-base min-w-175">
          <thead>
            <tr>
              <th>الاختبار</th>
              <th>الفن</th>
              <th>الأسئلة</th>
              <th>عملي</th>
              <th>أُنشئ</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td className="max-w-60">
                  <p className="truncate font-medium text-paper">{e.title}</p>
                  <p className="truncate text-[11px] text-sand">{e.description}</p>
                </td>
                <td><TypeChip type={e.artType} /></td>
                <td className="text-center">{e.questions.length}</td>
                <td>
                  {e.practicalRequired ? (
                    <span className="chip border-gold/40 bg-gold/10 text-gold-2">
                      <FileUp size={11} /> مطلوب
                    </span>
                  ) : (
                    <span className="text-xs text-sand">لا</span>
                  )}
                </td>
                <td className="whitespace-nowrap text-xs text-sand">{formatDate(e.createdAt)}</td>
                <td>
                  <div className="flex gap-1.5">
                    <Link href={`/admin/exams?edit=${e.id}`} className="btn btn-ghost btn-sm" title="تعديل">
                      <PencilLine size={13} />
                    </Link>
                    <form action={deleteExamAction}>
                      <input type="hidden" name="id" value={e.id} />
                      <ConfirmSubmit label={<Trash2 size={13} />} confirm="حذف الاختبار ونتائجه؟" />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-8 text-center text-sm text-sand">لا توجد اختبارات بعد.</p>}
      </div>

      {/* تسليمات الطلاب */}
      <div>
        <h2 className="title-display mb-4 text-xl">أحدث تسليمات الطلاب</h2>
        <div className="card overflow-x-auto">
          <table className="table-base min-w-200">
            <thead>
              <tr>
                <th>الطالب</th>
                <th>الاختبار</th>
                <th>النتيجة</th>
                <th>الحالة</th>
                <th>التسليم العملي</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(({ sub, userName, examTitle }) => (
                <tr key={sub.id}>
                  <td className="whitespace-nowrap font-medium text-paper">{userName}</td>
                  <td className="max-w-52 truncate text-sand">{examTitle}</td>
                  <td className="title-display text-base text-gold-2">{sub.score}٪</td>
                  <td>
                    {sub.status === "pending" ? (
                      <span className="chip border-gold/40 bg-gold/10 text-gold-2">بانتظار المراجعة</span>
                    ) : sub.status === "reviewed" ? (
                      <span className="chip border-sky-400/40 bg-sky-400/10 text-sky-300">
                        <BadgeCheck size={11} /> تمت المراجعة
                      </span>
                    ) : (
                      <span className="chip border-emerald-400/40 bg-emerald-400/10 text-emerald-300">مُصحّحة تلقائيًا</span>
                    )}
                  </td>
                  <td className="max-w-52">
                    {sub.practicalFileUrl ? (
                      <a
                        href={sub.practicalFileUrl}
                        download
                        className="text-xs text-gold-2 underline underline-offset-4"
                      >
                        تنزيل الملف
                      </a>
                    ) : sub.practicalNote ? (
                      <span className="line-clamp-2 text-[11px] text-sand">{sub.practicalNote}</span>
                    ) : (
                      <span className="text-xs text-sand">—</span>
                    )}
                  </td>
                  <td>
                    {sub.status === "pending" && (
                      <form action={reviewSubmissionAction}>
                        <input type="hidden" name="id" value={sub.id} />
                        <button className="btn btn-gold btn-sm">
                          <BadgeCheck size={13} /> اعتماد
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {subs.length === 0 && <p className="p-8 text-center text-sm text-sand">لا تسليمات بعد.</p>}
        </div>
      </div>
    </div>
  );
}
