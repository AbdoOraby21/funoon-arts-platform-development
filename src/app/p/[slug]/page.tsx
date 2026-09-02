import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { WritingBg } from "@/components/backgrounds";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

async function loadPage(slug: string) {
  const row = (
    await db
      .select()
      .from(pages)
      .where(and(eq(pages.slug, slug), eq(pages.published, true)))
      .limit(1)
  )[0];
  return row;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  return page ? { title: page.title } : { title: "صفحة غير موجودة" };
}

export default async function StaticPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) notFound();

  return (
    <div className="relative overflow-hidden">
      <WritingBg />
      <article className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="chip mb-4 border-gold/40 bg-gold/10 text-gold-2">فُنون</p>
        <h1 className="title-display text-3xl leading-snug sm:text-4xl">{page.title}</h1>
        <p className="mt-2 text-xs text-sand">آخر تحديث: {formatDate(page.updatedAt)}</p>
        <div className="card mt-8 p-6 sm:p-9">
          <p className="whitespace-pre-wrap text-[15px] leading-9 text-paper/90">{page.content}</p>
        </div>
      </article>
    </div>
  );
}
