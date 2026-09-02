import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { BadgePercent, CalendarX2, Tag } from "lucide-react";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { ArtCanvas } from "@/components/backgrounds";
import Reveal from "@/components/reveal";
import { CopyCodeButton } from "@/components/client-actions";
import { EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "العروض",
  description: "عروض وخصومات فُنون النشطة على الورش والكورسات — انسخ الكود واستخدمه عند الاشتراك.",
};

export default async function OffersPage() {
  const list = await db.select().from(offers).orderBy(desc(offers.createdAt));
  const now = new Date();
  const active = list.filter((o) => o.active && (!o.expiresAt || o.expiresAt > now));
  const expired = list.filter((o) => !o.active || (o.expiresAt && o.expiresAt <= now));

  return (
    <div>
      <ArtCanvas type="painting" className="border-b hairline">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="chip mb-4 border-gold/40 bg-gold/10 text-gold-2">
            <Tag size={13} /> هدايا الإدارة
          </p>
          <h1 className="title-display max-w-2xl text-3xl leading-snug sm:text-4xl">
            عروض تجعل طريقك نحو فنّك <span className="text-gold-2">أقرب وأخفّ</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-8 text-sand sm:text-base">
            خصومات موسمية على الورش والكورسات — انسخ الكود واستخدمه عند الاشتراك، قبل انتهاء صلاحيته.
          </p>
        </div>
      </ArtCanvas>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {active.length === 0 ? (
          <EmptyState
            Icon={BadgePercent}
            title="لا توجد عروض نشطة الآن"
            hint="تُعلن العروض الجديدة هنا أولًا — تابع الصفحة في المواسم والأعياد."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {active.map((offer, i) => (
              <Reveal key={offer.id} delay={(i % 3) * 0.07}>
                <div className="card relative overflow-hidden border-gold/35 p-6">
                  <svg className="pointer-events-none absolute inset-y-0 end-0 h-full w-32 opacity-15" viewBox="0 0 100 200" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
                    <circle cx="70" cy="100" r="60" fill="none" stroke="#d9a648" strokeWidth="2" strokeDasharray="8 6" />
                    <circle cx="70" cy="100" r="40" fill="none" stroke="#d9a648" strokeWidth="1.6" strokeDasharray="4 8" />
                  </svg>
                  <div className="relative">
                    <p className="chip border-gold/40 bg-gold/15 text-gold-2">
                      <BadgePercent size={13} />
                      {offer.discount || "عرض خاص"}
                    </p>
                    <h2 className="title-display mt-4 text-xl leading-9 text-paper">{offer.title}</h2>
                    <p className="mt-2 min-h-12 text-sm leading-7 text-sand">{offer.description}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {offer.code && <CopyCodeButton code={offer.code} />}
                      {offer.expiresAt && (
                        <span className="text-xs text-sand">ينتهي في {formatDate(offer.expiresAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {expired.length > 0 && (
          <div className="mt-14">
            <h2 className="title-display mb-5 flex items-center gap-2 text-lg text-sand">
              <CalendarX2 size={17} />
              عروض انتهت
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {expired.map((offer) => (
                <div key={offer.id} className="card border-dashed p-5 opacity-45">
                  <p className="chip border-line-strong bg-white/5 text-sand">{offer.discount || "عرض"}</p>
                  <h3 className="title-display mt-3 text-base text-paper">{offer.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-6 text-sand">{offer.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
