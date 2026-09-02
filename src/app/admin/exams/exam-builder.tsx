"use client";

import { useState } from "react";
import { FileUp, Plus, Save, Trash2 } from "lucide-react";
import type { Exam, ExamQuestion } from "@/db/schema";
import { ART_TYPES } from "@/lib/art";
import { saveExamAction } from "@/actions/admin";

const emptyQuestion = (): ExamQuestion => ({
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
});

export default function ExamBuilder({ exam }: { exam: Exam | null }) {
  const [questions, setQuestions] = useState<ExamQuestion[]>(
    exam?.questions?.length ? exam.questions : [emptyQuestion()],
  );
  const [practical, setPractical] = useState(exam?.practicalRequired ?? false);

  const update = (i: number, patch: Partial<ExamQuestion>) =>
    setQuestions((qs) => qs.map((q, qi) => (qi === i ? { ...q, ...patch } : q)));

  const updateOption = (i: number, oi: number, value: string) =>
    setQuestions((qs) =>
      qs.map((q, qi) => (qi === i ? { ...q, options: q.options.map((o, ooi) => (ooi === oi ? value : o)) } : q)),
    );

  return (
    <form action={saveExamAction} className="space-y-5">
      {exam && <input type="hidden" name="id" value={exam.id} />}
      <input type="hidden" name="questionsJson" value={JSON.stringify(questions)} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="etitle">عنوان الاختبار</label>
          <input id="etitle" name="title" required className="input" defaultValue={exam?.title} placeholder="مثال: أساسيات الألوان المائية" />
        </div>
        <div>
          <label className="label" htmlFor="eart">الفن</label>
          <select id="eart" name="artType" className="input" defaultValue={exam?.artType ?? "painting"}>
            {ART_TYPES.map((t) => (
              <option key={t.key} value={t.key}>{t.ar}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="edesc">الوصف</label>
          <input id="edesc" name="description" className="input" defaultValue={exam?.description} placeholder="ماذا يقيس هذا الاختبار؟" />
        </div>
        <div>
          <label className="label" htmlFor="edur">المدة (دقائق)</label>
          <input id="edur" name="durationMin" type="number" min={3} className="input" defaultValue={exam?.durationMin ?? 15} />
        </div>
      </div>

      {/* الأسئلة */}
      <div className="space-y-4 rounded-xl border hairline bg-coal/40 p-4">
        <p className="text-sm font-bold text-gold-2">الأسئلة (اختيار من متعدد)</p>
        {questions.map((q, i) => (
          <div key={i} className="space-y-2.5 rounded-xl border hairline bg-surface p-4">
            <div className="flex items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-gold/15 font-display text-xs font-black text-gold-2">
                {i + 1}
              </span>
              <input
                className="input"
                placeholder="نص السؤال…"
                value={q.question}
                onChange={(e) => update(i, { question: e.target.value })}
                required
              />
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setQuestions((qs) => qs.filter((_, qi) => qi !== i))}
                  className="btn btn-danger btn-sm shrink-0"
                  title="حذف السؤال"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${i}`}
                    checked={q.correctIndex === oi}
                    onChange={() => update(i, { correctIndex: oi })}
                    className="size-4 shrink-0 accent-[#d9a648]"
                    title="الإجابة الصحيحة"
                    aria-label={`الخيار ${oi + 1} هو الإجابة الصحيحة`}
                  />
                  <input
                    className="input"
                    placeholder={`الخيار ${oi + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(i, oi, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-sand/70">حدّد دائرة الخيار الصحيح بجانب نصّه.</p>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}
          className="btn btn-ghost btn-sm w-full"
        >
          <Plus size={14} /> أضف سؤالًا آخر
        </button>
      </div>

      {/* التسليم العملي */}
      <div className="space-y-3 rounded-xl border hairline bg-coal/40 p-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold text-gold-2">
          <input
            type="checkbox"
            name="practicalRequired"
            checked={practical}
            onChange={(e) => setPractical(e.target.checked)}
            className="size-4 accent-[#d9a648]"
          />
          <FileUp size={15} />
          يتطلب تسليمًا عمليًا (يراجعه المدرّب يدويًا)
        </label>
        {practical && (
          <textarea
            name="practicalPrompt"
            rows={2}
            className="input resize-y"
            defaultValue={exam?.practicalPrompt ?? ""}
            placeholder="المطلوب من الطالب عمليًا: مثال «ارفع لوحة بثلاثة ألوان مائية فقط على ورق A4»"
          />
        )}
      </div>

      <button type="submit" className="btn btn-gold">
        <Save size={15} />
        {exam ? "حفظ التعديلات" : "نشر الاختبار"}
      </button>
    </form>
  );
}
