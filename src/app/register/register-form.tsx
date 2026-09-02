"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, MessageSquareText, ShieldCheck, UserPlus } from "lucide-react";
import { ART_TYPES } from "@/lib/art";
import { registerStartAction, resendOtpAction, verifyOtpAction } from "@/actions/auth";

export default function RegisterForm({ next }: { next: string }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [artType, setArtType] = useState("painting");
  const [startState, startAction, startPending] = useActionState(registerStartAction, null);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyOtpAction, null);
  const [resendState, resendAction, resendPending] = useActionState(resendOtpAction, null);

  useEffect(() => {
    if (startState?.ok) setStep(2);
  }, [startState]);

  const demoCode = resendState?.demoCode ?? startState?.demoCode;

  if (step === 2) {
    return (
      <form action={verifyAction} className="mt-7 space-y-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="code" className="label">كود التحقق المرسل إلى هاتفك</label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            placeholder="••••••"
            className="input text-center font-mono text-2xl tracking-[0.5em]"
            dir="ltr"
          />
        </div>

        {demoCode && (
          <p className="flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3.5 py-2.5 text-sm text-gold-2">
            <MessageSquareText size={15} />
            وضع المعاينة — لا يوجد مزوّد SMS فعلي، كودك هو:
            <span className="font-mono font-bold tracking-widest" dir="ltr">{demoCode}</span>
          </p>
        )}
        {verifyState?.error && (
          <p role="alert" className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            <AlertCircle size={15} /> {verifyState.error}
          </p>
        )}

        <button type="submit" disabled={verifyPending} className="btn btn-gold w-full">
          <ShieldCheck size={16} />
          {verifyPending ? "جارٍ التحقق…" : "تفعيل الحساب والدخول"}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            formAction={resendAction}
            disabled={resendPending}
            className="text-gold-2 hover:underline"
          >
            {resendPending ? "يُعاد الإرسال…" : "إعادة إرسال الكود"}
          </button>
          <button type="button" onClick={() => setStep(1)} className="text-sand hover:text-paper">
            تعديل البيانات
          </button>
        </div>
      </form>
    );
  }

  return (
    <form action={startAction} className="mt-7 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">الاسم الكامل</label>
          <input id="name" name="name" required minLength={2} placeholder="مثال: سارة الحكيم" className="input" />
        </div>
        <div>
          <label htmlFor="phone" className="label">رقم الهاتف (لاستقبال الكود)</label>
          <input id="phone" name="phone" type="tel" required placeholder="05xxxxxxxx" className="input" dir="ltr" />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="label">البريد الإلكتروني</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="input"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password" className="label">كلمة المرور</label>
        <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="٦ أحرف على الأقل" className="input" dir="ltr" />
      </div>

      <fieldset>
        <legend className="label">فنّك الأقرب إلى قلبك</legend>
        <input type="hidden" name="artType" value={artType} />
        <div className="flex flex-wrap gap-2">
          {ART_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setArtType(t.key)}
              aria-pressed={artType === t.key}
              className="chip cursor-pointer transition-transform hover:scale-105"
              style={
                artType === t.key
                  ? { color: t.color, borderColor: t.color, background: t.soft }
                  : { color: "var(--color-sand)", borderColor: "var(--color-line-strong)", background: "rgba(255,255,255,0.04)" }
              }
            >
              <t.Icon size={13} />
              {t.ar}
            </button>
          ))}
        </div>
      </fieldset>

      {startState?.error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          <AlertCircle size={15} /> {startState.error}
        </p>
      )}

      <button type="submit" disabled={startPending} className="btn btn-gold w-full">
        {startPending ? "جارٍ إرسال الكود…" : (
          <span className="inline-flex items-center gap-2">
            متابعة
            <ArrowLeft size={16} />
            <UserPlus size={16} />
          </span>
        )}
      </button>
    </form>
  );
}
