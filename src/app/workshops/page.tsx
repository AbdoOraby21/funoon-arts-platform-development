import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { CalendarClock, CheckCircle2, MapPin, PlayCircle, Ticket, UserRound, Users2 } from "lucide-react";
import { db } from "@/db";
import { workshopBookings, workshops } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { bookingCounts } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";
import { ArtCanvas } from "@/components/backgrounds";
import Reveal from "@/components/reveal";
import { EmptyState, TypeChip } from "@/components/ui";
import { bookWorkshopAction, cancelBookingAction } from "@/actions/learn";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "الورش",
  description: "ورش فنية مباشرة ومسجلة في الرسم والموسيقى والكتابة والتصوير والفيديو — احجز مقعدك قبل اكتمال العدد.",
};

export default async function WorkshopsPage() {
  const user = await getSessionUser();
  const list = await db.select().from(workshops).orderBy(desc(workshops.startsAt));
  const counts = await bookingCounts(list.map((w) => w.id));
  const mine = new Set<string>();
  if (user) {
    const rows = await db
      .select({ workshopId: workshopBookings.workshopId })
      .from(workshopBookings)
      .where(eq(workshopBookings.userId, user.id));
    rows.forEach((r) => mine.add(r.workshopId));
  }

  const live = list.filter((w) => w.mode === "live");
  const recorded = list.filter((w) => w.mode === "recorded");
  const now = new Date();

  return (
    <div>
      <ArtCanvas type="video" className="border-b hairline">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="chip mb-4 border-gold/40 bg-gold/10 text-gold-2">
            <Ticket size={13} /> قاعات فُنون
          </p>
          <h1 className="title-display max-w-2xl text-3xl leading-snug sm:text-4xl">
            ورش تُقام الآن، <span className="text-gold-2">وأخرى بانتظارك متى شئت</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-8 text-sand sm:text-base">
            مقاعد محدودة في الورش المباشرة، وتسجيلات كاملة متاحة دائمًا. الحجز بضغطة واحدة ويُحفظ في ملفك.
          </p>
        </div>
      </ArtCanvas>

      {/* الورش المباشرة */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="title-display mb-6 flex items-center gap-2.5 text-2xl">
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E0698B] opacity-60" />
            <span className="relative inline-flex size-3 rounded-full bg-[#E0698B]" />
          </span>
          ورش مباشرة قادمة
        </h2>
        {live.length === 0 ? (
          <EmptyState Icon={CalendarClock} title="لا توجد ورش مباشرة قادمة حاليًا" hint="تابعنا — البرنامج يتحدّث أسبوعيًا." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {live.map((w, i) => {
              const taken = counts[w.id] ?? 0;
              const full = taken >= w.capacity;
              const booked = mine.has(w.id);
              const past = w.startsAt ? w.startsAt < now : false;
              const pct = Math.min(100, Math.round((taken / w.capacity) * 100));
              return (
                <Reveal key={w.id} delay={(i % 3) * 0.07}>
                  <div className="card flex h-full flex-col p-6">
                    <div className="flex items-center gap-2">
                      <TypeChip type={w.artType} />
                      <span className="chip border-line-strong bg-white/5 text-sand">مباشر</span>
                      {past && <span className="chip border-line-strong bg-white/5 text-sand/60">انتهت</span>}
                      {booked && (
                        <span className="chip border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
                          <CheckCircle2 size={12} /> محجوز لك
                        </span>
                      )}
                    </div>
                    <h3 className="title-display mt-4 text-lg leading-8 text-paper">{w.title}</h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-7 text-sand">{w.description}</p>

                    <div className="mt-4 space-y-1.5 text-xs text-sand">
                      <p className="flex items-center gap-2">
                        <UserRound size={13} className="text-gold" /> {w.instructor}
                      </p>
                      <p className="flex items-center gap-2">
                        <CalendarClock size={13} className="text-gold" /> {formatDateTime(w.startsAt)}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin size={13} className="text-gold" /> {w.location}
                      </p>
                    </div>

                    {/* المقاعد */}
                    <div className="mt-5">
                      <div className="mb-1.5 flex items-center justify-between text-[11px] text-sand">
                        <span className="inline-flex items-center gap-1">
                          <Users2 size={12} /> {taken} / {w.capacity} محجوز
                        </span>
                        <span>{full ? "اكتمل العدد" : `تبقّى ${w.capacity - taken}`}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: full ? "#d96a5f" : "#d9a648" }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 border-t hairline pt-4">
                      {!user ? (
                        <Link href={`/login?next=/workshops`} className="btn btn-gold btn-sm w-full">
                          سجّل الدخول للحجز
                        </Link>
                      ) : booked ? (
                        <form action={cancelBookingAction}>
                          <input type="hidden" name="workshopId" value={w.id} />
                          <button type="submit" className="btn btn-ghost btn-sm w-full">إلغاء الحجز</button>
                        </form>
                      ) : (
                        <form action={bookWorkshopAction}>
                          <input type="hidden" name="workshopId" value={w.id} />
                          <button type="submit" disabled={full || past} className="btn btn-gold btn-sm w-full">
                            {full ? "اكتمل العدد" : past ? "انتهت الورشة" : "احجز مقعدك"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* الورش المسجلة */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <h2 className="title-display mb-6 flex items-center gap-2.5 text-2xl">
          <PlayCircle className="text-gold" />
          مكتبة التسجيلات
        </h2>
        {recorded.length === 0 ? (
          <EmptyState Icon={PlayCircle} title="لا توجد تسجيلات بعد" />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recorded.map((w, i) => (
              <Reveal key={w.id} delay={(i % 3) * 0.07}>
                <div className="card flex h-full flex-col p-6">
                  <div className="flex items-center gap-2">
                    <TypeChip type={w.artType} />
                    <span className="chip border-line-strong bg-white/5 text-sand">مسجّلة</span>
                  </div>
                  <h3 className="title-display mt-4 text-lg leading-8 text-paper">{w.title}</h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-7 text-sand">{w.description}</p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-sand">
                    <UserRound size={13} className="text-gold" /> {w.instructor}
                  </p>
                  <div className="mt-5 border-t hairline pt-4">
                    {w.videoUrl ? (
                      /^https?:\/\//.test(w.videoUrl) ? (
                        <a href={w.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-sm w-full">
                          <PlayCircle size={14} /> شاهد التسجيل
                        </a>
                      ) : (
                        <video controls preload="none" src={w.videoUrl} className="w-full rounded-lg bg-coal" />
                      )
                    ) : (
                      <span className="btn btn-ghost btn-sm w-full opacity-60">سيُرفع التسجيل قريبًا</span>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
