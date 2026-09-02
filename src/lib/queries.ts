import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  artworkLikes,
  artworks,
  courseEnrollments,
  users,
  workshopBookings,
  type Artwork,
} from "@/db/schema";

/** عدد الحجوزات لكل ورشة */
export async function bookingCounts(ids: string[]): Promise<Record<string, number>> {
  if (!ids.length) return {};
  const rows = await db
    .select({ id: workshopBookings.workshopId, n: sql<number>`count(*)::int` })
    .from(workshopBookings)
    .where(inArray(workshopBookings.workshopId, ids))
    .groupBy(workshopBookings.workshopId);
  const map: Record<string, number> = {};
  rows.forEach((r) => (map[r.id] = r.n));
  return map;
}

/** عدد المشتركين لكل كورس */
export async function enrollmentCounts(ids: string[]): Promise<Record<string, number>> {
  if (!ids.length) return {};
  const rows = await db
    .select({ id: courseEnrollments.courseId, n: sql<number>`count(*)::int` })
    .from(courseEnrollments)
    .where(inArray(courseEnrollments.courseId, ids))
    .groupBy(courseEnrollments.courseId);
  const map: Record<string, number> = {};
  rows.forEach((r) => (map[r.id] = r.n));
  return map;
}

export interface ArtworkCardData {
  artwork: Artwork;
  author: { id: string; name: string; level: string; artType: string };
  liked: boolean;
}

export async function fetchArtworks(opts: {
  type?: string;
  q?: string;
  sort?: "latest" | "popular";
  limit?: number;
  userId?: string | null;
  authorId?: string;
}): Promise<ArtworkCardData[]> {
  const conds = [];
  if (opts.type) conds.push(eq(artworks.type, opts.type));
  if (opts.authorId) conds.push(eq(artworks.userId, opts.authorId));
  if (opts.q) {
    const like = `%${opts.q.replace(/[%_]/g, "")}%`;
    conds.push(or(ilike(artworks.title, like), ilike(artworks.description, like)));
  }

  const rows = await db
    .select({
      artwork: artworks,
      authorId: users.id,
      authorName: users.name,
      authorLevel: users.level,
      authorArt: users.artType,
    })
    .from(artworks)
    .innerJoin(users, eq(artworks.userId, users.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(
      opts.sort === "popular" ? desc(artworks.likesCount) : desc(artworks.createdAt),
      desc(artworks.createdAt),
    )
    .limit(opts.limit ?? 24);

  let likedIds = new Set<string>();
  if (opts.userId && rows.length) {
    const liked = await db
      .select({ artworkId: artworkLikes.artworkId })
      .from(artworkLikes)
      .where(
        and(
          eq(artworkLikes.userId, opts.userId),
          inArray(
            artworkLikes.artworkId,
            rows.map((r) => r.artwork.id),
          ),
        ),
      );
    likedIds = new Set(liked.map((l) => l.artworkId));
  }

  return rows.map((r) => ({
    artwork: r.artwork,
    author: { id: r.authorId, name: r.authorName, level: r.authorLevel, artType: r.authorArt },
    liked: likedIds.has(r.artwork.id),
  }));
}

export async function fetchTypeCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({ type: artworks.type, n: sql<number>`count(*)::int` })
    .from(artworks)
    .groupBy(artworks.type);
  const map: Record<string, number> = {};
  for (const r of rows) map[r.type] = r.n;
  return map;
}

export async function fetchPlatformStats() {
  const [u] = await db.select({ n: sql<number>`count(*)::int` }).from(users);
  const [a] = await db.select({ n: sql<number>`count(*)::int` }).from(artworks);
  const likes = (
    await db.select({ n: sql<number>`coalesce(sum(${artworks.likesCount}),0)::int` }).from(artworks)
  )[0];
  return { users: u?.n ?? 0, artworks: a?.n ?? 0, likes: likes?.n ?? 0 };
}
