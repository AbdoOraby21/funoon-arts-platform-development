import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { ArrowRight, CalendarDays, Eye, Trash2 } from "lucide-react";
import { db } from "@/db";
import { artworkLikes, artworks, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { artMeta } from "@/lib/art";
import { cn, excerpt, formatDate, initials } from "@/lib/utils";
import ArtworkMedia from "@/components/artwork-media";
import ArtworkCard from "@/components/artwork-card";
import LikeButton from "@/components/like-button";
import { ConfirmSubmit } from "@/components/client-actions";
import { LevelBadge, TypeChip } from "@/components/ui";
import { deleteArtworkAction } from "@/actions/artwork";
import { fetchArtworks } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

async function loadArtwork(id: string) {
  const rows = await db
    .select({
      artwork: artworks,
      authorId: users.id,
      authorName: users.name,
      authorLevel: users.level,
      authorArt: users.artType,
      authorBio: users.bio,
    })
    .from(artworks)
    .innerJoin(users, eq(artworks.userId, users.id))
    .where(eq(artworks.id, id))
    .limit(1);
  return rows[0];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const row = await loadArtwork(id);
  if (!row) return { title: "عمل غير موجود" };
  const { artwork } = row;
  return {
    title: `${artwork.title} — ${row.authorName}`,
    description: artwork.description ? excerpt(artwork.description, 150) : `عمل فني في قسم ${artMeta(artwork.type).ar} على منصة فُنون.`,
    openGraph: {
      title: artwork.title,
      description: artwork.description ? excerpt(artwork.description, 120) : undefined,
      type: "article",
      images: artwork.fileKind === "image" && artwork.fileUrl.startsWith("/") ? [artwork.fileUrl] : undefined,
    },
  };
}

export default async function ArtworkPage({ params }: { params: Params }) {
  const { id } = await params;
  const row = await loadArtwork(id);
  if (!row) notFound();

  const { artwork } = row;
  const meta = artMeta(artwork.type);
  const user = await getSessionUser();

  // عدّاد مشاهدات بسيط
  await db
    .update(artworks)
    .set({ viewsCount: sql`${artworks.viewsCount} + 1` })
    .where(eq(artworks.id, artwork.id));

  const liked = user
    ? !!(
        await db
          .select({ artworkId: artworkLikes.artworkId })
          .from(artworkLikes)
          .where(and(eq(artworkLikes.artworkId, artwork.id), eq(artworkLikes.userId, user.id)))
          .limit(1)
      )[0]
    : false;

  const related = (
    await fetchArtworks({ type: artwork.type, limit: 5, userId: user?.id ?? null })
  ).filter((r) => r.artwork.id !== artwork.id).slice(0, 4);

  const canDelete = user && (user.id === row.authorId || user.role === "admin");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link href={`/explore?type=${artwork.type}`} className="mb-6 inline-flex items-center gap-2 text-sm text-sand transition-colors hover:text-gold-2">
        <ArrowRight size={15} />
        العودة إلى جناح {meta.ar}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* الوسائط */}
        <div
          className="card overflow-hidden"
          style={{ boxShadow: `0 30px 80px -40px ${meta.color}55` }}
        >
          <ArtworkMedia artwork={artwork} mode="full" />
        </div>

        {/* التفاصيل */}
        <aside className="space-y-5">
          <div className="card p-6">
            <TypeChip type={artwork.type} />
            <h1 className="title-display mt-4 text-2xl leading-10 sm:text-3xl">{artwork.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-sand">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} className="text-gold" />
                {formatDate(artwork.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye size={13} className="text-gold" />
                {artwork.viewsCount + 1} مشاهدة
              </span>
            </div>
            {artwork.description && (
              <p className="mt-5 whitespace-pre-wrap border-t hairline pt-5 text-sm leading-8 text-paper/85">
                {artwork.description}
              </p>
            )}
            <div className="mt-6 border-t hairline pt-5">
              <LikeButton
                artworkId={artwork.id}
                initialLiked={liked}
                initialCount={artwork.likesCount}
                authed={!!user}
                activeColor={meta.color}
                big
              />
            </div>
          </div>

          {/* الفنان */}
          <div className="card flex items-center gap-4 p-5">
            <span
              className="grid size-14 shrink-0 place-items-center rounded-2xl text-lg font-bold text-coal"
              style={{ background: artMeta(row.authorArt).color }}
            >
              {initials(row.authorName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="title-display text-paper">{row.authorName}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <LevelBadge level={row.authorLevel} />
                <TypeChip type={row.authorArt} />
              </div>
            </div>
          </div>

          {canDelete && (
            <form action={deleteArtworkAction}>
              <input type="hidden" name="artworkId" value={artwork.id} />
              <ConfirmSubmit
                className="w-full"
                label={
                  <span className={cn("inline-flex items-center gap-2")}>
                    <Trash2 size={14} /> حذف هذا العمل
                  </span>
                }
                confirm="تأكيد الحذف النهائي؟"
              />
            </form>
          )}
        </aside>
      </div>

      {/* أعمال ذات صلة */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="title-display mb-6 text-2xl">من جناح {meta.ar} أيضًا</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((d) => (
              <ArtworkCard key={d.artwork.id} data={d} authed={!!user} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
