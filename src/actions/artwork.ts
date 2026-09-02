"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { artworkLikes, artworks } from "@/db/schema";
import { getActiveUser, requireUser } from "@/lib/auth";
import { ART_TYPES } from "@/lib/art";

export type UploadState = { error?: string } | null;

const MAX_BYTES = 3.5 * 1024 * 1024; // حد نموذج المعاينة (~3.5MB)

export async function uploadArtworkAction(_prev: UploadState, formData: FormData): Promise<UploadState> {
  const user = await requireUser("/upload");

  const type = String(formData.get("type") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const textContent = String(formData.get("textContent") ?? "");
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  const file = formData.get("file");

  if (!ART_TYPES.some((t) => t.key === type)) return { error: "اختر نوع الفن أولًا." };
  if (title.length < 2) return { error: "اكتب عنوانًا للعمل (حرفان على الأقل)." };

  let fileUrl = "";
  let fileKind = "image";

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) return { error: "حجم الملف يتجاوز ٣٫٥ ميجابايت (حد بيئة المعاينة)." };
    const mime = file.type || "application/octet-stream";
    if (mime.startsWith("image/")) fileKind = "image";
    else if (mime.startsWith("audio/")) fileKind = "audio";
    else if (mime.startsWith("video/")) fileKind = "video";
    else return { error: "نوع الملف غير مدعوم — صورة أو صوت أو فيديو فقط." };
    const buf = Buffer.from(await file.arrayBuffer());
    fileUrl = `data:${mime};base64,${buf.toString("base64")}`;
  } else if (externalUrl) {
    if (!/^https?:\/\//.test(externalUrl)) return { error: "الرابط يجب أن يبدأ بـ http أو https." };
    fileUrl = externalUrl;
    fileKind = type === "music" ? "audio" : type === "video" ? "video" : "image";
  } else if (type === "writing") {
    if (textContent.trim().length < 20 && !externalUrl) {
      return { error: "اكتب النص (٢٠ حرفًا على الأقل) أو ارفع صورة للمخطوطة." };
    }
    fileKind = "text";
  } else {
    return { error: "أرفق ملف العمل أو أدخل رابطًا خارجيًا." };
  }

  const row = (
    await db
      .insert(artworks)
      .values({
        userId: user.id,
        type,
        title,
        description,
        fileUrl,
        fileKind,
        textContent: fileKind === "text" ? textContent : null,
      })
      .returning({ id: artworks.id })
  )[0];

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/profile");
  redirect(`/artwork/${row.id}`);
}

/* --------------------------------- إعجاب --------------------------------- */
export async function toggleLikeAction(
  artworkId: string,
): Promise<{ authed: boolean; liked: boolean; count: number }> {
  const user = await getActiveUser();
  if (!user) return { authed: false, liked: false, count: 0 };

  const existing = (
    await db
      .select()
      .from(artworkLikes)
      .where(and(eq(artworkLikes.artworkId, artworkId), eq(artworkLikes.userId, user.id)))
      .limit(1)
  )[0];

  if (existing) {
    await db
      .delete(artworkLikes)
      .where(and(eq(artworkLikes.artworkId, artworkId), eq(artworkLikes.userId, user.id)));
  } else {
    await db.insert(artworkLikes).values({ artworkId, userId: user.id }).onConflictDoNothing();
  }

  const countRow = (
    await db
      .select({ n: sql<number>`count(*)::int` })
      .from(artworkLikes)
      .where(eq(artworkLikes.artworkId, artworkId))
  )[0];
  const count = countRow?.n ?? 0;
  await db.update(artworks).set({ likesCount: count }).where(eq(artworks.id, artworkId));

  return { authed: true, liked: !existing, count };
}

/* --------------------------------- حذف عمل --------------------------------- */
export async function deleteArtworkAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("artworkId") ?? "");
  const row = (await db.select().from(artworks).where(eq(artworks.id, id)).limit(1))[0];
  if (!row) return;
  if (row.userId !== user.id && user.role !== "admin") return;
  await db.delete(artworks).where(eq(artworks.id, id));
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/profile");
  revalidatePath("/admin");
  redirect("/profile");
}
