"use client";

import { useState } from "react";
import { BookOpen, Dumbbell, PlayCircle, Plus, Save, Trash2 } from "lucide-react";
import type { Course, CourseModule } from "@/db/schema";
import { ART_TYPES, LEVELS } from "@/lib/art";

const KINDS: { key: CourseModule["kind"]; label: string; Icon: typeof PlayCircle }[] = [
  { key: "video", label: "فيديو", Icon: PlayCircle },
  { key: "reading", label: "قراءة", Icon: BookOpen },
  { key: "exercise", label: "تمرين", Icon: Dumbbell },
];

const emptyModule = (): CourseModule => ({ title: "", kind: "video", body: "", videoUrl: "", durationMin: 10 });

export default function ModulesBuilder({
  action,
  course,
}: {
  action: (fd: FormData) => Promise<void>;
  course: Course | null;
}) {
  const [modules, setModules] = useState<CourseModule[]>(
    course?.modules?.length ? course.modules : [emptyModule()],
  );

  const update = (i: number, patch: Partial<CourseModule>) =>
    setModules((ms) => ms.map((m, mi) => (mi === i ? { ...m, ...patch } : m)));

  return (
    <form action={action} className="space-y-5">
      {course && <input type="hidden" name="id" value={course.id} />}
      <input type="hidden" name="modulesJson" value={JSON.stringify(modules)} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className="label">عنوان الكورس</label>
          <input name="title" required className="input" defaultValue={course?.title} placeholder="مثال: المقامات العربية للمبتدئين" />
        </div>
        <div>
          <label className="label">الفن</label>
          <select name="artType" className="input" defaultValue={course?.artType ?? "painting"}>
            {ART_TYPES.map((t) => <option key={t.key} value={t.key}>{t.ar}</option>)}
          </select>
        </div>
        <div>
          <label className="label">المستوى</label>
          <select name="level" className="input" defaultValue={course?.level ?? "beginner"}>
            {LEVELS.map((l) => <option key={l.key} value={l.key}>{l.ar}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="label">الوصف</label>
          <input name="description" className="input" defaultValue={course?.description} placeholder="لماذا هذا الكورس مختلف؟" />
        </div>
        <div>
          <label className="label">السعر (ج.م — 0 = مجاني)</label>
          <input name="price" type="number" min={0} className="input" defaultValue={course?.price ?? 0} />
        </div>
        <div>
          <label className="label">المدرّب</label>
          <input name="instructor" className="input" defaultValue={course?.instructor} placeholder="اسم الفنان" />
        </div>
      </div>

      {/* الوحدات */}
      <div className="space-y-4 rounded-xl border hairline bg-coal/40 p-4">
        <p className="text-sm font-bold text-gold-2">وحدات الكورس</p>
        {modules.map((m, i) => (
          <div key={i} className="space-y-3 rounded-xl border hairline bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-gold/15 font-display text-xs font-black text-gold-2">
                {i + 1}
              </span>
              <input
                className="input flex-1"
                placeholder="عنوان الوحدة…"
                value={m.title}
                onChange={(e) => update(i, { title: e.target.value })}
                required
              />
              <div className="flex gap-1">
                {KINDS.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update(i, { kind: key })}
                    aria-pressed={m.kind === key}
                    className="chip cursor-pointer"
                    style={
                      m.kind === key
                        ? { color: "#ecc97e", borderColor: "#d9a648", background: "rgba(217,166,72,0.14)" }
                        : { color: "var(--color-sand)", borderColor: "var(--color-line-strong)", background: "rgba(255,255,255,0.04)" }
                    }
                  >
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>
              {modules.length > 1 && (
                <button
                  type="button"
                  onClick={() => setModules((ms) => ms.filter((_, mi) => mi !== i))}
                  className="btn btn-danger btn-sm shrink-0"
                  title="حذف الوحدة"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <input
                className="input"
                placeholder="رابط الفيديو (يوتيوب أو ملف — اختياري)"
                dir="ltr"
                value={m.videoUrl ?? ""}
                onChange={(e) => update(i, { videoUrl: e.target.value })}
              />
              <input
                className="input"
                type="number"
                min={0}
                placeholder="الدقائق"
                value={m.durationMin ?? 0}
                onChange={(e) => update(i, { durationMin: parseInt(e.target.value || "0", 10) })}
              />
            </div>
            <textarea
              className="input resize-y leading-7"
              rows={2}
              placeholder="محتوى الوحدة: شرح نصي، نبذة، أو نص التمرين…"
              value={m.body}
              onChange={(e) => update(i, { body: e.target.value })}
            />
          </div>
        ))}
        <button type="button" onClick={() => setModules((ms) => [...ms, emptyModule()])} className="btn btn-ghost btn-sm w-full">
          <Plus size={14} /> أضف وحدة
        </button>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <input type="checkbox" name="published" defaultChecked={course ? course.published : true} className="size-4 accent-[#d9a648]" />
        منشور (يظهر في صفحة الكورسات)
      </label>

      <button type="submit" className="btn btn-gold">
        <Save size={15} />
        {course ? "حفظ التعديلات" : "نشر الكورس"}
      </button>
    </form>
  );
}
