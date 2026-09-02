import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { BadgeCheck, ClipboardList, Clock3, FileUp, Sparkles } from "lucide-react";
import { db } from "@/db";
import { examSubmissions, exams } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { HeroBg } from "@/components/backgrounds";
import Reveal from "@/components/reveal";
import { EmptyState, LevelBadge, TypeChip } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "اختبارات المستوى",
  description: "اختبر مستواك في فنّك نظريًا وعمليًا واحصل على تقييم فوري يحدد مستواك: مبتدئ، متوسط، أو متقدم.",
};

export default async function ExamsPage() {
  const user = await getSessionUser();
  const list = await db.select().from(exams).orderBy(desc(exams.createdAt));

  const best: Record<string, { score: number; status: string }> = {};
  if (user) {
    const subs = await db
      .select()
      .from(examSubmissions)
      .where(eq(examSubmissions.userId, user.id))
      .orderBy(desc(examSubmissions.score));
    for (const s of subs) {
      if (!best[s.examId]) best[s.examId] = { score: s.score, status: s.status };
    }
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b hairline">
        <HeroBg />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="chip mb-4 border-gold/40 bg-gold/10 text-gold-2">
            <Sparkles size={13} />
            تقييم المستوى
          </p>
          <h1 className="title-display max-w-2xl text-3xl leading-snug sm:text-4xl">
            أثبت مستواك بالنظرية <span className="text-gold-2">والممارسة</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-8 text-sand sm:text-base">
            أسئلة اختيار من متعدد تُصحَّح فورًا، وفي بعض الاختبارات تسليمٌ عملي يُراجَع من المدرّبين.
            ٨٠٪ فأكثر = متقدّم، ٦٠٪ = متوسّط — ويُحدَّث مستواك تلقائيًا.
          </p>
          {user && (
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-sand">
              مستواك الحالي: <LevelBadge level={user.level} />
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {list.length === 0 ? (
          <EmptyState Icon={ClipboardList} title="لا توجد اختبارات منشورة بعد" hint="يراجع فريق فُنون المحتوى باستمرار — عد قريبًا." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {list.map((exam, i) => {
              const mine = best[exam.id];
              return (
                <Reveal key={exam.id} delay={(i % 3) * 0.07}>
                  <div className="card flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <TypeChip type={exam.artType} />
                      {exam.practicalRequired && (
                        <span className="chip border-line-strong bg-white/5 text-sand">
                          <FileUp size={12} /> تسليم عملي
                        </span>
                      )}
                    </div>
                    <h2 className="title-display mt-4 text-lg leading-8 text-paper">{exam.title}</h2>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-7 text-sand">{exam.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-sand">
                      <span className="inline-flex items-center gap-1.5">
                        <ClipboardList size={13} className="text-gold" />
                        {exam.questions.length} سؤالًا
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={13} className="text-gold" />
                        نحو {exam.durationMin} دقيقة
                      </span>
                    </div>
                    <div className="mt-5 flex items-center gap-3 border-t hairline pt-4">
                      {mine ? (
                        <span className="chip border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
                          <BadgeCheck size={13} />
                          أفضل نتيجة {mine.score}٪
                          {mine.status === "pending" && " — قيد المراجعة"}
                        </span>
                      ) : (
                        <span className="text-xs text-sand">لم تجرّب هذا الاختبار بعد</span>
                      )}
                      <Link
                        href={`/exams/${exam.id}`}
                        className="btn btn-gold btn-sm ms-auto"
                      >
                        {mine ? "أعد المحاولة" : "ابدأ الاختبار"}
                      </Link>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        <Reveal className="card mt-10 flex flex-wrap items-center gap-4 p-6">
          <span className="grid size-12 place-items-center rounded-2xl bg-gold/10 text-gold">
            <Sparkles size={22} />
          </span>
          <div className="flex-1">
            <h3 className="title-display text-lg">كيف يُحسب مستواك؟</h3>
            <p className="mt-1 text-sm leading-7 text-sand">
              تُصحَّح الأسئلة تلقائيًا، وإن كان الاختبار يتطلب تسليمًا عمليًا تبقى نتيجتك «قيد المراجعة» حتى يعتمدها المدرّب.
              الترقية تصاعدية فقط — لن يُخفَّض مستواك بسبب محاولة واحدة.
            </p>
          </div>
          <div className="flex gap-2">
            {["beginner", "intermediate", "advanced"].map((l) => (
              <LevelBadge key={l} level={l} />
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
