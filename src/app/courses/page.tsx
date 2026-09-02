import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { BookOpenCheck, Clock3, GraduationCap, Layers, Users2 } from "lucide-react";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { enrollmentCounts } from "@/lib/queries";
import { artMeta, LEVELS } from "@/lib/art";
import { ArtCanvas } from "@/components/backgrounds";
import Reveal from "@/components/reveal";
import { EmptyState, LevelBadge, TypeChip } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "الكورسات",
  description: "مسارات تعلم كاملة في الفنون الخمسة، مقسمة حسب المستوى، بفيديوهات وتمارين وشهادة إتمام.",
};

export default async function CoursesPage() {
  const list = await db.select().from(courses).where(eq(courses.published, true)).orderBy(desc(courses.createdAt));
  const counts = await enrollmentCounts(list.map((c) => c.id));

  return (
    <div>
      <ArtCanvas type="music" className="border-b hairline">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="chip mb-4 border-gold/40 bg-gold/10 text-gold-2">
            <GraduationCap size={13} /> أكاديمية فُنون
          </p>
          <h1 className="title-display max-w-2xl text-3xl leading-snug sm:text-4xl">
            مسارات تعلّم <span className="text-gold-2">من أول ضربة فرشاة حتى الاحتراف</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-8 text-sand sm:text-base">
            وحدات مرتبة بعناية: فيديوهات شرح، قراءات فنية، وتمارين تطبيقية — وأكمل الكورس لتحصل على شهادتك قابلة للطباعة.
          </p>
        </div>
      </ArtCanvas>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6">
        {LEVELS.map((level) => {
          const inLevel = list.filter((c) => c.level === level.key);
          if (!inLevel.length) return null;
          return (
            <section key={level.key}>
              <div className="mb-6 flex items-center gap-3">
                <span
                  className="grid size-10 place-items-center rounded-xl font-display text-lg font-black"
                  style={{ background: `${level.color}22`, color: level.color, border: `1px solid ${level.color}44` }}
                >
                  {level.rank}
                </span>
                <div>
                  <h2 className="title-display text-2xl">مسار {level.ar}</h2>
                  <p className="text-xs text-sand">
                    {level.key === "beginner" && "أساسيات تضعك على الطريق الصحيح"}
                    {level.key === "intermediate" && "تقنيات تصقل أسلوبك الخاص"}
                    {level.key === "advanced" && "احتراف ولغة فنية شخصية"}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {inLevel.map((course, i) => {
                  const totalMin = course.modules.reduce((acc, m) => acc + (m.durationMin ?? 0), 0);
                  const meta = artMeta(course.artType);
                  return (
                    <Reveal key={course.id} delay={(i % 3) * 0.07}>
                      <Link
                        href={`/courses/${course.id}`}
                        className="card group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1.5"
                        style={{ boxShadow: "none" }}
                      >
                        <div
                          className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-80"
                          style={{ background: meta.color }}
                        />
                        <div className="flex items-center gap-2">
                          <TypeChip type={course.artType} />
                          <LevelBadge level={course.level} />
                          <span className="chip ms-auto border-gold/40 bg-gold/10 text-gold-2">
                            {course.price > 0 ? `${course.price} ج.م` : "مجاني"}
                          </span>
                        </div>
                        <h3 className="title-display mt-4 text-lg leading-8 text-paper transition-colors group-hover:text-gold-2">
                          {course.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-7 text-sand">{course.description}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-sand">
                          <span className="inline-flex items-center gap-1.5">
                            <Layers size={12} className="text-gold" /> {course.modules.length} وحدات
                          </span>
                          {totalMin > 0 && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 size={12} className="text-gold" /> {totalMin} دقيقة
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5">
                            <Users2 size={12} className="text-gold" /> {counts[course.id] ?? 0} مشترك
                          </span>
                        </div>
                        <p className="mt-5 inline-flex items-center gap-1.5 border-t hairline pt-4 text-xs font-bold text-gold-2">
                          <BookOpenCheck size={13} />
                          يشمل شهادة إتمام
                        </p>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </section>
          );
        })}
        {list.length === 0 && (
          <EmptyState Icon={GraduationCap} title="لا توجد كورسات منشورة بعد" hint="يعمل فريق فُنون على إعداد أولى المسارات." />
        )}
      </div>
    </div>
  );
}
