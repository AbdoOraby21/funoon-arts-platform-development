import { FileAudio, FileText, Play } from "lucide-react";
import type { Artwork } from "@/db/schema";
import { artMeta } from "@/lib/art";
import { cn, excerpt } from "@/lib/utils";

/**
 * يعرض وسائط العمل الفني بحسب نوع الملف:
 * image → صورة | audio → مشغل مخصص | video → فيديو/يوتيوب | text → مخطوطة خطية
 */
export default function ArtworkMedia({
  artwork,
  mode = "card",
  className,
}: {
  artwork: Pick<Artwork, "fileKind" | "fileUrl" | "title" | "textContent">;
  mode?: "card" | "full";
  className?: string;
}) {
  const meta = artMeta(artwork.fileKind === "text" ? "writing" : undefined);
  const isExternal = artwork.fileUrl.startsWith("http");
  const isYoutube = isExternal && /youtube|youtu\.be/.test(artwork.fileUrl);

  const youtubeId = (() => {
    if (!isYoutube) return null;
    const m = artwork.fileUrl.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/);
    return m?.[1] ?? null;
  })();

  if (artwork.fileKind === "audio") {
    return (
      <div
        className={cn("flex flex-col items-center justify-center gap-4 bg-coal p-6", className)}
        role="group"
        aria-label={`مقطع صوتي: ${artwork.title}`}
      >
        <div className="flex h-14 items-end gap-1.5" aria-hidden="true">
          {[18, 34, 26, 44, 30, 48, 22, 38, 28, 42].map((h, i) => (
            <span
              key={i}
              className="anim-eq w-1.5 rounded-full"
              style={{
                height: h,
                background: "#35BEB2",
                animationDelay: `${i * 0.12}s`,
                animationDuration: `${1.1 + (i % 4) * 0.2}s`,
              }}
            />
          ))}
        </div>
        <FileAudio className="text-[#35BEB2]" size={20} aria-hidden="true" />
        {artwork.fileUrl ? (
          <audio controls preload="none" src={artwork.fileUrl} className="w-full max-w-md" />
        ) : (
          <p className="text-xs text-sand">لا يوجد ملف صوتي مرفق</p>
        )}
      </div>
    );
  }

  if (artwork.fileKind === "video") {
    if (youtubeId) {
      return (
        <div className={cn("aspect-video w-full bg-coal", className)}>
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={artwork.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    if (!artwork.fileUrl) {
      return (
        <div className={cn("grid place-items-center bg-coal p-10", className)}>
          <Play size={40} className="text-[#9B7ED8]" />
        </div>
      );
    }
    return (
      <video
        controls={mode === "full"}
        preload="metadata"
        src={artwork.fileUrl}
        className={cn("w-full bg-coal object-cover", mode === "card" ? "aspect-video" : "max-h-[70vh]", className)}
      />
    );
  }

  if (artwork.fileKind === "text") {
    const text = artwork.textContent ?? "";
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-[#1c1510] p-7",
          mode === "card" ? "aspect-4/3" : "min-h-64",
          className,
        )}
      >
        <span
          className="pointer-events-none absolute -top-8 end-4 select-none font-display text-[150px] font-black leading-none opacity-[0.06]"
          style={{ color: meta.color }}
          aria-hidden="true"
        >
          ن
        </span>
        <FileText size={16} className="mb-3 text-[#D9A648]" aria-hidden="true" />
        <p
          className={cn(
            "whitespace-pre-wrap font-body leading-9 text-paper/90",
            mode === "card" ? "line-clamp-6 text-sm" : "text-lg leading-10",
          )}
        >
          {mode === "card" ? excerpt(text, 220) : text}
        </p>
      </div>
    );
  }

  // image
  if (!artwork.fileUrl) {
    return <div className={cn("aspect-4/3 w-full bg-coal", className)} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={artwork.fileUrl}
      alt={artwork.title}
      loading="lazy"
      className={cn("w-full bg-coal object-cover", mode === "card" ? "aspect-4/3" : "max-h-[72vh]", className)}
    />
  );
}
