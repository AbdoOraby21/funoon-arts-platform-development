import type { Metadata } from "next";
import { desc, ilike, or } from "drizzle-orm";
import { Ban, Crown, Search, ShieldOff, UserRound } from "lucide-react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { LEVELS, artMeta, levelMeta } from "@/lib/art";
import { cn, formatDate, initials } from "@/lib/utils";
import { ConfirmSubmit } from "@/components/client-actions";
import { TypeChip } from "@/components/ui";
import { moderateUserAction } from "@/actions/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "إدارة المستخدمين" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminUsersPage({ searchParams }: { searchParams: SP }) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const list = await db
    .select()
    .from(users)
    .where(q ? or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(60);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="title-display text-2xl sm:text-3xl">المستخدمون</h1>
          <p className="mt-1 text-sm text-sand">{list.length} مستخدمًا {q ? `للبحث «${q}»` : ""} — حظر، صلاحيات، ومستويات.</p>
        </div>
        <form action="/admin/users" method="get" className="flex items-center gap-2" role="search">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sand" />
            <input name="q" defaultValue={q} placeholder="اسم أو بريد…" className="input w-56 ps-9" />
          </div>
          <button type="submit" className="btn btn-gold btn-sm">بحث</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base min-w-225">
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>الفن</th>
              <th>المستوى</th>
              <th>الدور</th>
              <th>الحالة</th>
              <th>انضم</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => {
              const isMe = u.id === admin.id;
              return (
                <tr key={u.id} className={cn(u.banned && "opacity-60")}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span
                        className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-coal"
                        style={{ background: artMeta(u.artType).color }}
                      >
                        {initials(u.name)}
                      </span>
                      <div>
                        <p className="whitespace-nowrap font-medium text-paper">{u.name}{isMe && " (أنت)"}</p>
                        <p className="text-[11px] text-sand" dir="ltr">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><TypeChip type={u.artType} /></td>
                  <td>
                    {isMe ? (
                      <span className="text-xs text-sand">—</span>
                    ) : (
                      <div className="flex items-center gap-1" title={levelMeta(u.level).ar}>
                        {LEVELS.map((l) => (
                          <form key={l.key} action={moderateUserAction}>
                            <input type="hidden" name="userId" value={u.id} />
                            <input type="hidden" name="op" value={`level:${l.key}`} />
                            <button
                              type="submit"
                              title={`تعيين: ${l.ar}`}
                              aria-label={`تعيين مستوى ${u.name} إلى ${l.ar}`}
                              className={cn(
                                "size-3.5 rounded-full border transition-transform hover:scale-125",
                                u.level === l.key && "ring-2 ring-offset-2 ring-offset-surface",
                              )}
                              style={{
                                background: l.color,
                                borderColor: l.color,
                                ["--tw-ring-color" as never]: l.color,
                              }}
                            />
                          </form>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    {u.role === "admin" ? (
                      <span className="chip border-gold/50 bg-gold/15 text-gold-2">
                        <Crown size={11} /> إدارة
                      </span>
                    ) : (
                      <span className="chip border-line-strong bg-white/5 text-sand">
                        <UserRound size={11} /> مستخدم
                      </span>
                    )}
                  </td>
                  <td>
                    {u.banned ? (
                      <span className="chip border-danger/50 bg-danger/10 text-danger">محظور</span>
                    ) : (
                      <span className="chip border-emerald-400/40 bg-emerald-400/10 text-emerald-300">نشط</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-xs text-sand">{formatDate(u.createdAt)}</td>
                  <td>
                    {!isMe && (
                      <div className="flex flex-wrap gap-1.5">
                        <form action={moderateUserAction}>
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="op" value={u.banned ? "unban" : "ban"} />
                          {u.banned ? (
                            <button className="btn btn-ghost btn-sm" title="إلغاء الحظر">
                              <ShieldOff size={13} /> فك الحظر
                            </button>
                          ) : (
                            <ConfirmSubmit
                              label={<span className="inline-flex items-center gap-1"><Ban size={12} /> حظر</span>}
                              confirm="تأكيد الحظر؟"
                            />
                          )}
                        </form>
                        <form action={moderateUserAction}>
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="op" value={u.role === "admin" ? "make-user" : "make-admin"} />
                          <button className="btn btn-ghost btn-sm">
                            {u.role === "admin" ? "إلى مستخدم" : "إلى إدارة"}
                          </button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-8 text-center text-sm text-sand">لا نتائج مطابقة.</p>}
      </div>
    </div>
  );
}
