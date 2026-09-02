import Link from "next/link";
import { Eye } from "lucide-react";
import type { CSSProperties } from "react";
import type { ArtworkCardData } from "@/lib/queries";
import { artMeta } from "@/lib/art";
import { initials, timeAgo } from "@/lib/utils";
import ArtworkMedia from "@/components/artwork-media";
import { TypeChip } from "@/components/ui";
import LikeButton from "@/components/like-button";

export default function ArtworkCard({ data, authed }: { data: ArtworkCardData; authed: boolean }) {
  const { artwork, author, liked } = data;
  const meta = artMeta(artwork.type);
  const openable = artwork.fileKind === "image" || artwork.fileKind === "text";

  return (
    <article
      className="card group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_-22px_var(--glow)]"
      style={{ "--glow": `${meta.color}66` } as CSSProperties}
    >
      <div className="relative overflow-hidden">
        {openable ? (
          <Link
            href={`/artwork/${artwork.id}`}
            aria-label={`عرض العمل: ${artwork.title}`}
            className="block overflow-hidden"
          >
            <div className="transition-transform duration-500 group-hover:scale-[1.045]">
              <ArtworkMedia artwork={artwork} mode="card" />
            </div>
          </Link>
        ) : (
          <ArtworkMedia artwork={artwork} mode="card" />
        )}
        <TypeChip type={artwork.type} className="absolute start-3 top-3 backdrop-blur-sm" />
      </div>

      <div className="space-y-3 p-4">
        <Link
          href={`/artwork/${artwork.id}`}
          className="title-display block truncate text-base text-paper transition-colors hover:text-gold-2"
        >
          {artwork.title}
        </Link>

        <div className="flex items-center gap-2.5">
          <span
            className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-coal"
            style={{ background: artMeta(author.artType).color }}
            aria-hidden="true"
          >
            {initials(author.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-paper/90">{author.name}</p>
            <p className="text-[11px] text-sand">{timeAgo(artwork.createdAt)}</p>
          </div>
          <div className="ms-auto flex items-center gap-3 text-xs text-sand">
            <span className="inline-flex items-center gap-1" title="المشاهدات">
              <Eye size={13} /> {artwork.viewsCount}
            </span>
            <LikeButton artworkId={artwork.id} initialLiked={liked} initialCount={artwork.likesCount} authed={authed} />
          </div>
        </div>
      </div>
    </article>
  );
}
