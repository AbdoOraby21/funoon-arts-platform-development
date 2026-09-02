"use client";

import { useActionState, useState } from "react";
import { AlertCircle, CloudUpload, Link2, UploadCloud } from "lucide-react";
import { ART_TYPES, type ArtType } from "@/lib/art";
import { uploadArtworkAction } from "@/actions/artwork";
import { cn } from "@/lib/utils";

const ACCEPT: Record<string, string> = {
  painting: "image/*",
  photography: "image/*",
  music: "audio/*",
  video: "video/*",
  writing: "image/*",
};

const FILE_HINT: Record<string, string> = {
  painting: "ارفع صورة لوحتك (PNG/JPG حتى 3.5MB)",
  photography: "ارفع لقطتك (PNG/JPG حتى 3.5MB)",
  music: "ارفع مقطعك الصوتي (MP3/WAV حتى 3.5MB)",
  video: "ارفع الفيديو (MP4 حتى 3.5MB) أو ضع رابطًا",
  writing: "اختياري: ارفع صورة لمخطوطتك بدل كتابة النص",
};

export default function UploadForm({ defaultType }: { defaultType: string }) {
  const [type, setType] = useState<ArtType>(
    (ART_TYPES.find((t) => t.key === defaultType)?.key ?? "painting") as ArtType,
  );
  const [fileName, setFileName] = useState("");
  const [state, formAction, pending] = useActionState(uploadArtworkAction, null);

  const showUrl = type === "music" || type === "video";
  const isWriting = type === "writing";

  return (
    <form action={formAction} className="space-y-5">
      {/* نوع الفن */}
      <fieldset>
        <legend className="label">نوع الفن</legend>
        <input type="hidden" name="type" value={type} />
        <div className="flex flex-wrap gap-2">
          {ART_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setType(t.key); setFileName(""); }}
              aria-pressed={type === t.key}
              className="chip cursor-pointer transition-all hover:scale-105"
              style={
                type === t.key
                  ? { color: t.color, borderColor: t.color, background: t.soft, boxShadow: `0 0 16px -4px ${t.color}77` }
                  : { color: "var(--color-sand)", borderColor: "var(--color-line-strong)", background: "rgba(255,255,255,0.04)" }
              }
            >
              <t.Icon size={13} />
              {t.ar}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="title" className="label">عنوان العمل</label>
        <input id="title" name="title" required minLength={2} maxLength={200} placeholder="مثال: «غروب على النيل»" className="input" />
      </div>

      <div>
        <label htmlFor="description" className="label">وصف قصير (اختياري)</label>
        <textarea id="description" name="description" rows={3} placeholder="خلفية العمل، الأدوات المستخدمة، الإحساس…" className="input resize-y" />
      </div>

      {isWriting && (
        <div>
          <label htmlFor="textContent" className="label">النص الأدبي</label>
          <textarea
            id="textContent"
            name="textContent"
            rows={8}
            placeholder="اكتب قصيدتك أو قصّتك هنا… تحفظ بتنسيق مخطوطة فاخر."
            className="input resize-y leading-8"
          />
        </div>
      )}

      {/* الملف */}
      <div>
        <label className="label" htmlFor="file">ملف العمل</label>
        <label
          htmlFor="file"
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong bg-coal/40 px-6 py-9 text-center transition-colors hover:border-gold/60",
            fileName && "border-gold/60 bg-gold/5",
          )}
        >
          <UploadCloud size={30} className="text-gold" />
          <span className="text-sm font-medium text-paper">
            {fileName ? fileName : "اضغط لاختيار ملف من جهازك"}
          </span>
          <span className="text-xs text-sand">{FILE_HINT[type]}</span>
          <input
            id="file"
            name="file"
            type="file"
            accept={ACCEPT[type]}
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </label>
      </div>

      {(showUrl || isWriting) && (
        <div>
          <label htmlFor="externalUrl" className="label">
            {isWriting ? "أو رابط صورة خارجية" : "أو رابط خارجي"}
            {type === "video" && <span className="text-sand/70"> (يدعم يوتيوب)</span>}
          </label>
          <div className="relative">
            <Link2 size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-sand" />
            <input id="externalUrl" name="externalUrl" type="url" dir="ltr" placeholder="https://…" className="input ps-10" />
          </div>
        </div>
      )}

      {state?.error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          <AlertCircle size={15} /> {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-gold w-full">
        <CloudUpload size={17} />
        {pending ? "جارٍ رفع العمل…" : "انشر العمل في المعرض"}
      </button>
      <p className="text-center text-[11px] leading-5 text-sand/70">
        ملاحظة بيئة المعاينة: تُخزَّن الملفات داخل قاعدة البيانات (حد 3.5MB). في الإنتاج تُربط بمزوّد تخزين مثل Cloudinary بنفس الواجهة.
      </p>
    </form>
  );
}
