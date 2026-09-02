import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import {
  Award,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Dumbbell,
  GraduationCap,
  Layers,
  Lock,
  PlayCircle,
  UserRound,
  Users2,
} from "lucide-react";
import { db } from "@/db";
import { courseEnrollments, courses } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { enrollmentCounts } from "@/lib/queries";
import { artMeta } from "@/lib/art";
import { LevelBadge, TypeChip } from "@/components/ui";
import { completeCourseAction, enrollCourseAction } from "@/actions/learn";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const course = (await db.select().from(courses).where(eq(courses.id, id)).limit(1))[0];
  return course ? { title: `كورس: ${course.title}`, description: course.description.slice(0, 150) } : { title: "كورس" };
}

const KIND_META = {
  video: { label: "فيديو", Icon: PlayCircle },
  reading: { label: "قراءة", Icon: BookOpen },
  exercise: { label: "تمرين", Icon: Dumbbell },
} as const;

export default async function CoursePage({ params }: { params: Params }) {
  const { id } = await params;
  const course = (await db.select().from(courses).where(eq(courses.id, id)).limit(1))[0];
  if (!course || !course.published) notFound();

  const user = await getSessionUser();
  const enrollment = user
    ? (
        await db
          .select()
          .from(courseEnrollments)
          .where(and(eq(courseEnrollments.courseId, id), eq(courseEnrollments.userId, user.id)))
          .limit(1)
      )[0]
    : null;
  const counts = await enrollmentCounts([id]);
  const meta = artMeta(course.artType);
  const totalMin = course.modules.reduce((a, m) => a + (m.durationMin ?? 0), 0);

  const youtubeId = (url?: string) => {
    if (!url) return null;
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/);
    return m?.[1] ?? null;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link href="/courses" className="mb-6 inline-flex items-center gap-2 text-sm text-sand transition-colors hover:text-gold-2">
        <ArrowRight size={15} /> كل الكورسات
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* المحتوى */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <TypeChip type={course.artType} />
            <LevelBadge level={course.level} />
          </div>
          <h1 className="title-display mt-4 text-2xl leading-10 sm:text-3xl">{course.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-8 text-sand sm:text-base">{course.description}</p>

          <h2 className="title-display mb-4 mt-10 flex items-center gap-2 text-xl">
            <Layers className="text-gold" size={18} />
            وحدات الكورس ({course.modules.length})
          </h2>

          <div className="space-y-3">
            {course.modules.map((mod, i) => {
              const km = KIND_META[mod.kind] ?? KIND_META.reading;
              const unlocked = !!enrollment || i === 0; // الوحدة الأولى معاينة مجانية
              const yid = youtubeId(mod.videoUrl);
              return (
                <details key={i} className="card group overflow-hidden" open={i === 0 && !!enrollment} name={`mod-${i}`}>
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-5 marker:hidden">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-lg font-display text-sm font-black"
                      style={{ background: unlocked ? `${meta.color}22` : "rgba(255,255,255,0.05)", color: unlocked ? meta.color : "var(--color-sand)" }}
                    >
                      {unlocked ? i + 1 : <Lock size={14} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="title-display block truncate text-[0.95rem] text-paper">{mod.title}</span>
                      <span className="mt-0.5 flex items-center gap-3 text-[11px] text-sand">
                        <span className="inline-flex items-center gap-1">
                          <km.Icon size={11} /> {km.label}
                        </span>
                        {mod.durationMin ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={11} /> {mod.durationMin} د
                          </span>
                        ) : null}
                        {i === 0 && !enrollment && <span className="text-gold-2">معاينة مجانية</span>}
                      </span>
                    </span>
                  </summary>
                  <div className="border-t hairline px-5 py-4">
                    {unlocked ? (
                      <div className="space-y-4">
                        {mod.videoUrl &&
                          (yid ? (
                            <div className="aspect-video w-full overflow-hidden rounded-lg bg-coal">
                              <iframe
                                src={`https://www.youtube.com/embed/${yid}`}
                                title={mod.title}
                                className="h-full w-full"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <video controls preload="metadata" src={mod.videoUrl} className="w-full rounded-lg bg-coal" />
                          ))}
                        <p className="whitespace-pre-wrap text-sm leading-8 text-paper/85">{mod.body}</p>
                      </div>
                    ) : (
                      <p className="flex items-center gap-2 text-sm text-sand">
                        <Lock size={14} className="text-gold" />
                        اشترك في الكورس لفتح هذه الوحدة وبقية المحتوى.
                      </p>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        {/* بطاقة الاشتراك */}
        <aside>
          <div className="card sticky top-24 overflow-hidden">
            <div className="h-1.5" style={{ background: meta.color }} />
            <div className="p-6">
              <p className="title-display text-2xl text-gold-2">{course.price > 0 ? `${course.price} ج.م` : "مجاني"}</p>
              <div className="mt-5 space-y-3 text-sm text-sand">
                <p className="flex items-center gap-2.5">
                  <UserRound size={15} className="text-gold" /> المدرّب: {course.instructor || "فريق فُنون"}
                </p>
                <p className="flex items-center gap-2.5">
                  <Layers size={15} className="text-gold" /> {course.modules.length} وحدات تعليمية
                </p>
                {totalMin > 0 && (
                  <p className="flex items-center gap-2.5">
                    <Clock3 size={15} className="text-gold" /> نحو {totalMin} دقيقة
                  </p>
                )}
                <p className="flex items-center gap-2.5">
                  <Users2 size={15} className="text-gold" /> {counts[id] ?? 0} مشتركًا
                </p>
                <p className="flex items-center gap-2.5">
                  <Award size={15} className="text-gold" /> شهادة إتمام قابلة للطباعة
                </p>
              </div>

              <div className="mt-6 border-t hairline pt-5">
                {!user ? (
                  <Link href={`/login?next=/courses/${id}`} className="btn btn-gold w-full">
                    <GraduationCap size={16} /> سجّل الدخول للاشتراك
                  </Link>
                ) : !enrollment ? (
                  <form action={enrollCourseAction}>
                    <input type="hidden" name="courseId" value={course.id} />
                    <button type="submit" className="btn btn-gold w-full">
                      <GraduationCap size={16} /> اشترك الآن
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <p className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2.5 text-sm font-bold text-emerald-300">
                      <CheckCircle2 size={16} /> أنت مشترك في هذا الكورس
                    </p>
                    {enrollment.completedAt ? (
                      <Link href={`/courses/${id}/certificate`} className="btn btn-gold w-full">
                        <Award size={16} /> شهادتك جاهزة — اعرضها
                      </Link>
                    ) : (
                      <form action={completeCourseAction}>
                        <input type="hidden" name="courseId" value={course.id} />
                        <button type="submit" className="btn btn-ghost w-full">
                          أنهيتُ الكورس — استخرج الشهادة
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
