import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import {
  Activity,
  ClipboardList,
  GraduationCap,
  Heart,
  Images,
  Ticket,
  Users,
} from "lucide-react";
import { db } from "@/db";
import {
  artworks,
  courseEnrollments,
  examSubmissions,
  offers,
  users,
  workshopBookings,
} from "@/db/schema";
import { ART_TYPES, artMeta } from "@/lib/art";
import { formatDate, initials } from "@/lib/utils";
import { LevelBadge, TypeChip } from "@/components/ui";

export const dynamic = "force-dynamic";

const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export default async function AdminDashboard() {
  const [
    [usersCount],
    [artworksCount],
    [likesSum],
    [subsCount],
    [enrollCount],
    [bookingCount],
    [activeOffers],
    byType,
    byMonth,
    latestUsers,
    latestArtworks,
  ] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(users),
    db.select({ n: sql<number>`count(*)::int` }).from(artworks),
    db.select({ n: sql<number>`coalesce(sum(${artworks.likesCount}),0)::int` }).from(artworks),
    db.select({ n: sql<number>`count(*)::int` }).from(examSubmissions),
    db.select({ n: sql<number>`count(*)::int` }).from(courseEnrollments),
    db.select({ n: sql<number>`count(*)::int` }).from(workshopBookings),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(offers)
      .where(eq(offers.active, true)),
    db
      .select({ type: artworks.type, n: sql<number>`count(*)::int` })
      .from(artworks)
      .groupBy(artworks.type),
    db
      .select({
        m: sql<string>`to_char(date_trunc('month', ${users.createdAt} at time zone 'UTC'), 'YYYY-MM')`,
        n: sql<number>`count(*)::int`,
      })
      .from(users)
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db.select().from(users).orderBy(desc(users.createdAt)).limit(6),
    db
      .select({ artwork: artworks, authorName: users.name })
      .from(artworks)
      .innerJoin(users, eq(artworks.userId, users.id))
      .orderBy(desc(artworks.createdAt))
      .limit(6),
  ]);

  // آخر ٦ أشهر
  const monthMap = new Map(byMonth.map((r) => [r.m, r.n]));
  const months: { label: string; n: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    months.push({ label: AR_MONTHS[d.getUTCMonth()], n: monthMap.get(key) ?? 0 });
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.n));
  const typeMap = Object.fromEntries(byType.map((r) => [r.type, r.n]));
  const maxType = Math.max(1, ...ART_TYPES.map((t) => typeMap[t.key] ?? 0));

  const stats = [
    { Icon: Users, label: "المستخدمون", value: usersCount?.n ?? 0, accent: "#d9a648" },
    { Icon: Images, label: "الأعمال المرفوعة", value: artworksCount?.n ?? 0, accent: "#E0698B" },
    { Icon: Heart, label: "إجمالي الإعجابات", value: likesSum?.n ?? 0, accent: "#E0698B" },
    { Icon: ClipboardList, label: "تسليمات الاختبارات", value: subsCount?.n ?? 0, accent: "#35BEB2" },
    { Icon: GraduationCap, label: "اشتراكات الكورسات", value: enrollCount?.n ?? 0, accent: "#6F9BD1" },
    { Icon: Ticket, label: "حجوزات الورش", value: bookingCount?.n ?? 0, accent: "#9B7ED8" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="title-display text-2xl sm:text-3xl">نبض المنصة</h1>
        <p className="mt-1 text-sm text-sand">
          نظرة سريعة على النمو — {activeOffers?.n ?? 0} عرض نشط حاليًا.
        </p>
      </div>

      {/* البطاقات */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ Icon, label, value, accent }) => (
          <div key={label} className="card relative overflow-hidden p-4">
            <div
              className="absolute -top-6 end-[-18px] size-16 rounded-full opacity-25 blur-2xl"
              style={{ background: accent }}
            />
            <span className="grid size-9 place-items-center rounded-lg" style={{ background: `${accent}1f`, color: accent }}>
              <Icon size={16} />
            </span>
            <p className="title-display mt-3 text-2xl">{value}</p>
            <p className="text-[11px] text-sand">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* نمو المستخدمين */}
        <div className="card p-6">
          <h2 className="title-display flex items-center gap-2 text-lg">
            <Activity className="text-gold" size={18} />
            نمو المستخدمين — آخر ٦ أشهر
          </h2>
          <div className="mt-6 flex h-44 items-end gap-3">
            {months.map((m, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] text-sand">{m.n}</span>
                <div
                  className="w-full max-w-10 rounded-t-lg transition-all"
                  style={{
                    height: `${Math.max(4, (m.n / maxMonth) * 100)}%`,
                    background: i === months.length - 1 ? "#d9a648" : "rgba(217,166,72,0.35)",
                    minHeight: 6,
                  }}
                  title={`${m.label}: ${m.n}`}
                />
                <span className="text-[10px] text-sand">{m.label.slice(0, 5)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* الأعمال حسب الفن */}
        <div className="card p-6">
          <h2 className="title-display flex items-center gap-2 text-lg">
            <Images className="text-gold" size={18} />
            الأعمال حسب نوع الفن
          </h2>
          <div className="mt-5 space-y-3.5">
            {ART_TYPES.map((t) => {
              const n = typeMap[t.key] ?? 0;
              return (
                <div key={t.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-paper">
                      <t.Icon size={12} style={{ color: t.color }} />
                      {t.ar}
                    </span>
                    <span className="text-sand">{n}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(n / maxType) * 100}%`, background: t.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* أحدث المستخدمين */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="title-display text-lg">أحدث المنضمين</h2>
            <Link href="/admin/users" className="text-xs text-gold-2 hover:underline">إدارة المستخدمين</Link>
          </div>
          <div className="divide-y divide-[rgba(233,219,188,0.08)]">
            {latestUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-coal"
                  style={{ background: artMeta(u.artType).color }}
                >
                  {initials(u.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {u.name}
                    {u.banned && <span className="ms-2 text-[10px] text-danger">محظور</span>}
                  </p>
                  <p className="truncate text-[11px] text-sand" dir="ltr">{u.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <LevelBadge level={u.level} />
                  <span className="hidden text-[10px] text-sand sm:block">{formatDate(u.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* أحدث الأعمال */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="title-display text-lg">أحدث الأعمال المرفوعة</h2>
            <Link href="/explore" className="text-xs text-gold-2 hover:underline">عرض في الموقع</Link>
          </div>
          <div className="divide-y divide-[rgba(233,219,188,0.08)]">
            {latestArtworks.map(({ artwork: a, authorName }) => {
              const meta = artMeta(a.type);
              return (
                <Link key={a.id} href={`/artwork/${a.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/3">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-lg"
                    style={{ background: meta.soft, color: meta.color }}
                  >
                    <meta.Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="text-[11px] text-sand">{authorName} — {formatDate(a.createdAt)}</p>
                  </div>
                  <TypeChip type={a.type} withLabel={false} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
