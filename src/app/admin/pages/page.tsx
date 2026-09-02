import Link from "next/link";
import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { Eye, FileText, PencilLine, Plus, Trash2, X } from "lucide-react";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { ConfirmSubmit } from "@/components/client-actions";
import { deletePageAction, savePageAction, togglePageAction } from "@/actions/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "إدارة الصفحات" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminPagesPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const editId = typeof sp.edit === "string" ? sp.edit : "";
  const list = await db.select().from(pages).orderBy(desc(pages.updatedAt));
  const editing = list.find((p) => p.id === editId) ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="title-display text-2xl sm:text-3xl">صفحات الموقع</h1>
        <p className="mt-1 text-sm text-sand">
          محتوى الصفحات الثابتة (من نحن، الشروط، الخصوصية…) — تُعرض على المسار <span className="font-mono text-xs" dir="ltr">/p/الاسم-اللاتيني</span>.
        </p>
      </div>

      <form action={savePageAction} className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="title-display flex items-center gap-2 text-lg">
            {editing ? <PencilLine className="text-gold" size={18} /> : <Plus className="text-gold" size={18} />}
            {editing ? `تعديل: ${editing.title}` : "صفحة جديدة"}
          </h2>
          {editing && (
            <Link href="/admin/pages" className="btn btn-ghost btn-sm">
              <X size={13} /> إلغاء التعديل
            </Link>
          )}
        </div>
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="title">عنوان الصفحة</label>
            <input id="title" name="title" required className="input" defaultValue={editing?.title} placeholder="من نحن" />
          </div>
          <div>
            <label className="label" htmlFor="slug">الاسم اللاتيني (slug)</label>
            <input id="slug" name="slug" required className="input font-mono" dir="ltr" defaultValue={editing?.slug} placeholder="about" pattern="[a-z0-9-]+" title="حروف إنجليزية صغيرة وأرقام وشرطات فقط" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="content">المحتوى</label>
          <textarea id="content" name="content" rows={9} className="input resize-y leading-8" defaultValue={editing?.content} placeholder="اكتب محتوى الصفحة هنا…" />
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" name="published" defaultChecked={editing ? editing.published : true} className="size-4 accent-[#d9a648]" />
          منشورة (مرئية للزوار)
        </label>
        <button type="submit" className="btn btn-gold">
          <FileText size={15} />
          {editing ? "حفظ التعديلات" : "حفظ الصفحة"}
        </button>
      </form>

      <div className="card overflow-x-auto">
        <table className="table-base min-w-150">
          <thead>
            <tr>
              <th>الصفحة</th>
              <th>المسار</th>
              <th>الحالة</th>
              <th>آخر تحديث</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td className="font-medium text-paper">{p.title}</td>
                <td><span className="font-mono text-xs text-sand" dir="ltr">/p/{p.slug}</span></td>
                <td>
                  {p.published ? (
                    <span className="chip border-emerald-400/40 bg-emerald-400/10 text-emerald-300">منشورة</span>
                  ) : (
                    <span className="chip border-line-strong bg-white/5 text-sand">مسودة</span>
                  )}
                </td>
                <td className="whitespace-nowrap text-xs text-sand">{formatDate(p.updatedAt)}</td>
                <td>
                  <div className="flex gap-1.5">
                    {p.published && (
                      <Link href={`/p/${p.slug}`} className="btn btn-ghost btn-sm" title="معاينة">
                        <Eye size={13} />
                      </Link>
                    )}
                    <form action={togglePageAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="btn btn-ghost btn-sm">{p.published ? "إخفاء" : "نشر"}</button>
                    </form>
                    <Link href={`/admin/pages?edit=${p.id}`} className="btn btn-ghost btn-sm" title="تعديل">
                      <PencilLine size={13} />
                    </Link>
                    <form action={deletePageAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmSubmit label={<Trash2 size={13} />} confirm="حذف نهائيًا؟" />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-8 text-center text-sm text-sand">لا توجد صفحات بعد.</p>}
      </div>
    </div>
  );
}
