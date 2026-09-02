import Link from "next/link";
import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { BadgePercent, PencilLine, Plus, Power, Trash2, X } from "lucide-react";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { ConfirmSubmit } from "@/components/client-actions";
import { deleteOfferAction, saveOfferAction, toggleOfferAction } from "@/actions/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "إدارة العروض" };

type SP = Promise<Record<string, string | string[] | undefined>>;

const dtLocal = (d: Date | null) =>
  d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";

export default async function AdminOffersPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const editId = typeof sp.edit === "string" ? sp.edit : "";
  const list = await db.select().from(offers).orderBy(desc(offers.createdAt));
  const editing = list.find((o) => o.id === editId) ?? null;
  const now = new Date();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="title-display text-2xl sm:text-3xl">العروض</h1>
        <p className="mt-1 text-sm text-sand">عروض الخصم التي تظهر للمستخدمين في صفحة العروض والرئيسية.</p>
      </div>

      {/* النموذج */}
      <form action={saveOfferAction} className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="title-display flex items-center gap-2 text-lg">
            {editing ? <PencilLine className="text-gold" size={18} /> : <Plus className="text-gold" size={18} />}
            {editing ? `تعديل: ${editing.title}` : "عرض جديد"}
          </h2>
          {editing && (
            <Link href="/admin/offers" className="btn btn-ghost btn-sm">
              <X size={13} /> إلغاء التعديل
            </Link>
          )}
        </div>
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="title">عنوان العرض</label>
            <input id="title" name="title" required className="input" defaultValue={editing?.title} placeholder="مثال: خصم رمضان الكريم" />
          </div>
          <div>
            <label className="label" htmlFor="discount">الخصم / القيمة</label>
            <input id="discount" name="discount" className="input" defaultValue={editing?.discount} placeholder="خصم 25٪ / ورشة مجانية" />
          </div>
          <div>
            <label className="label" htmlFor="code">كود الخصم</label>
            <input id="code" name="code" className="input font-mono" dir="ltr" defaultValue={editing?.code} placeholder="FUNOON25" />
          </div>
          <div>
            <label className="label" htmlFor="expiresAt">تاريخ الانتهاء (اختياري)</label>
            <input id="expiresAt" name="expiresAt" type="datetime-local" className="input" dir="ltr" defaultValue={dtLocal(editing?.expiresAt ?? null)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="description">الوصف</label>
          <textarea id="description" name="description" rows={3} className="input resize-y" defaultValue={editing?.description} placeholder="تفاصيل العرض: على ماذا ينطبق، وكيف يُستخدم الكود…" />
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" name="active" defaultChecked={editing ? editing.active : true} className="size-4 accent-[#d9a648]" />
          عرض نشط (يظهر للمستخدمين فورًا)
        </label>
        <button type="submit" className="btn btn-gold">
          {editing ? "حفظ التعديلات" : "نشر العرض"}
        </button>
      </form>

      {/* الجدول */}
      <div className="card overflow-x-auto">
        <table className="table-base min-w-175">
          <thead>
            <tr>
              <th>العرض</th>
              <th>الكود</th>
              <th>الحالة</th>
              <th>ينتهي</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => {
              const expired = o.expiresAt ? o.expiresAt <= now : false;
              return (
                <tr key={o.id}>
                  <td>
                    <p className="font-medium text-paper">{o.title}</p>
                    <p className="text-[11px] text-sand">{o.discount}</p>
                  </td>
                  <td><span className="font-mono text-xs text-gold-2" dir="ltr">{o.code || "—"}</span></td>
                  <td>
                    {expired ? (
                      <span className="chip border-line-strong bg-white/5 text-sand">منتهٍ</span>
                    ) : o.active ? (
                      <span className="chip border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
                        <BadgePercent size={11} /> نشط
                      </span>
                    ) : (
                      <span className="chip border-line-strong bg-white/5 text-sand">موقوف</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-xs text-sand">{o.expiresAt ? formatDate(o.expiresAt) : "بلا تاريخ"}</td>
                  <td>
                    <div className="flex gap-1.5">
                      <form action={toggleOfferAction}>
                        <input type="hidden" name="id" value={o.id} />
                        <button className="btn btn-ghost btn-sm" title={o.active ? "إيقاف" : "تفعيل"}>
                          <Power size={13} />
                        </button>
                      </form>
                      <Link href={`/admin/offers?edit=${o.id}`} className="btn btn-ghost btn-sm" title="تعديل">
                        <PencilLine size={13} />
                      </Link>
                      <form action={deleteOfferAction}>
                        <input type="hidden" name="id" value={o.id} />
                        <ConfirmSubmit label={<Trash2 size={13} />} confirm="حذف نهائيًا؟" />
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-8 text-center text-sm text-sand">لا توجد عروض بعد — أنشئ أول عرض من النموذج بالأعلى.</p>}
      </div>
    </div>
  );
}
