import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ArtCanvas } from "@/components/backgrounds";
import UploadForm from "./upload-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "رفع عمل فني" };

export default async function UploadPage() {
  const user = await requireUser("/upload");
  return (
    <ArtCanvas type={user.artType as never} className="min-h-[85vh]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="chip mb-4 border-gold/40 bg-gold/10 text-gold-2">استوديو الرفع</p>
        <h1 className="title-display text-3xl sm:text-4xl">علّق عملك على الجدار</h1>
        <p className="mt-2 max-w-xl text-sm leading-7 text-sand">
          صورة، مقطع صوتي، فيديو، قصيدة مكتوبة أو صورة مخطوطة — اختر فنّك وسيحصل عملك على بطاقته الخاصة في المعرض.
        </p>
        <div className="card mt-8 p-6 sm:p-8">
          <UploadForm defaultType={user.artType} />
        </div>
      </div>
    </ArtCanvas>
  );
}
