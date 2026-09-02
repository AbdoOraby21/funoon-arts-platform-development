import Link from "next/link";
import { desc, gt, or, isNull } from "drizzle-orm";
import {
  ArrowLeft,
  CalendarClock,
  Compass,
  GraduationCap,
  Heart,
  Images,
  PenSquare,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { db } from "@/db";
import { offers, workshops } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { fetchArtworks, fetchPlatformStats, fetchTypeCounts } from "@/lib/queries";
import { ART_TYPES, artMeta } from "@/lib/art";
import { formatDate } from "@/lib/utils";
import { HeroBg, ArtCanvas } from "@/components/backgrounds";
import ArtworkCard from "@/components/artwork-card";
import Reveal from "@/components/reveal";
import { SectionTitle, TypeChip } from "@/components/ui";

export const dynamic = "force-dynamic";

const MARQUEE_WORDS = ["رسم", "موسيقى", "كتابة", "تصوير", "فيديو", "خطّ عربي", "مقامات", "سينما", "ألوان", "حكايات"];

export default async function HomePage() {
  const user = await getSessionUser();
  const [latest, counts, stats, upcoming, offer] = await Promise.all([
    fetchArtworks({ limit: 8, userId: user?.id ?? null }),
    fetchTypeCounts(),
    fetchPlatformStats(),
    db.select().from(workshops).orderBy(desc(workshops.startsAt)).limit(3),
    db
      .select()
      .from(offers)
      .where(or(isNull(offers.expiresAt), gt(offers.expiresAt, new Date())))
      .orderBy(desc(offers.createdAt))
      .limit(1),
  ]);

  const items = latest;
  const activeOffer = offer[0]?.active ? offer[0] : null;

  return (
    <div>
      {/* ============================ الهيرو ============================ */}
      <section className="relative overflow-hidden border-b hairline">
        <HeroBg />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pb-24 lg:pt-24">
          <div className="flex flex-col items-start justify-center">
            <Reveal>
              <p className="chip mb-5 border-gold/40 bg-gold/10 text-gold-2">
                <Sparkles size={13} />
                بيتُ الفنون العربية
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="title-display text-4xl leading-[1.25] sm:text-5xl lg:text-[3.4rem] lg:leading-[1.2]">
                مساحةٌ واحدة تجمعُ
                <span className="relative mx-3 inline-block text-gold-2">
                  كلَّ الفنون
                  <svg className="absolute -bottom-2 end-0 h-3 w-full" viewBox="0 0 200 12" aria-hidden="true">
                    <path d="M4 8 C 60 2 140 12 196 6" stroke="#d9a648" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
                تحت سقفٍ واحد
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-base leading-8 text-sand sm:text-lg">
                رسّام وموسيقيّ وكاتب ومصوّر وصانع أفلام… في «فُنون» تعرض عملك كما يليق به،
                تختبر مستواك، وتحجز مكانك في ورش وكورسات يقودها فنانون حقيقيون.
              </p>
            </Reveal>
            <Reveal delay={0.24} className="mt-8 flex flex-wrap gap-3">
              <Link href="/explore" className="btn btn-gold">
                <Compass size={17} />
                استكشف المعرض
              </Link>
              <Link href="/upload" className="btn btn-ghost">
                <PenSquare size={17} />
                ارفع عملك
              </Link>
            </Reveal>
            <Reveal delay={0.32} className="mt-10 flex flex-wrap gap-7 text-sm">
              {[
                { Icon: Users, label: "فنان وفنانة", value: stats.users },
                { Icon: Images, label: "عمل فني معروض", value: stats.artworks },
                { Icon: Heart, label: "إعجاب داخل الاستوديو", value: stats.likes },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-lg bg-gold/10 text-gold">
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="title-display text-lg leading-5">{value}</p>
                    <p className="text-xs text-sand">{label}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>

          {/* تركيبة بصرية: بطاقات عائمة */}
          <Reveal delay={0.2} className="relative hidden min-h-105 lg:block">
            <div className="anim-float absolute end-4 top-2 w-60 rotate-[5deg]">
              <div className="card overflow-hidden border-line-strong shadow-2xl shadow-black/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/art/painting-1.jpg" alt="لوحة مائية" className="aspect-4/5 w-full object-cover" />
                <div className="p-3"><TypeChip type="painting" /></div>
              </div>
            </div>
            <div className="anim-float absolute end-52 top-40 w-56 rotate-[-7deg]" style={{ animationDelay: "1.4s" }}>
              <div className="card overflow-hidden border-line-strong shadow-2xl shadow-black/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/art/photo-1.jpg" alt="لقطة سينمائية" className="aspect-square w-full object-cover" />
                <div className="p-3"><TypeChip type="photography" /></div>
              </div>
            </div>
            <div className="anim-float absolute end-10 top-64 w-52 rotate-[3deg]" style={{ animationDelay: "2.6s" }}>
              <div className="card overflow-hidden border-line-strong shadow-2xl shadow-black/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/art/music-1.jpg" alt="آلة العود" className="aspect-4/3 w-full object-cover" />
                <div className="p-3"><TypeChip type="music" /></div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* شريط الكلمات المتحرك */}
        <div className="relative border-t hairline py-3.5" aria-hidden="true">
          <div className="flex w-max gap-10 anim-marquee" dir="ltr">
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-sm font-bold text-sand/60">
                {w}
                <span className="size-1.5 rounded-full bg-gold/50" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ الفنون الخمسة ============================ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionTitle
            eyebrow="الاستوديوهات"
            title="خمسة فنون، خمس روح"
            subtitle="لكل فنٍ جناحه ولونه وخلفيته المرسومة خصيصًا — ادخل جناحك المفضّل."
          />
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {ART_TYPES.map((t, i) => (
            <Reveal key={t.key} delay={i * 0.06}>
              <Link
                href={`/explore?type=${t.key}`}
                className="card group relative block overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1.5"
                style={{ boxShadow: "none" }}
                onMouseEnter={undefined}
              >
                <div
                  className="pointer-events-none absolute -top-10 end-[-30px] size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
                  style={{ background: t.color }}
                />
                <span
                  className="mb-4 grid size-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: t.soft, color: t.color, border: `1px solid ${t.color}44` }}
                >
                  <t.Icon size={22} />
                </span>
                <h3 className="title-display text-lg text-paper">{t.ar}</h3>
                <p className="mt-1 min-h-10 text-xs leading-5 text-sand">{t.tagline}</p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: t.color }}>
                  {counts[t.key] ?? 0} عمل
                  <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ أحدث الأعمال ============================ */}
      <ArtCanvas type="writing" className="border-y hairline bg-coal/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal>
            <SectionTitle
              eyebrow="من المعرض"
              title="وصل حديثًا إلى الجدران"
              subtitle="أعمال يرفعها الفنانون لحظة بلحظة — رتّبتها لك كما خرجت من الاستوديوهات."
              action={
                <Link href="/explore" className="btn btn-ghost btn-sm">
                  كل الأعمال <ArrowLeft size={14} />
                </Link>
              }
            />
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((d, i) => (
              <Reveal key={d.artwork.id} delay={(i % 4) * 0.06}>
                <ArtworkCard data={d} authed={!!user} />
              </Reveal>
            ))}
          </div>
        </div>
      </ArtCanvas>

      {/* ============================ الورش ============================ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionTitle
            eyebrow="تعلّم مباشرة"
            title="ورش هذا الموسم"
            subtitle="مقاعد محدودة، فنانون يشرحون وجهًا لوجه — احجز مكانك قبل اكتمال العدد."
            action={
              <Link href="/workshops" className="btn btn-ghost btn-sm">
                كل الورش <ArrowLeft size={14} />
              </Link>
            }
          />
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {upcoming.map((w, i) => {
            const meta = artMeta(w.artType);
            return (
              <Reveal key={w.id} delay={i * 0.07}>
                <div className="card group relative overflow-hidden p-5">
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-1"
                    style={{ background: meta.color }}
                  />
                  <TypeChip type={w.artType} />
                  <h3 className="title-display mt-3 text-lg leading-8 text-paper">{w.title}</h3>
                  <p className="mt-1 text-xs text-sand">مع {w.instructor}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-sand">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock size={13} className="text-gold" />
                      {formatDate(w.startsAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Ticket size={13} className="text-gold" />
                      السعة {w.capacity} مقعدًا
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============================ عرض نشط ============================ */}
      {activeOffer && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <Reveal>
            <div className="card relative overflow-hidden border-gold/40 p-8 lg:p-10">
              <svg className="pointer-events-none absolute inset-y-0 end-0 h-full w-2/5 opacity-20" viewBox="0 0 400 300" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
                <circle cx="300" cy="150" r="130" fill="none" stroke="#d9a648" strokeWidth="2.5" strokeDasharray="10 8" />
                <circle cx="300" cy="150" r="90" fill="none" stroke="#d9a648" strokeWidth="2" strokeDasharray="6 10" />
              </svg>
              <p className="chip mb-3 border-gold/40 bg-gold/15 text-gold-2">عرض محدود</p>
              <h3 className="title-display max-w-xl text-2xl leading-10 sm:text-3xl">{activeOffer.title}</h3>
              <p className="mt-2 max-w-lg text-sm leading-7 text-sand">{activeOffer.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="title-display text-xl text-gold-2">{activeOffer.discount}</span>
                <Link href="/offers" className="btn btn-gold btn-sm">
                  اكتشف العرض <ArrowLeft size={14} />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ============================ دعوة أخيرة ============================ */}
      <ArtCanvas type="painting" className="border-t hairline">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <Reveal>
            <h2 className="title-display text-3xl leading-snug sm:text-4xl">
              لا تعرف مستواك بعد؟
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-sand sm:text-base">
              خُض اختبار فُنون النظري والعملي في فنّك، وسيُحدَّد مستواك تلقائيًا — ثم نوصيك بالكورس المناسب لخطوتك التالية.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/exams" className="btn btn-gold">
                <Sparkles size={16} />
                ابدأ اختبار المستوى
              </Link>
              <Link href="/courses" className="btn btn-ghost">
                <GraduationCap size={16} />
                تصفّح الكورسات
              </Link>
            </div>
          </Reveal>
        </div>
      </ArtCanvas>
    </div>
  );
}
