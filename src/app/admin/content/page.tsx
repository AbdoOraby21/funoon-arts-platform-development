import Link from "next/link";
import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { GraduationCap, Layers, PencilLine, Plus, Ticket, Trash2, Users2, X } from "lucide-react";
import { db } from "@/db";
import { courses, workshops } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { bookingCounts, enrollmentCounts } from "@/lib/queries";
import { ART_TYPES, LEVELS } from "@/lib/art";
import { formatDateTime } from "@/lib/utils";
import { ConfirmSubmit } from "@/components/client-actions";
import { LevelBadge, TypeChip } from "@/components/ui";
import {
  deleteCourseAction,
  deleteWorkshopAction,
  saveCourseAction,
  saveWorkshopAction,
} from "@/actions/admin";
import ModulesBuilder from "./modules-builder";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "إدارة الورش والكورسات" };

type SP = Promise<Record<string, string | string[] | undefined>>;

const dtLocal = (d: Date | null) =>
  d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";

export default async function AdminContentPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const kind = sp.kind === "course" ? "course" : "workshop";
  const id = typeof sp.id === "string" ? sp.id : "";

  const [wsList, cList] = await Promise.all([
    db.select().from(workshops).orderBy(desc(workshops.startsAt)),
    db.select().from(courses).orderBy(desc(courses.createdAt)),
  ]);
  const bookings = await bookingCounts(wsList.map((w) => w.id));
  const enrolls = await enrollmentCounts(cList.map((c) => c.id));

  const editWs = kind === "workshop" ? wsList.find((w) => w.id === id) ?? null : null;
  const editCourse = kind === "course" ? cList.find((c) => c.id === id) ?? null : null;

  return (
    <div className="space-y-14">
      <div>
        <h1 className="title-display text-2xl sm:text-3xl">الورش والكورسات</h1>
        <p className="mt-1 text-sm text-sand">برامج التعلم: ورش مباشرة ومسجلة، وكورسات بوحدات فيديو وقراءات وتمارين.</p>
      </div>

      {/* ================================ الورش ================================ */}
      <section className="space-y-5">
        <h2 className="title-display flex items-center gap-2 text-xl">
          <Ticket className="text-gold" size={19} /> الورش
        </h2>

        <form action={saveWorkshopAction} className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="title-display flex items-center gap-2 text-base">
              {editWs ? <PencilLine className="text-gold" size={16} /> : <Plus className="text-gold" size={16} />}
              {editWs ? `تعديل: ${editWs.title}` : "ورشة جديدة"}
            </h3>
            {editWs && (
              <Link href="/admin/content" className="btn btn-ghost btn-sm">
                <X size={13} /> إلغاء
              </Link>
            )}
          </div>
          {editWs && <input type="hidden" name="id" value={editWs.id} />}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="label">العنوان</label>
              <input name="title" required className="input" defaultValue={editWs?.title} placeholder="مثال: أسرار الضوء في البورتريه" />
            </div>
            <div>
              <label className="label">الفن</label>
              <select name="artType" className="input" defaultValue={editWs?.artType ?? "painting"}>
                {ART_TYPES.map((t) => <option key={t.key} value={t.key}>{t.ar}</option>)}
              </select>
            </div>
            <div>
              <label className="label">النوع</label>
              <select name="mode" className="input" defaultValue={editWs?.mode ?? "live"}>
                <option value="live">مباشرة</option>
                <option value="recorded">مسجلة</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="label">الوصف</label>
              <input name="description" className="input" defaultValue={editWs?.description} placeholder="ماذا سيخرج المشترك متقنًا؟" />
            </div>
            <div>
              <label className="label">المدرّب</label>
              <input name="instructor" className="input" defaultValue={editWs?.instructor} placeholder="اسم الفنان" />
            </div>
            <div>
              <label className="label">المكان</label>
              <input name="location" className="input" defaultValue={editWs?.location ?? "أونلاين"} />
            </div>
            <div>
              <label className="label">الموعد</label>
              <input name="startsAt" type="datetime-local" className="input" dir="ltr" defaultValue={dtLocal(editWs?.startsAt ?? null)} />
            </div>
            <div>
              <label className="label">السعة (مقاعد)</label>
              <input name="capacity" type="number" min={1} className="input" defaultValue={editWs?.capacity ?? 30} />
            </div>
            <div className="lg:col-span-2">
              <label className="label">رابط الفيديو (للمسجلة)</label>
              <input name="videoUrl" className="input" dir="ltr" defaultValue={editWs?.videoUrl} placeholder="https://…" />
            </div>
          </div>
          <button type="submit" className="btn btn-gold">
            {editWs ? "حفظ التعديلات" : "إضافة الورشة"}
          </button>
        </form>

        <div className="card overflow-x-auto">
          <table className="table-base min-w-200">
            <thead>
              <tr>
                <th>الورشة</th>
                <th>الفن</th>
                <th>النوع</th>
                <th>الموعد</th>
                <th>الحجوزات</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {wsList.map((w) => (
                <tr key={w.id}>
                  <td className="max-w-56">
                    <p className="truncate font-medium text-paper">{w.title}</p>
                    <p className="truncate text-[11px] text-sand">{w.instructor} — {w.location}</p>
                  </td>
                  <td><TypeChip type={w.artType} /></td>
                  <td>
                    <span className="chip border-line-strong bg-white/5 text-sand">
                      {w.mode === "live" ? "مباشرة" : "مسجلة"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-xs text-sand">{formatDateTime(w.startsAt)}</td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <Users2 size={12} className="text-gold" />
                      {bookings[w.id] ?? 0} / {w.capacity}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      <Link href={`/admin/content?kind=workshop&id=${w.id}`} className="btn btn-ghost btn-sm" title="تعديل">
                        <PencilLine size={13} />
                      </Link>
                      <form action={deleteWorkshopAction}>
                        <input type="hidden" name="id" value={w.id} />
                        <ConfirmSubmit label={<Trash2 size={13} />} confirm="حذف وحذف حجوزاتها؟" />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {wsList.length === 0 && <p className="p-8 text-center text-sm text-sand">لا ورش بعد.</p>}
        </div>
      </section>

      {/* ================================ الكورسات ================================ */}
      <section className="space-y-5">
        <h2 className="title-display flex items-center gap-2 text-xl">
          <GraduationCap className="text-gold" size={19} /> الكورسات
        </h2>

        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="title-display flex items-center gap-2 text-base">
              {editCourse ? <PencilLine className="text-gold" size={16} /> : <Plus className="text-gold" size={16} />}
              {editCourse ? `تعديل: ${editCourse.title}` : "كورس جديد"}
            </h3>
            {editCourse && (
              <Link href="/admin/content" className="btn btn-ghost btn-sm">
                <X size={13} /> إلغاء
              </Link>
            )}
          </div>
          <ModulesBuilder action={saveCourseAction} course={editCourse} />
        </div>

        <div className="card overflow-x-auto">
          <table className="table-base min-w-200">
            <thead>
              <tr>
                <th>الكورس</th>
                <th>الفن</th>
                <th>المستوى</th>
                <th>السعر</th>
                <th>الوحدات</th>
                <th>المشتركون</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {cList.map((c) => (
                <tr key={c.id}>
                  <td className="max-w-56">
                    <p className="truncate font-medium text-paper">{c.title}</p>
                    <p className="truncate text-[11px] text-sand">{c.instructor}</p>
                  </td>
                  <td><TypeChip type={c.artType} /></td>
                  <td><LevelBadge level={c.level} /></td>
                  <td className="whitespace-nowrap text-xs">{c.price > 0 ? `${c.price} ج.م` : "مجاني"}</td>
                  <td className="text-center">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Layers size={12} className="text-gold" /> {c.modules.length}
                    </span>
                  </td>
                  <td className="text-center text-xs">{enrolls[c.id] ?? 0}</td>
                  <td>
                    {c.published ? (
                      <span className="chip border-emerald-400/40 bg-emerald-400/10 text-emerald-300">منشور</span>
                    ) : (
                      <span className="chip border-line-strong bg-white/5 text-sand">مسودة</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      <Link href={`/admin/content?kind=course&id=${c.id}`} className="btn btn-ghost btn-sm" title="تعديل">
                        <PencilLine size={13} />
                      </Link>
                      <form action={deleteCourseAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <ConfirmSubmit label={<Trash2 size={13} />} confirm="حذف الكورس واشتراكاته؟" />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cList.length === 0 && <p className="p-8 text-center text-sm text-sand">لا كورسات بعد.</p>}
        </div>
      </section>
    </div>
  );
}
