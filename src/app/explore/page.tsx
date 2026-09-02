import Link from "next/link";
import type { Metadata } from "next";
import { Flame, LayoutGrid, Search, SearchX } from "lucide-react";
import { fetchArtworks } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { ART_TYPES } from "@/lib/art";
import { cn } from "@/lib/utils";
import ArtworkCard from "@/components/artwork-card";
import { EmptyState } from "@/components/ui";
import { HeroBg } from "@/components/backgrounds";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "استكشاف الأعمال",
  description: "تصفّح أحدث الأعمال الفنية في الرسم والموسيقى والكتابة والتصوير والفيديو مع بحث وفلاتر ذكية.",
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ExplorePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const type = typeof sp.type === "string" && ART_TYPES.some((t) => t.key === sp.type) ? sp.type : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const sort = sp.sort === "popular" ? "popular" : "latest";

  const user = await getSessionUser();
  const items = await fetchArtworks({
    type: type || undefined,
    q: q || undefined,
    sort,
    limit: 48,
    userId: user?.id ?? null,
  });

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const next = { type: type || undefined, q: q || undefined, sort: sort === "popular" ? "popular" : undefined, ...patch };
    Object.entries(next).forEach(([k, v]) => v && params.set(k, v));
    const str = params.toString();
    return `/explore${str ? `?${str}` : ""}`;
  };

  return (
    <div>
      <section className="relative overflow-hidden border-b hairline">
        <HeroBg />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="title-display text-3xl sm:text-4xl">
            {type ? `جناح ${ART_TYPES.find((t) => t.key === type)?.ar}` : "معرض فُنون المفتوح"}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-7 text-sand">
            تجوّل بين الأروقة: رشّح بنوع الفن، شاهد الأكثر تفاعلًا، أو ابحث باسم عملٍ أو فكرته.
          </p>

          <form action="/explore" method="get" className="mt-6 flex max-w-xl items-center gap-2" role="search">
            {type && <input type="hidden" name="type" value={type} />}
            <div className="relative flex-1">
              <Search size={17} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-sand" />
              <input
                name="q"
                defaultValue={q}
                placeholder="ابحث عن لوحة، قصيدة، مقطع…"
                className="input ps-10"
                aria-label="بحث في الأعمال"
              />
            </div>
            <button type="submit" className="btn btn-gold">بحث</button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-2" role="tablist" aria-label="تصفية حسب نوع الفن">
            <Link
              href={buildHref({ type: undefined })}
              className={cn("chip transition-transform hover:scale-105", !type ? "border-gold bg-gold/15 text-gold-2" : "border-line-strong bg-white/5 text-sand hover:text-paper")}
            >
              <LayoutGrid size={13} />
              الكل
            </Link>
            {ART_TYPES.map((t) => (
              <Link
                key={t.key}
                href={buildHref({ type: t.key })}
                className={cn("chip transition-transform hover:scale-105")}
                style={
                  type === t.key
                    ? { color: t.color, borderColor: t.color, background: t.soft, boxShadow: `0 0 18px -4px ${t.color}88` }
                    : { color: "var(--color-sand)", borderColor: "var(--color-line-strong)", background: "rgba(255,255,255,0.04)" }
                }
              >
                <t.Icon size={13} />
                {t.ar}
              </Link>
            ))}
            <span className="mx-2 hidden h-5 w-px bg-line-strong sm:block" aria-hidden="true" />
            <Link
              href={buildHref({ sort: sort === "popular" ? undefined : "popular" })}
              className={cn("chip transition-transform hover:scale-105", sort === "popular" ? "border-gold bg-gold/15 text-gold-2" : "border-line-strong bg-white/5 text-sand hover:text-paper")}
            >
              <Flame size={13} />
              الأكثر تفاعلًا
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="mb-6 text-xs text-sand" aria-live="polite">
          {items.length ? `${items.length} عمل فني ${q ? `لنتيجة «${q}»` : ""}` : null}
        </p>
        {items.length === 0 ? (
          <EmptyState
            Icon={SearchX}
            title="لا توجد أعمال مطابقة"
            hint="جرّب كلمة بحث أقصر، أو غيّر نوع الفن من الشرائح بالأعلى."
            action={<Link href="/explore" className="btn btn-ghost btn-sm mt-2">إظهار كل الأعمال</Link>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((d) => (
              <ArtworkCard key={d.artwork.id} data={d} authed={!!user} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
