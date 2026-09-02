"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Clock3,
  FileUp,
  PartyPopper,
  RotateCcw,
  SendHorizonal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Exam } from "@/db/schema";
import { submitExamAction, type ExamResult } from "@/actions/exam";
import { artMeta, levelMeta } from "@/lib/art";
import { cn, pad2 } from "@/lib/utils";
import { LevelBadge, TypeChip } from "@/components/ui";

type Stage = "intro" | "quiz" | "practical" | "result";

export default function ExamClient({
  exam,
  userLevel,
  bestScore,
}: {
  exam: Exam;
  userLevel: string;
  bestScore: number | null;
}) {
  const router = useRouter();
  const meta = artMeta(exam.artType);
  const questions = useMemo(() => exam.questions, [exam.questions]);

  const [stage, setStage] = useState<Stage>("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [seconds, setSeconds] = useState(0);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    if (stage !== "quiz") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [stage]);

  const answeredAll = answers.every((a) => a !== null);
  const q = questions[idx];

  const submit = async () => {
    setBusy(true);
    const res = await submitExamAction({
      examId: exam.id,
      answers: answers.map((a) => a ?? -1),
      practicalDataUrl: fileData,
      note,
    });
    setBusy(false);
    setResult(res);
    setStage("result");
    router.refresh();
  };

  /* ------------------------------ شاشة النتيجة ------------------------------ */
  if (stage === "result" && result) {
    if (result.error) {
      return (
        <div className="card p-8 text-center">
          <AlertCircle className="mx-auto text-danger" size={40} />
          <p className="mt-4 text-danger">{result.error}</p>
          <button onClick={() => setStage("quiz")} className="btn btn-ghost mt-6">العودة للاختبار</button>
        </div>
      );
    }
    const score = result.score ?? 0;
    const r = 58;
    const c = 2 * Math.PI * r;
    const achieved = result.level ?? "beginner";
    const leveledUp = levelMeta(achieved).rank > levelMeta(userLevel).rank;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="card relative overflow-hidden p-8 text-center sm:p-12"
      >
        <div
          className="pointer-events-none absolute -top-16 start-1/2 size-56 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{ background: meta.color }}
        />
        <PartyPopper className="mx-auto text-gold" size={36} />
        <h1 className="title-display mt-3 text-2xl sm:text-3xl">انتهى الاختبار!</h1>

        {/* حلقة النتيجة */}
        <div className="relative mx-auto mt-8 size-40">
          <svg viewBox="0 0 140 140" className="size-full -rotate-90">
            <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(233,219,188,0.1)" strokeWidth="10" />
            <motion.circle
              cx="70" cy="70" r={r} fill="none"
              stroke={meta.color}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: c * (1 - score / 100) }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div>
              <p className="title-display text-4xl" style={{ color: meta.color }}>{score}٪</p>
              <p className="text-xs text-sand">{result.correct} من {result.total} إجابة صحيحة</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-sand">مستواك المقترح:</span>
          <LevelBadge level={achieved} />
          {result.status === "pending" && (
            <span className="chip border-gold/40 bg-gold/10 text-gold-2">التسليم العملي قيد مراجعة المدرّب</span>
          )}
        </div>
        {leveledUp && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-gold-2">
            <BadgeCheck size={16} />
            مبارك! تمت ترقية مستواك في ملفّك تلقائيًا.
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => { setStage("intro"); setAnswers(questions.map(() => null)); setIdx(0); setSeconds(0); setResult(null); setFileData(null); setNote(""); }} className="btn btn-ghost">
            <RotateCcw size={15} /> محاولة جديدة
          </button>
          <button onClick={() => router.push("/profile")} className="btn btn-gold">
            الذهاب إلى ملفي
          </button>
        </div>
      </motion.div>
    );
  }

  /* ------------------------------ شاشة التعريف ------------------------------ */
  if (stage === "intro") {
    return (
      <div className="card relative overflow-hidden p-8 sm:p-10">
        <div
          className="pointer-events-none absolute -top-20 end-[-40px] size-52 rounded-full opacity-20 blur-3xl"
          style={{ background: meta.color }}
        />
        <TypeChip type={exam.artType} />
        <h1 className="title-display mt-4 text-2xl leading-10 sm:text-3xl">{exam.title}</h1>
        <p className="mt-3 max-w-lg text-sm leading-8 text-sand">{exam.description}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border hairline bg-coal/50 p-4">
            <p className="text-xs text-sand">الأسئلة</p>
            <p className="title-display mt-1 text-xl">{questions.length}</p>
          </div>
          <div className="rounded-xl border hairline bg-coal/50 p-4">
            <p className="text-xs text-sand">المدة التقريبية</p>
            <p className="title-display mt-1 text-xl">{exam.durationMin} د</p>
          </div>
          <div className="rounded-xl border hairline bg-coal/50 p-4">
            <p className="text-xs text-sand">تسليم عملي</p>
            <p className="title-display mt-1 text-xl">{exam.practicalRequired ? "مطلوب" : "لا يوجد"}</p>
          </div>
        </div>

        {bestScore !== null && (
          <p className="mt-4 text-sm text-sand">
            أفضل نتيجة سابقة لك: <span className="font-bold text-gold-2">{bestScore}٪</span>
          </p>
        )}

        <div className="mt-7 rounded-xl border border-gold/30 bg-gold/5 p-4 text-xs leading-6 text-sand">
          <p className="font-bold text-gold-2">تعليمات</p>
          أجب على كل الأسئلة ثم سلّم. التصحيح فوري، والترقية تلقائية عند ٦٠٪ (متوسط) و٨٠٪ (متقدم).
          {exam.practicalRequired && " بعد الأسئلة سيطلب منك رفع عملك العملي."}
        </div>

        <button onClick={() => setStage("quiz")} className="btn btn-gold mt-7 w-full sm:w-auto">
          ابدأ الآن
          <ArrowLeft size={16} />
        </button>
      </div>
    );
  }

  /* ------------------------------ مرحلة الأسئلة ------------------------------ */
  if (stage === "quiz" && q) {
    const progress = ((idx + 1) / questions.length) * 100;
    return (
      <div>
        {/* شريط الحالة */}
        <div className="mb-5 flex items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full rounded-full"
              style={{ background: meta.color }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="chip border-line-strong bg-white/5 text-sand">
            <Clock3 size={12} />
            <span dir="ltr" className="font-mono">{pad2(Math.floor(seconds / 60))}:{pad2(seconds % 60)}</span>
          </span>
          <span className="text-xs text-sand">سؤال {idx + 1} من {questions.length}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.28 }}
            className="card p-7 sm:p-9"
          >
            <h2 className="title-display text-lg leading-9 sm:text-xl">{q.question}</h2>
            <div className="mt-6 grid gap-2.5" role="radiogroup" aria-label="خيارات الإجابة">
              {q.options.map((opt, oi) => {
                const selected = answers[idx] === oi;
                return (
                  <button
                    key={oi}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setAnswers((a) => a.map((x, i) => (i === idx ? oi : x)))}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-right text-sm transition-all",
                      selected
                        ? "border-gold bg-gold/10 font-bold text-paper"
                        : "border-line-strong bg-coal/40 text-paper/80 hover:border-sand/50 hover:bg-white/4",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-bold",
                        selected ? "border-gold bg-gold text-coal" : "border-line-strong text-sand",
                      )}
                    >
                      {["أ", "ب", "ج", "د"][oi] ?? oi + 1}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="btn btn-ghost btn-sm"
          >
            <ArrowRight size={14} /> السابق
          </button>
          {idx < questions.length - 1 ? (
            <button
              onClick={() => setIdx((i) => i + 1)}
              disabled={answers[idx] === null}
              className="btn btn-gold btn-sm"
            >
              التالي <ArrowLeft size={14} />
            </button>
          ) : (
            <button
              onClick={() => (exam.practicalRequired ? setStage("practical") : submit())}
              disabled={!answeredAll || busy}
              className="btn btn-gold btn-sm"
            >
              {exam.practicalRequired ? "مرحلة التسليم العملي" : "تسليم الإجابات"}
              <SendHorizonal size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------ مرحلة التسليم العملي ------------------------------ */
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-7 sm:p-9">
      <span className="chip border-gold/40 bg-gold/10 text-gold-2">
        <FileUp size={13} /> التسليم العملي
      </span>
      <h2 className="title-display mt-4 text-xl leading-9">أرِنا تطبيقك العملي</h2>
      <p className="mt-2 text-sm leading-8 text-sand">{exam.practicalPrompt ?? "ارفع عملًا يُظهر مهارتك في هذا الفن."}</p>

      <label
        htmlFor="practical"
        className={cn(
          "mt-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          fileData ? "border-gold/60 bg-gold/5" : "border-line-strong bg-coal/40 hover:border-gold/50",
        )}
      >
        <FileUp size={28} className="text-gold" />
        <span className="text-sm font-medium">{fileName || "اختر ملفًا (صورة/صوت/فيديو حتى 3MB)"}</span>
        <input
          id="practical"
          type="file"
          accept="image/*,audio/*,video/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 3 * 1024 * 1024) {
              alert("الملف أكبر من 3MB — اختر ملفًا أصغر لبيئة المعاينة.");
              return;
            }
            const reader = new FileReader();
            reader.onload = () => setFileData(String(reader.result));
            reader.readAsDataURL(f);
            setFileName(f.name);
          }}
        />
      </label>

      <div className="mt-4">
        <label htmlFor="note" className="label">ملاحظة للمقيّم (اختياري)</label>
        <textarea
          id="note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="الأدوات المستخدمة، الفكرة، مدة التنفيذ…"
          className="input resize-y"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => setStage("quiz")} className="btn btn-ghost">
          <ArrowRight size={15} /> راجع الأسئلة
        </button>
        <button onClick={submit} disabled={busy || (!fileData && !note.trim() && exam.practicalRequired)} className="btn btn-gold">
          <SendHorizonal size={15} />
          {busy ? "جارٍ التسليم والتصحيح…" : "تسليم الاختبار نهائيًا"}
        </button>
      </div>
    </motion.div>
  );
}
