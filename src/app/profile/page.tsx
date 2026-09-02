import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Heart,
  ImageOff,
  Images,
  Mail,
  PenSquare,
  Phone,
  Ticket,
} from "lucide-react";
import { db } from "@/db";
import {
  courseEnrollments,
  courses,
  examSubmissions,
  exams,
  workshopBookings,
  workshops,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { fetchArtworks } from "@/lib/queries";
import { artMeta } from "@/lib/art";
import { formatDate, formatDateTime, initials } from "@/lib/utils";
import { ArtCanvas } from "@/components/backgrounds";
import ArtworkCard from "@/components/artwork-card";
import { EmptyState, IconLabel, LevelBadge, StatCard, TypeChip } from "@/components/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ملفي الشخصي" };

const STATUS_AR: Record<string, { label: string; cls: string }> = {
  scored: { label: "مُصحّحة", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  pending: { label: "قيد مراجعة المدرّب", cls: "border-gold/40 bg-gold/10 text-gold-2" },
  reviewed: { label: "اعتمدها المدرّب", cls: "border-sky-400/40 bg-sky-400/10 text-sky-300" },
};

export default async function ProfilePage() {
  const user = await requireUser("/profile");

  const [myWorks, subs, bookings, enrolls] = await Promise.all([
    fetchArtworks({ authorId: user.id, limit: 12, userId: user.id }),
    db
      .select({ sub: examSubmissions, examTitle: exams.title, examArt: exams.artType })
      .from(examSubmissions)
      .innerJoin(exams, eq(examSubmissions.examId, exams.id))
      .where(eq(examSubmissions.userId, user.id))
      .orderBy(desc(examSubmissions.createdAt))
      .limit(10),
    db
      .select({ booking: workshopBookings, ws: workshops })
      .from(workshopBookings)
      .innerJoin(workshops, eq(workshopBookings.workshopId, workshops.id))
      .where(eq(workshopBookings.userId, user.id))
      .orderBy(desc(workshopBookings.createdAt))
      .limit(8),
    db
      .select({ enroll: courseEnrollments, course: courses })
      .from(courseEnrollments)
      .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .where(eq(courseEnrollments.userId, user.id))
      .orderBy(desc(courseEnrollments.createdAt))
      .limit(8),
  ]);

  const totalLikes = myWorks.reduce((a, w) => a + w.artwork.likesCount, 0);

  return (
    <div>
      {/* ترويسة الملف */}
      <ArtCanvas type={user.artType as never} className="border-b hairline">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-center gap-5">
            <span
              className="grid size-20 place-items-center rounded-3xl font-display text-2xl font-black text-coal shadow-xl"
              style={{ background: artMeta(user.artType).color }}
            >
              {initials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="title-display text-2xl sm:text-3xl">{user.name}</h1>
                {user.role === "admin" && (
                  <span className="chip border-gold bg-gold/15 text-gold-2">
                    <BadgeCheck size={12} /> إدارة
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-sand">
                <IconLabel Icon={Mail}><span dir="ltr">{user.email}</span></IconLabel>
                {user.phone && <IconLabel Icon={Phone}><span dir="ltr">{user.phone}</span></IconLabel>}
                <IconLabel Icon={CalendarDays}>عضو منذ {formatDate(user.createdAt)}</IconLabel>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <LevelBadge level={user.level} />
                <TypeChip type={user.artType} />
                <Link href="/exams" className="chip border-line-strong bg-white/5 text-sand transition-colors hover:text-gold-2">
                  طوّر مستواك باختبار جديد
                </Link>
              </div>
            </div>
            <Link href="/upload" className="btn btn-gold">
              <PenSquare size={16} /> ارفع عملًا
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard Icon={Images} label="أعمالي المعروضة" value={myWorks.length} accent={artMeta(user.artType).color} />
            <StatCard Icon={Heart} label="إعجابات على أعمالي" value={totalLikes} accent="#E0698B" />
            <StatCard Icon={ClipboardList} label="اختبارات أديتها" value={subs.length} accent="#35BEB2" />
            <StatCard Icon={GraduationCap} label="كورسات أتابعها" value={enrolls.length} accent="#6F9BD1" />
          </div>
        </div>
      </ArtCanvas>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6">
        {/* أعمالي */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="title-display text-2xl">أعمالي على الجدار</h2>
            <Link href="/upload" className="btn btn-ghost btn-sm">
              <PenSquare size={14} /> عمل جديد
            </Link>
          </div>
          {myWorks.length === 0 ? (
            <EmptyState
              Icon={ImageOff}
              title="لم ترفع أعمالًا بعد"
              hint="جدارك الفارغ ينتظر أولى لوحاته — ارفع عملك الأول الآن."
              action={<Link href="/upload" className="btn btn-gold btn-sm mt-2">ارفع عملك الأول</Link>}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myWorks.map((d) => (
                <ArtworkCard key={d.artwork.id} data={d} authed />
              ))}
            </div>
          )}
        </section>

        {/* نتائج اختباراتي */}
        <section>
          <h2 className="title-display mb-6 text-2xl">سجلّ اختباراتي</h2>
          {subs.length === 0 ? (
            <EmptyState
              Icon={ClipboardList}
              title="لم تخض اختبارًا بعد"
              hint="اختبارات المستوى ترفع رتبتك وتفتح لك توصيات الكورسات."
              action={<Link href="/exams" className="btn btn-gold btn-sm mt-2">تصفّح الاختبارات</Link>}
            />
          ) : (
            <div className="card overflow-x-auto">
              <table className="table-base min-w-130">
                <thead>
                  <tr>
                    <th>الاختبار</th>
                    <th>الفن</th>
                    <th>النتيجة</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map(({ sub, examTitle, examArt }) => {
                    const st = STATUS_AR[sub.status] ?? STATUS_AR.scored;
                    return (
                      <tr key={sub.id}>
                        <td className="font-medium text-paper">{examTitle}</td>
                        <td><TypeChip type={examArt} /></td>
                        <td>
                          <span
                            className={cn(
                              "title-display text-lg",
                              sub.score >= 80 ? "text-[#E0698B]" : sub.score >= 60 ? "text-gold-2" : "text-sand",
                            )}
                          >
                            {sub.score}٪
                          </span>
                        </td>
                        <td><span className={cn("chip", st.cls)}>{st.label}</span></td>
                        <td className="text-sand">{formatDate(sub.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ورشي وكورساتي */}
        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="title-display mb-6 flex items-center gap-2 text-2xl">
              <Ticket className="text-gold" size={20} /> ورشي المحجوزة
            </h2>
            {bookings.length === 0 ? (
              <EmptyState Icon={Ticket} title="لا حجوزات بعد" action={<Link href="/workshops" className="btn btn-ghost btn-sm mt-2">تصفّح الورش</Link>} />
            ) : (
              <div className="space-y-3">
                {bookings.map(({ ws }) => (
                  <div key={ws.id} className="card flex items-center gap-4 p-4">
                    <TypeChip type={ws.artType} withLabel={false} />
                    <div className="min-w-0 flex-1">
                      <p className="title-display truncate text-sm text-paper">{ws.title}</p>
                      <p className="mt-0.5 text-xs text-sand">{formatDateTime(ws.startsAt)} — {ws.location}</p>
                    </div>
                    <span className="chip border-emerald-400/40 bg-emerald-400/10 text-emerald-300">محجوز</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="title-display mb-6 flex items-center gap-2 text-2xl">
              <GraduationCap className="text-gold" size={20} /> كورساتي
            </h2>
            {enrolls.length === 0 ? (
              <EmptyState Icon={GraduationCap} title="لم تشترك في كورس بعد" action={<Link href="/courses" className="btn btn-ghost btn-sm mt-2">تصفّح الكورسات</Link>} />
            ) : (
              <div className="space-y-3">
                {enrolls.map(({ enroll, course }) => (
                  <Link key={enroll.id} href={`/courses/${course.id}`} className="card flex items-center gap-4 p-4 transition-colors hover:border-gold/40">
                    <TypeChip type={course.artType} withLabel={false} />
                    <div className="min-w-0 flex-1">
                      <p className="title-display truncate text-sm text-paper">{course.title}</p>
                      <p className="mt-0.5 text-xs text-sand">{course.modules.length} وحدة</p>
                    </div>
                    {enroll.completedAt ? (
                      <span className="chip border-gold/50 bg-gold/15 text-gold-2">
                        <Award size={12} /> شهادة جاهزة
                      </span>
                    ) : (
                      <span className="chip border-line-strong bg-white/5 text-sand">قيد التعلم</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
