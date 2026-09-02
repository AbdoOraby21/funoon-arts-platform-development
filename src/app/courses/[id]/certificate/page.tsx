import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { ArrowRight, Award } from "lucide-react";
import { db } from "@/db";
import { courseEnrollments, courses } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { artMeta, levelMeta } from "@/lib/art";
import { formatDate } from "@/lib/utils";
import Logo from "@/components/logo";
import { PrintButton } from "@/components/client-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "شهادة إتمام" };

type Params = Promise<{ id: string }>;

export default async function CertificatePage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await requireUser(`/courses/${id}`);
  const course = (await db.select().from(courses).where(eq(courses.id, id)).limit(1))[0];
  if (!course) redirect("/courses");

  const enrollment = (
    await db
      .select()
      .from(courseEnrollments)
      .where(and(eq(courseEnrollments.courseId, id), eq(courseEnrollments.userId, user.id)))
      .limit(1)
  )[0];

  if (!enrollment?.completedAt) redirect(`/courses/${id}`);

  const serial = `FUN-${enrollment.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
  const meta = artMeta(course.artType);

  return (
    <div className="min-h-screen bg-coal px-4 py-10">
      <div className="no-print mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3">
        <Link href={`/courses/${id}`} className="btn btn-ghost btn-sm">
          <ArrowRight size={14} /> العودة للكورس
        </Link>
        <PrintButton className="btn-sm">اطبع / احفظ PDF</PrintButton>
      </div>

      {/* ورقة الشهادة */}
      <div
        className="print-sheet mx-auto max-w-4xl bg-[#f4ecdc] p-3 text-[#241b10] shadow-2xl shadow-black/60"
        style={{ borderRadius: "18px", printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as never}
      >
        <div className="relative rounded-xl border-2 border-[#b98f3d] p-2">
          <div className="relative overflow-hidden rounded-lg border border-[#d4b773] px-6 py-12 text-center sm:px-14">
            {/* زخارف ركنية */}
            {["top-3 start-3", "top-3 end-3 rotate-90", "bottom-3 end-3 rotate-180", "bottom-3 start-3 -rotate-90"].map((pos) => (
              <svg key={pos} className={`absolute ${pos} size-14 text-[#b98f3d]`} viewBox="0 0 56 56" fill="none" aria-hidden="true">
                <path d="M4 52 V20 Q4 4 20 4 H52" stroke="currentColor" strokeWidth="3" />
                <circle cx="14" cy="14" r="3.5" fill="currentColor" />
              </svg>
            ))}

            <div className="flex justify-center text-[#241b10]"><Logo size={40} /></div>

            <p className="mt-6 font-body text-xs font-bold tracking-[0.35em] text-[#8a6a25]">شهادة إتمام</p>
            <h1 className="title-display mt-3 text-3xl text-[#241b10] sm:text-4xl">Certificate of Completion</h1>

            <p className="mx-auto mt-8 max-w-md text-sm leading-8 text-[#5d4a26]">تشهد منصة «فُنون» — بيت الفنون العربية — بأن</p>
            <p className="title-display mt-2 text-3xl text-[#241b10] sm:text-4xl">{user.name}</p>
            <svg className="mx-auto mt-1 h-3 w-64 text-[#b98f3d]" viewBox="0 0 260 12" aria-hidden="true">
              <path d="M6 7 C 70 1 190 12 254 5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>

            <p className="mx-auto mt-5 max-w-lg text-sm leading-8 text-[#5d4a26]">
              قد أتمّ بنجاح كورس <span className="font-bold text-[#241b10]">«{course.title}»</span>
              {" "}— مسار {levelMeta(course.level).ar} في فن {meta.ar} — بجميع وحداته البالغ عددها {course.modules.length} وحدة.
            </p>

            <div className="mx-auto mt-10 flex max-w-lg items-end justify-between gap-6 text-[11px] text-[#5d4a26]">
              <div className="text-center">
                <p className="border-t border-[#b98f3d] px-6 pt-2 font-bold">{course.instructor || "فريق فُنون"}</p>
                <p>المدرّب</p>
              </div>
              {/* الختم */}
              <div className="relative grid size-24 place-items-center">
                <svg className="anim-spin-slow absolute inset-0 size-full text-[#b98f3d]" viewBox="0 0 96 96" fill="none" aria-hidden="true">
                  <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" />
                  <circle cx="48" cy="48" r="34" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 4" />
                </svg>
                <Award size={30} className="text-[#b98f3d]" />
              </div>
              <div className="text-center">
                <p className="border-t border-[#b98f3d] px-6 pt-2 font-bold">{formatDate(enrollment.completedAt)}</p>
                <p>تاريخ الإتمام</p>
              </div>
            </div>

            <p className="mt-8 font-mono text-[10px] tracking-widest text-[#8a6a25]" dir="ltr">
              {serial}
            </p>
          </div>
        </div>
      </div>

      <p className="no-print mx-auto mt-6 max-w-4xl text-center text-xs text-sand">
        نصيحة: اختر «حفظ كـ PDF» من نافذة الطباعة لتنزيل الشهادة ملفًا.
      </p>
    </div>
  );
}
